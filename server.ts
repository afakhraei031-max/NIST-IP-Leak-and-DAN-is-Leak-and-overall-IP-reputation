/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NetLeakGuard Pro - Express Backend Server
 * Provides real client IP reflection, DNS resolution probe endpoints,
 * tokenized DNS leak session tracking, and multi-source GeoIP lookups.
 */

import express, { Request, Response } from 'express';
import dns from 'node:dns';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyIPUsageAndVPN, evaluateIPReputation } from './src/services/networkAudit.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory tokenized DNS leak test registry
interface DnsSession {
  sessionId: string;
  createdAt: number;
  clientIp?: string;
  observedResolvers: Array<{
    ip: string;
    source: string;
    timestamp: number;
  }>;
}
const activeDnsSessions = new Map<string, DnsSession>();

// Cleanup stale sessions (> 15 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of activeDnsSessions.entries()) {
    if (now - session.createdAt > 15 * 60 * 1000) {
      activeDnsSessions.delete(key);
    }
  }
}, 60 * 1000);

// Helper: Extract real client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// 1. Client Direct Reflection Probe
app.get('/api/client-probe', (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';
  const countryHeader = req.headers['cf-ipcountry'] as string | undefined;

  let configuredDns: string[] = [];
  try {
    configuredDns = dns.getServers();
  } catch (err) {
    configuredDns = [];
  }

  res.json({
    clientIp,
    remoteFamily: req.socket.remoteFamily || (clientIp.includes(':') ? 'IPv6' : 'IPv4'),
    countryHeader: countryHeader || null,
    userAgent,
    headers: {
      host: req.headers.host,
      'accept-language': req.headers['accept-language'],
      'sec-ch-ua-platform': req.headers['sec-ch-ua-platform']
    },
    systemResolvers: configuredDns,
    timestamp: new Date().toISOString()
  });
});

// 2. DNS Leak Session Initializer
app.post('/api/dns-leak/init', (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const sessionId = `dns_${Date.now()}_${randomSuffix}`;

  activeDnsSessions.set(sessionId, {
    sessionId,
    createdAt: Date.now(),
    clientIp,
    observedResolvers: []
  });

  res.json({
    sessionId,
    probeHostPattern: `${sessionId}.leak-test.local`,
    createdAt: Date.now()
  });
});

// 3. DNS Probe & DoH Validation
app.get('/api/dns-leak/probe', async (req: Request, res: Response) => {
  const { sessionId } = req.query;
  const clientIp = getClientIp(req);

  const resolversReport: Array<{
    ip: string;
    isp?: string;
    country?: string;
    countryCode?: string;
    city?: string;
    asn?: string;
    isKnownPublicDoH?: boolean;
    source: string;
  }> = [];

  try {
    // 1. Fetch system configured resolvers
    const systemServers = dns.getServers();
    for (const server of systemServers) {
      if (server && !resolversReport.some(r => r.ip === server)) {
        resolversReport.push({
          ip: server,
          isp: 'System Configured Resolver',
          source: 'Host System Resolver',
          isKnownPublicDoH: server === '1.1.1.1' || server === '8.8.8.8' || server === '9.9.9.9'
        });
      }
    }

    // 2. Query Cloudflare DoH endpoint to see egress resolver
    try {
      const dohResponse = await fetch('https://cloudflare-dns.com/dns-query?name=whoami.cloudflare&type=TXT', {
        headers: { Accept: 'application/dns-json' },
        signal: AbortSignal.timeout(3000)
      });
      if (dohResponse.ok) {
        const dohData = await dohResponse.json() as any;
        if (dohData.Answer && Array.isArray(dohData.Answer)) {
          const txtVal = dohData.Answer[0]?.data?.replace(/"/g, '');
          if (txtVal) {
            resolversReport.push({
              ip: txtVal,
              isp: 'Cloudflare 1.1.1.1 Secure DoH',
              country: 'Anycast Global',
              countryCode: 'XX',
              source: 'DNS-over-HTTPS (DoH)',
              isKnownPublicDoH: true
            });
          }
        }
      }
    } catch (e) {
      // DoH timeout or blocked
    }

    // Record to session if provided
    if (typeof sessionId === 'string' && activeDnsSessions.has(sessionId)) {
      const sess = activeDnsSessions.get(sessionId)!;
      resolversReport.forEach(r => {
        sess.observedResolvers.push({
          ip: r.ip,
          source: r.source,
          timestamp: Date.now()
        });
      });
    }

    res.json({
      success: true,
      sessionId: sessionId || null,
      resolvers: resolversReport,
      clientObservedIp: clientIp,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'DNS probe failed'
    });
  }
});

// 4. Multi-Source GeoIP Lookup Proxy
app.get('/api/geoip-lookup', async (req: Request, res: Response) => {
  let targetIp = (req.query.ip as string) || getClientIp(req);

  // Normalize localhost
  if (targetIp === '::1' || targetIp === '127.0.0.1' || targetIp.startsWith('fe80:')) {
    targetIp = '';
  }

  try {
    // Primary: ipwho.is (CORS friendly, no rate limit for light use, provides ASN and org)
    const ipwhoisUrl = targetIp ? `https://ipwho.is/${targetIp}` : 'https://ipwho.is/';
    const response = await fetch(ipwhoisUrl, { signal: AbortSignal.timeout(4000) });

    if (response.ok) {
      const data = await response.json() as any;
      if (data.success !== false) {
        const security = data.security || {};
        const isp = data.connection?.isp || data.connection?.org || 'Unknown';
        const org = data.connection?.org || 'Unknown';
        const asn = data.connection?.asn ? `AS${data.connection.asn}` : 'Unknown';
        const isProxyOrVpn = Boolean(security.vpn || security.proxy || security.tor || security.hosting);
        const usageType = classifyIPUsageAndVPN(
          { isp, org, asn },
          { vpn: security.vpn, proxy: security.proxy, tor: security.tor, hosting: security.hosting }
        );
        const reputation = evaluateIPReputation(
          { isp, org, asn },
          { vpn: security.vpn, proxy: security.proxy, tor: security.tor, hosting: security.hosting }
        );

        return res.json({
          ip: data.ip || targetIp,
          source: 'ipwhois.io',
          country: data.country || 'Unknown',
          countryCode: data.country_code || 'XX',
          region: data.region || 'Unknown',
          city: data.city || 'Unknown',
          isp,
          org,
          asn,
          timezone: data.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone,
          isProxyOrVpn,
          confidenceScore: 95,
          usageType,
          reputation
        });
      }
    }

    // Secondary fallback: ipapi.co
    const fallbackUrl = targetIp ? `https://ipapi.co/${targetIp}/json/` : 'https://ipapi.co/json/';
    const fbResponse = await fetch(fallbackUrl, { signal: AbortSignal.timeout(4000) });
    if (fbResponse.ok) {
      const fbData = await fbResponse.json() as any;
      if (!fbData.error) {
        const isp = fbData.org || 'Unknown';
        const org = fbData.org || 'Unknown';
        const asn = fbData.asn || 'Unknown';
        const usageType = classifyIPUsageAndVPN({ isp, org, asn });
        const reputation = evaluateIPReputation({ isp, org, asn });

        return res.json({
          ip: fbData.ip || targetIp,
          source: 'ipapi.co',
          country: fbData.country_name || 'Unknown',
          countryCode: fbData.country_code || 'XX',
          region: fbData.region || 'Unknown',
          city: fbData.city || 'Unknown',
          isp,
          org,
          asn,
          timezone: fbData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          isProxyOrVpn: usageType.isVpnLikely,
          confidenceScore: 90,
          usageType,
          reputation
        });
      }
    }

    // Final fallback: return minimal info
    res.json({
      ip: targetIp || 'Unknown',
      source: 'Local Server Fallback',
      country: 'موقعیت نامشخص',
      countryCode: 'XX',
      region: 'نامشخص',
      city: 'نامشخص',
      isp: 'ارائه‌دهنده ثبت‌نشده',
      org: 'نامشخص',
      asn: 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      confidenceScore: 40
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve GeoIP data',
      details: err.message
    });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NetLeakGuard Pro] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
