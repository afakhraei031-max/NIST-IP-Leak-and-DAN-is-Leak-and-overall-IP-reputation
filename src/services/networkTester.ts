/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NetLeakGuard Pro - Network Diagnostic Engine
 * Conducts live multi-source public IP detection, WebRTC ICE candidate gathering,
 * real DNS resolver probing, and VPN consistency analysis.
 */

import {
  classifyIP,
  parseIceCandidateString,
  evaluateWebRTCLeak,
  evaluateDNSLeak,
  auditVPNAndProxyConsistency,
  calculateSecurityScore,
  WebRTCCandidate,
  WebRTCLeakResult,
  DNSLeakResult,
  DNSResolverInfo,
  GeoIPRecord,
  VPNAuditResult,
  TestStatus
} from './networkAudit.ts';

export interface DiagnosticProgress {
  stepIndex: number;
  totalSteps: number;
  percentage: number;
  currentTaskFa: string;
  currentTaskEn: string;
}

export interface NetworkDiagnosticReport {
  id: string;
  timestamp: string;
  durationMs: number;
  osInfo: {
    platform: string;
    userAgent: string;
    browserLanguage: string;
    screenResolution: string;
  };
  ipv4: {
    address: string | null;
    available: boolean;
    sources: Array<{ name: string; ip: string; latencyMs: number }>;
    status: TestStatus;
    statusLabelFa: string;
    discrepancyNoteFa?: string;
  };
  ipv6: {
    address: string | null;
    available: boolean;
    sources: Array<{ name: string; ip: string }>;
    status: TestStatus;
    statusLabelFa: string;
    explanationFa: string;
  };
  webrtc: WebRTCLeakResult;
  dns: DNSLeakResult;
  geoip: GeoIPRecord | null;
  vpnAudit: VPNAuditResult;
  overallScore: {
    score: number;
    verdictFa: string;
    verdictEn: string;
  };
  sha256EvidenceHash: string;
}

export interface UserVpnConfig {
  isVpnExpectedActive: boolean;
  expectedCountryCode?: string;
  expectedCountryName?: string;
  expectedIpPrefix?: string;
  expectedDnsServer?: string;
}

// Fetch helper with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 1. Detect IPv4 from multiple independent providers
export async function detectIPv4(): Promise<{
  address: string | null;
  sources: Array<{ name: string; ip: string; latencyMs: number }>;
  discrepancy?: string;
}> {
  const sources: Array<{ name: string; ip: string; latencyMs: number }> = [];

  // Probe 1: Local Backend reflection
  try {
    const start = performance.now();
    const res = await fetchWithTimeout('/api/client-probe', {}, 3000);
    if (res.ok) {
      const data = await res.json();
      if (data.clientIp && data.clientIp !== '127.0.0.1' && data.clientIp !== '::1' && !data.clientIp.includes(':')) {
        sources.push({
          name: 'سرور مستقیم اپلیکیشن (Direct Probe)',
          ip: data.clientIp,
          latencyMs: Math.round(performance.now() - start)
        });
      }
    }
  } catch (e) {
    // Ignore probe error
  }

  // Probe 2: ipify IPv4
  try {
    const start = performance.now();
    const res = await fetchWithTimeout('https://api.ipify.org?format=json', {}, 3500);
    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        sources.push({
          name: 'سرویس مستقل ipify.org',
          ip: data.ip,
          latencyMs: Math.round(performance.now() - start)
        });
      }
    }
  } catch (e) {
    // Ignore fallback failure
  }

  // Probe 3: Cloudflare Trace
  try {
    const start = performance.now();
    const res = await fetchWithTimeout('https://1.1.1.1/cdn-cgi/trace', {}, 3500);
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/ip=([^\n]+)/);
      if (match && match[1]) {
        const ip = match[1].trim();
        if (!ip.includes(':')) {
          sources.push({
            name: 'کلودفلر (Cloudflare Edge)',
            ip,
            latencyMs: Math.round(performance.now() - start)
          });
        }
      }
    }
  } catch (e) {
    // Ignore fallback failure
  }

  if (sources.length === 0) {
    return { address: null, sources: [] };
  }

  const primaryIp = sources[0].ip;
  const distinctIps = Array.from(new Set(sources.map(s => s.ip)));

  let discrepancy: string | undefined;
  if (distinctIps.length > 1) {
    discrepancy = `اختلاف در نتایج ارائه‌دهندگان: ${distinctIps.join(' و ')}. این اختلاف ممکن است ناشی از مسیریابی چندمسیره یا پروکسی آبشاری باشد.`;
  }

  return { address: primaryIp, sources, discrepancy };
}

// 2. Detect IPv6
export async function detectIPv6(): Promise<{
  address: string | null;
  sources: Array<{ name: string; ip: string }>;
  available: boolean;
  explanationFa: string;
}> {
  const sources: Array<{ name: string; ip: string }> = [];

  // Try ipify IPv6
  try {
    const res = await fetchWithTimeout('https://api6.ipify.org?format=json', {}, 3000);
    if (res.ok) {
      const data = await res.json();
      if (data.ip && data.ip.includes(':')) {
        sources.push({ name: 'api6.ipify.org', ip: data.ip });
      }
    }
  } catch (e) {
    // IPv6 usually fails on v4-only networks
  }

  if (sources.length > 0) {
    return {
      address: sources[0].ip,
      sources,
      available: true,
      explanationFa: 'ارتباط مستقیم IPv6 برقرار است و آدرس عمومی دریافت شد.'
    };
  }

  return {
    address: null,
    sources: [],
    available: false,
    explanationFa: 'ارتباط IPv6 در شبکه شما غیرفعال یا توسط ISP/مودم مسدود است. این وضعیت طبیعی بوده و نشت تلقی نمی‌شود.'
  };
}

// 3. WebRTC ICE Candidates live gathering
export async function gatherWebRTCCandidates(): Promise<WebRTCCandidate[]> {
  if (typeof window === 'undefined' || !window.RTCPeerConnection) {
    return [];
  }

  return new Promise(resolve => {
    const candidates: WebRTCCandidate[] = [];
    let isFinished = false;

    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      try {
        pc.close();
      } catch (e) {}
      resolve(candidates);
    };

    // Stun servers
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' }
      ]
    });

    pc.onicecandidate = event => {
      if (!event.candidate || !event.candidate.candidate) {
        // ICE gathering finished
        finish();
        return;
      }
      const parsed = parseIceCandidateString(event.candidate.candidate);
      if (parsed) {
        // Avoid duplicate address+type
        if (!candidates.some(c => c.address === parsed.address && c.type === parsed.type)) {
          candidates.push(parsed);
        }
      }
    };

    pc.onicecandidateerror = () => {
      // ICE candidate gathering error
    };

    // Create a data channel to trigger candidate collection
    try {
      pc.createDataChannel('netleakguard_probe');
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(() => finish());
    } catch (e) {
      finish();
    }

    // Safety timeout: 3500ms
    setTimeout(finish, 3500);
  });
}

// 4. DNS Probing & Resolver Detection
export async function performDNSProbes(sessionId?: string): Promise<DNSResolverInfo[]> {
  const resolvers: DNSResolverInfo[] = [];

  // Probe via our backend endpoint
  try {
    const url = sessionId ? `/api/dns-leak/probe?sessionId=${encodeURIComponent(sessionId)}` : '/api/dns-leak/probe';
    const res = await fetchWithTimeout(url, {}, 4000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.resolvers)) {
        for (const item of data.resolvers) {
          resolvers.push({
            ip: item.ip,
            isp: item.isp,
            country: item.country || 'Global Anycast',
            countryCode: item.countryCode || 'XX',
            city: item.city,
            asn: item.asn,
            isKnownPublicDoH: item.isKnownPublicDoH
          });
        }
      }
    }
  } catch (e) {
    // Backend probe failed
  }

  // Client-side DoH resolution check using Google Public DNS
  try {
    const start = performance.now();
    const res = await fetchWithTimeout(
      'https://dns.google/resolve?name=whoami.ds.akahelp.net&type=TXT',
      { headers: { Accept: 'application/dns-json' } },
      3000
    );
    if (res.ok) {
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        const ipVal = data.Answer[0]?.data?.replace(/"/g, '').trim();
        if (ipVal && !resolvers.some(r => r.ip === ipVal)) {
          resolvers.push({
            ip: ipVal,
            isp: 'Google Public DNS Recursive Node',
            country: 'Anycast Global',
            countryCode: 'US',
            isKnownPublicDoH: true
          });
        }
      }
    }
  } catch (e) {
    // Optional probe failed
  }

  return resolvers;
}

// 5. GeoIP lookup
export async function lookupGeoIP(ip?: string | null): Promise<GeoIPRecord | null> {
  try {
    const url = ip ? `/api/geoip-lookup?ip=${encodeURIComponent(ip)}` : '/api/geoip-lookup';
    const res = await fetchWithTimeout(url, {}, 4000);
    if (res.ok) {
      const data = await res.json();
      if (!data.error) {
        return data as GeoIPRecord;
      }
    }
  } catch (e) {
    // GeoIP lookup error
  }
  return null;
}

// Helper: Generate SHA256 Evidence Hash for audit integrity
async function generateEvidenceHash(data: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {}
  // Pseudo-hash fallback
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

// Main Test Runner
export async function runFullDiagnostic(
  vpnConfig: UserVpnConfig,
  onProgress: (p: DiagnosticProgress) => void
): Promise<NetworkDiagnosticReport> {
  const startTime = performance.now();
  const testId = `AUDIT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Step 1: Detect IPv4 (0% -> 20%)
  onProgress({
    stepIndex: 1,
    totalSteps: 7,
    percentage: 15,
    currentTaskFa: 'در حال بررسی آدرس IP عمومی IPv4 و ارتباط با چند سرویس مستقل...',
    currentTaskEn: 'Detecting public IPv4 address across independent providers...'
  });
  const ipv4Result = await detectIPv4();

  // Step 2: Detect IPv6 (20% -> 35%)
  onProgress({
    stepIndex: 2,
    totalSteps: 7,
    percentage: 30,
    currentTaskFa: 'در حال بررسی آدرس IP عمومی IPv6 و بررسی دسترسی پروتکل دوگانه...',
    currentTaskEn: 'Testing IPv6 connectivity and public IPv6 address...'
  });
  const ipv6Result = await detectIPv6();

  // Step 3: WebRTC ICE candidate gathering (35% -> 55%)
  onProgress({
    stepIndex: 3,
    totalSteps: 7,
    percentage: 50,
    currentTaskFa: 'در حال اجرای آزمایش نشت WebRTC و گردآوری کاندیدهای STUN/ICE...',
    currentTaskEn: 'Gathering WebRTC ICE candidates and testing STUN reflection...'
  });
  const candidates = await gatherWebRTCCandidates();
  const webrtcResult = evaluateWebRTCLeak(
    candidates,
    ipv4Result.address || undefined,
    vpnConfig.isVpnExpectedActive
  );

  // Step 4: GeoIP enrichment (55% -> 70%)
  onProgress({
    stepIndex: 4,
    totalSteps: 7,
    percentage: 65,
    currentTaskFa: 'در حال شناسایی کشور، شهر تقریبی، ISP، شماره ASN و منطقه زمانی...',
    currentTaskEn: 'Enriching GeoIP, ISP, ASN, and geographic timezone data...'
  });
  const geoipRecord = await lookupGeoIP(ipv4Result.address);

  // Step 5: Real DNS Leak Test (70% -> 85%)
  onProgress({
    stepIndex: 5,
    totalSteps: 7,
    percentage: 80,
    currentTaskFa: 'در حال آزمایش نشت DNS، بررسی ریزالورها و پروتکل DoH...',
    currentTaskEn: 'Probing DNS resolvers and evaluating DNS leak resistance...'
  });
  const dnsResolvers = await performDNSProbes(testId);
  const dnsResult = evaluateDNSLeak(
    dnsResolvers,
    geoipRecord ? { countryCode: geoipRecord.countryCode, isp: geoipRecord.isp } : undefined,
    vpnConfig.expectedCountryCode
  );

  // Step 6: VPN & Proxy Consistency (85% -> 95%)
  onProgress({
    stepIndex: 6,
    totalSteps: 7,
    percentage: 90,
    currentTaskFa: 'در حال ارزیابی سازگاری VPN، تطابق منطقه زمانی و نشت دوگانه...',
    currentTaskEn: 'Auditing VPN & proxy consistency, timezone divergence, and dual-stack...'
  });
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tehran';
  const vpnAuditResult = auditVPNAndProxyConsistency({
    ipv4Geo: geoipRecord,
    ipv6Geo: null,
    webrtcResult,
    dnsResult,
    browserTimezone,
    expectedVpnCountry: vpnConfig.expectedCountryCode,
    expectedVpnIpPrefix: vpnConfig.expectedIpPrefix
  });

  // Step 7: Final Report Compilation (95% -> 100%)
  onProgress({
    stepIndex: 7,
    totalSteps: 7,
    percentage: 100,
    currentTaskFa: 'در حال تولید گزارش نهایی، محاسبه امتیاز امنیتی و امضای شواهد...',
    currentTaskEn: 'Compiling evidence report and cryptographic checksum...'
  });

  const overallScore = calculateSecurityScore({
    hasIpv4: Boolean(ipv4Result.address),
    hasIpv6: ipv6Result.available,
    webrtcStatus: webrtcResult.status,
    dnsStatus: dnsResult.status,
    vpnStatus: vpnAuditResult.status
  });

  const durationMs = Math.round(performance.now() - startTime);

  // Format OS info
  const osInfo = {
    platform: typeof navigator !== 'undefined' ? (navigator as any).userAgentData?.platform || navigator.platform || 'Windows / Android' : 'Unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    browserLanguage: typeof navigator !== 'undefined' ? navigator.language : 'fa-IR',
    screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080'
  };

  const rawEvidenceData = JSON.stringify({
    testId,
    ipv4: ipv4Result.address,
    ipv6: ipv6Result.address,
    webrtcStatus: webrtcResult.status,
    dnsStatus: dnsResult.status,
    vpnStatus: vpnAuditResult.status,
    timestamp: new Date().toISOString()
  });

  const sha256EvidenceHash = await generateEvidenceHash(rawEvidenceData);

  return {
    id: testId,
    timestamp: new Date().toISOString(),
    durationMs,
    osInfo,
    ipv4: {
      address: ipv4Result.address,
      available: Boolean(ipv4Result.address),
      sources: ipv4Result.sources,
      status: ipv4Result.address ? 'PASSED' : 'NOT_PERFORMED',
      statusLabelFa: ipv4Result.address ? 'شناسایی شد' : 'خطا در ارتباط',
      discrepancyNoteFa: ipv4Result.discrepancy
    },
    ipv6: {
      address: ipv6Result.address,
      available: ipv6Result.available,
      sources: ipv6Result.sources,
      status: ipv6Result.available ? 'PASSED' : 'NOT_APPLICABLE',
      statusLabelFa: ipv6Result.available ? 'شناسایی شد' : 'غیرفعال / ناموجود',
      explanationFa: ipv6Result.explanationFa
    },
    webrtc: webrtcResult,
    dns: dnsResult,
    geoip: geoipRecord,
    vpnAudit: vpnAuditResult,
    overallScore,
    sha256EvidenceHash
  };
}
