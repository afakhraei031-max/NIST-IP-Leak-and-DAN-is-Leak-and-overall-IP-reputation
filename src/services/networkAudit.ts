/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NetLeakGuard Pro - Core Network Audit & Leak Detection Engine
 * Pure logic engine for IP classification, WebRTC ICE evaluation, DNS leak scoring,
 * and VPN/Proxy consistency checks.
 */

export type TestStatus =
  | 'PASSED'          // آزمایش موفق
  | 'WARNING'         // هشدار
  | 'LEAK_DETECTED'   // نشت شناسایی شد
  | 'INCONCLUSIVE'    // نتیجه نامشخص
  | 'NOT_PERFORMED'   // آزمایش انجام نشد
  | 'NOT_APPLICABLE'; // نامرتبط

export interface IPClassification {
  ip: string;
  version: 'IPv4' | 'IPv6' | 'Unknown';
  isValid: boolean;
  isPublic: boolean;
  type:
    | 'Public'
    | 'RFC1918'           // Private (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    | 'Loopback'          // 127.0.0.0/8, ::1
    | 'LinkLocal'         // 169.254.0.0/16, fe80::/10
    | 'CarrierGradeNAT'   // 100.64.0.0/10
    | 'UniqueLocalIPv6'   // fc00::/7
    | 'mDNS'              // .local
    | 'Invalid';
  persianLabel: string;
}

export interface WebRTCCandidate {
  raw: string;
  type: 'host' | 'srflx' | 'relay' | 'prflx' | 'unknown';
  address: string;
  port?: number;
  protocol?: string;
  classification: IPClassification;
}

export interface WebRTCLeakResult {
  status: TestStatus;
  statusLabelFa: string;
  statusLabelEn: string;
  candidates: WebRTCCandidate[];
  publicIpsFound: string[];
  privateIpsFound: string[];
  hasMdnsObfuscation: boolean;
  leakDetailsFa: string;
  leakDetailsEn: string;
  isLeakingHomeIP: boolean;
}

export interface DNSResolverInfo {
  ip: string;
  isp?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  asn?: string;
  isKnownPublicDoH?: boolean;
}

export interface DNSLeakResult {
  status: TestStatus;
  statusLabelFa: string;
  statusLabelEn: string;
  resolvers: DNSResolverInfo[];
  detectedCountries: string[];
  queryId?: string;
  latencyMs?: number;
  explanationFa: string;
  explanationEn: string;
  isDohActive: boolean;
}

export type IPUsageType = 'residential' | 'business' | 'datacenter' | 'unknown';

export interface IPUsageClassification {
  type: IPUsageType;
  labelFa: string;
  labelEn: string;
  descriptionFa: string;
  descriptionEn: string;
  isVpnLikely: boolean;
  vpnConfidence: 'high' | 'medium' | 'low' | 'none';
  evidenceDetailsFa: string[];
}

export interface IPTrustScoreBreakdown {
  overallTrustScore: number; // 0 - 100%
  googleAcceptanceRate: number; // 0 - 100%
  financialServicesRate: number; // 0 - 100%
  streamingServicesRate: number; // 0 - 100%
  captchaFrictionLevel: 'MINIMAL' | 'MODERATE' | 'FREQUENT';
  captchaFrictionFa: string;
  verdictFa: string;
  verdictEn: string;
}

export interface IPReputationResult {
  fraudScore: number; // 0 to 100 (Abuse risk)
  trustScore: IPTrustScoreBreakdown; // 0 to 100% (Major sites acceptance)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskLabelFa: string;
  riskLabelEn: string;
  isBlacklisted: boolean;
  isGoogleCaptchaRisk: boolean;
  categoriesFa: string[];
  googleFlagNoteFa: string;
  evidenceFa: string[];
}

export interface GeoIPRecord {
  ip: string;
  source: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  asn: string;
  timezone?: string;
  isProxyOrVpn?: boolean;
  confidenceScore?: number; // 0-100
  usageType?: IPUsageClassification;
  reputation?: IPReputationResult;
}

export interface VPNAuditResult {
  status: TestStatus;
  statusLabelFa: string;
  statusLabelEn: string;
  timeZoneMismatch: boolean;
  browserTimezone: string;
  ipTimezone?: string;
  dualStackLeak: boolean;
  dnsCountryMismatch: boolean;
  providerDivergence: boolean;
  evidenceFa: string[];
  evidenceEn: string[];
  recommendationsFa: string[];
  recommendationsEn: string[];
}

// ========================
// IP Classification Logic
// ========================

export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && part === num.toString();
  });
}

export function isValidIPv6(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  // Basic robust IPv6 regex matching compressed & full formats
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(trimmed);
}

export function classifyIP(address: string): IPClassification {
  if (!address || typeof address !== 'string') {
    return {
      ip: '',
      version: 'Unknown',
      isValid: false,
      isPublic: false,
      type: 'Invalid',
      persianLabel: 'نامعتبر'
    };
  }

  const trimmed = address.trim();

  // mDNS check (.local hostname)
  if (trimmed.endsWith('.local') || trimmed.includes('.local')) {
    return {
      ip: trimmed,
      version: 'Unknown',
      isValid: true,
      isPublic: false,
      type: 'mDNS',
      persianLabel: 'شناسه محافظت‌شده mDNS'
    };
  }

  if (isValidIPv4(trimmed)) {
    const octets = trimmed.split('.').map(n => parseInt(n, 10));
    const [o1, o2] = octets;

    // Loopback 127.0.0.0/8
    if (o1 === 127) {
      return {
        ip: trimmed,
        version: 'IPv4',
        isValid: true,
        isPublic: false,
        type: 'Loopback',
        persianLabel: 'آدرس لوپ‌بک محلی (Loopback)'
      };
    }

    // RFC 1918 Private: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    if (
      o1 === 10 ||
      (o1 === 172 && o2 >= 16 && o2 <= 31) ||
      (o1 === 192 && o2 === 168)
    ) {
      return {
        ip: trimmed,
        version: 'IPv4',
        isValid: true,
        isPublic: false,
        type: 'RFC1918',
        persianLabel: 'شبکه محلی خصوصی (RFC 1918)'
      };
    }

    // Link-Local (APIPA): 169.254.0.0/16
    if (o1 === 169 && o2 === 254) {
      return {
        ip: trimmed,
        version: 'IPv4',
        isValid: true,
        isPublic: false,
        type: 'LinkLocal',
        persianLabel: 'آدرس محلی خودکار (Link-Local)'
      };
    }

    // CGNAT 100.64.0.0/10 (100.64.0.0 - 100.127.255.255)
    if (o1 === 100 && o2 >= 64 && o2 <= 127) {
      return {
        ip: trimmed,
        version: 'IPv4',
        isValid: true,
        isPublic: false,
        type: 'CarrierGradeNAT',
        persianLabel: 'NAT اپراتور (CGNAT)'
      };
    }

    return {
      ip: trimmed,
      version: 'IPv4',
      isValid: true,
      isPublic: true,
      type: 'Public',
      persianLabel: 'آدرس عمومی اینترنت (Public IPv4)'
    };
  }

  if (isValidIPv6(trimmed)) {
    const lower = trimmed.toLowerCase();

    // Loopback ::1
    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') {
      return {
        ip: trimmed,
        version: 'IPv6',
        isValid: true,
        isPublic: false,
        type: 'Loopback',
        persianLabel: 'لوپ‌بک محلی IPv6'
      };
    }

    // Link-local fe80::/10
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
      return {
        ip: trimmed,
        version: 'IPv6',
        isValid: true,
        isPublic: false,
        type: 'LinkLocal',
        persianLabel: 'آدرس محلی پیوند (Link-Local fe80::)'
      };
    }

    // Unique Local fc00::/7 (fc00:: and fd00::)
    if (lower.startsWith('fc') || lower.startsWith('fd')) {
      return {
        ip: trimmed,
        version: 'IPv6',
        isValid: true,
        isPublic: false,
        type: 'UniqueLocalIPv6',
        persianLabel: 'آدرس محلی منحصر‌به‌فرد IPv6 (ULA)'
      };
    }

    return {
      ip: trimmed,
      version: 'IPv6',
      isValid: true,
      isPublic: true,
      type: 'Public',
      persianLabel: 'آدرس عمومی اینترنت (Public IPv6)'
    };
  }

  return {
    ip: trimmed,
    version: 'Unknown',
    isValid: false,
    isPublic: false,
    type: 'Invalid',
    persianLabel: 'فرمت آدرس نامعتبر'
  };
}

// ===============================
// WebRTC ICE Evaluation Engine
// ===============================

export function parseIceCandidateString(candidateStr: string): WebRTCCandidate | null {
  if (!candidateStr) return null;
  // Format example:
  // candidate:1867140788 1 udp 2122260223 192.168.1.100 59234 typ host generation 0 ...
  // candidate:842163049 1 udp 1686052607 198.51.100.1 54321 typ srflx raddr 192.168.1.100 rport 59234
  const parts = candidateStr.trim().split(/\s+/);
  if (parts.length < 5) return null;

  let address = '';
  let port: number | undefined;
  let type: 'host' | 'srflx' | 'relay' | 'prflx' | 'unknown' = 'unknown';

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'typ' && i + 1 < parts.length) {
      const candidateType = parts[i + 1].toLowerCase();
      if (['host', 'srflx', 'relay', 'prflx'].includes(candidateType)) {
        type = candidateType as any;
      }
    }
  }

  // Usually parts[4] is the address and parts[5] is the port
  address = parts[4];
  if (parts[5] && /^\d+$/.test(parts[5])) {
    port = parseInt(parts[5], 10);
  }

  const classification = classifyIP(address);

  return {
    raw: candidateStr,
    type,
    address,
    port,
    classification
  };
}

export function evaluateWebRTCLeak(
  candidates: WebRTCCandidate[],
  publicIpExpected?: string,
  isVpnActiveExpected = false
): WebRTCLeakResult {
  if (!candidates || candidates.length === 0) {
    return {
      status: 'NOT_PERFORMED',
      statusLabelFa: 'آزمایش انجام نشد',
      statusLabelEn: 'Not Performed',
      candidates: [],
      publicIpsFound: [],
      privateIpsFound: [],
      hasMdnsObfuscation: false,
      leakDetailsFa: 'هیچ کاندید ICE دریافت نشد؛ ممکن است WebRTC در مرورگر مسدود یا غیرفعال باشد.',
      leakDetailsEn: 'No ICE candidates received; WebRTC may be disabled or blocked in browser.',
      isLeakingHomeIP: false
    };
  }

  const publicIps: string[] = [];
  const privateIps: string[] = [];
  let hasMdns = false;

  for (const cand of candidates) {
    if (cand.classification.type === 'mDNS') {
      hasMdns = true;
    } else if (cand.classification.isPublic) {
      if (!publicIps.includes(cand.address)) {
        publicIps.push(cand.address);
      }
    } else if (cand.classification.type === 'RFC1918' || cand.classification.type === 'CarrierGradeNAT') {
      if (!privateIps.includes(cand.address)) {
        privateIps.push(cand.address);
      }
    }
  }

  // Crucial Security Rule:
  // Having private IP (RFC1918) in WebRTC is NORMAL browser behavior and NOT a public leak!
  // Leak occurs ONLY if:
  // 1. A public IP is found in WebRTC that differs from the expected VPN public IP.
  // 2. OR multiple distinct public IPs are revealed.
  if (publicIps.length === 0) {
    return {
      status: 'PASSED',
      statusLabelFa: 'آزمایش موفق (بدون نشت)',
      statusLabelEn: 'Test Passed (No Leak)',
      candidates,
      publicIpsFound: [],
      privateIpsFound: privateIps,
      hasMdnsObfuscation: hasMdns,
      leakDetailsFa: hasMdns
        ? 'آدرس‌های محلی با فناوری استاندارد mDNS پنهان‌سازی شده‌اند و هیچ IP عمومی نشت نکرده است.'
        : 'فقط آدرس‌های شبکه خصوصی مشاهده شد. آدرس عمومی افشا نشده است.',
      leakDetailsEn: hasMdns
        ? 'Local addresses obfuscated with mDNS. No public IP leaked.'
        : 'Only private addresses detected. No public IP leaked.',
      isLeakingHomeIP: false
    };
  }

  // If user is expected to be on VPN, and WebRTC exposes an IP different from publicIpExpected
  if (isVpnActiveExpected && publicIpExpected && publicIps.some(ip => ip !== publicIpExpected)) {
    return {
      status: 'LEAK_DETECTED',
      statusLabelFa: 'نشت شناسایی شد',
      statusLabelEn: 'Leak Detected',
      candidates,
      publicIpsFound: publicIps,
      privateIpsFound: privateIps,
      hasMdnsObfuscation: hasMdns,
      leakDetailsFa: `هشدار بحرانی: WebRTC آدرس عمومی واقعی (${publicIps.join(', ')}) را افشا کرده که با آدرس خروجی VPN (${publicIpExpected}) مغایرت دارد!`,
      leakDetailsEn: `Critical Warning: WebRTC exposed public IP (${publicIps.join(', ')}) differing from VPN IP (${publicIpExpected})!`,
      isLeakingHomeIP: true
    };
  }

  // If multiple distinct public IPs are found
  if (publicIps.length > 1) {
    return {
      status: 'WARNING',
      statusLabelFa: 'هشدار (چند IP عمومی)',
      statusLabelEn: 'Warning (Multiple Public IPs)',
      candidates,
      publicIpsFound: publicIps,
      privateIpsFound: privateIps,
      hasMdnsObfuscation: hasMdns,
      leakDetailsFa: `بیش از یک آدرس IP عمومی شناسایی شد (${publicIps.join(', ')}). این وضعیت ممکن است نشانگر اتصال همزمان یا نشت رابط باشد.`,
      leakDetailsEn: `Multiple public IPs exposed via WebRTC (${publicIps.join(', ')}). Potential dual-homed leak.`,
      isLeakingHomeIP: false
    };
  }

  // A single public IP matching the expected public IP
  return {
    status: 'PASSED',
    statusLabelFa: 'آزمایش موفق',
    statusLabelEn: 'Test Passed',
    candidates,
    publicIpsFound: publicIps,
    privateIpsFound: privateIps,
    hasMdnsObfuscation: hasMdns,
    leakDetailsFa: 'آدرس عمومی مشاهده‌شده در WebRTC دقیقا مطابق با IP خروجی شبکه است و آدرس مجزایی افشا نشده است.',
    leakDetailsEn: 'Public IP in WebRTC exactly matches external public IP. No alternative IP leaked.',
    isLeakingHomeIP: false
  };
}

// ===============================
// DNS Leak Evaluation Engine
// ===============================

export function evaluateDNSLeak(
  resolvers: DNSResolverInfo[],
  clientPublicGeo?: { countryCode?: string; isp?: string },
  expectedVpnCountryCode?: string
): DNSLeakResult {
  if (!resolvers || resolvers.length === 0) {
    return {
      status: 'NOT_PERFORMED',
      statusLabelFa: 'آزمایش کامل DNS در دسترس نیست',
      statusLabelEn: 'DNS Leak Test Unavailable',
      resolvers: [],
      detectedCountries: [],
      explanationFa: 'پاسخی از ریزالورهای DNS دریافت نشد. برای تست کامل DNS، دسترسی به سرور بررسی نام دامنه الزامی است.',
      explanationEn: 'No responses received from DNS resolvers.',
      isDohActive: false
    };
  }

  const detectedCountries = Array.from(
    new Set(resolvers.map(r => r.countryCode || r.country || '').filter(Boolean))
  );

  const hasKnownDoH = resolvers.some(r => r.isKnownPublicDoH);

  // If user specified an expected VPN country (e.g. DE, NL, US)
  // and any DNS resolver is in client's native home country (e.g. IR), that's a confirmed DNS LEAK!
  if (expectedVpnCountryCode) {
    const expected = expectedVpnCountryCode.trim().toUpperCase();
    const foreignResolvers = resolvers.filter(
      r => r.countryCode && r.countryCode.toUpperCase() !== expected
    );

    if (foreignResolvers.length > 0) {
      // Check if any matches the client's home ISP
      const homeIspLeak = foreignResolvers.some(
        r => clientPublicGeo?.countryCode && r.countryCode === clientPublicGeo.countryCode
      );

      if (homeIspLeak) {
        return {
          status: 'LEAK_DETECTED',
          statusLabelFa: 'نشت نگران‌کننده DNS شناسایی شد',
          statusLabelEn: 'DNS Leak Detected',
          resolvers,
          detectedCountries,
          explanationFa: `درخواست‌های DNS توسط کارگزارانی در کشور مبدا (${foreignResolvers.map(r => r.country).join(', ')}) پاسخ داده شده‌اند؛ در حالی که VPN در کشور ${expected} تنظیم شده است!`,
          explanationEn: `DNS queries answered by resolvers in origin country (${foreignResolvers.map(r => r.country).join(', ')}), while VPN is configured for ${expected}.`,
          isDohActive: hasKnownDoH
        };
      }

      return {
        status: 'WARNING',
        statusLabelFa: 'هشدار عدم انطباق DNS',
        statusLabelEn: 'Warning: DNS Mismatch',
        resolvers,
        detectedCountries,
        explanationFa: `کشور ریزالور DNS (${foreignResolvers.map(r => r.country).join(', ')}) با کشور پیش‌بینی‌شده برای VPN (${expected}) تفاوت دارد. ممکن است از سرویس‌های DNS عمومی (مانند Cloudflare یا Google) استفاده شود.`,
        explanationEn: `DNS resolver country differs from expected VPN country. Public DoH/anycast resolvers may be in use.`,
        isDohActive: hasKnownDoH
      };
    }
  }

  // If multiple countries appear in DNS resolvers
  if (detectedCountries.length > 1) {
    return {
      status: 'WARNING',
      statusLabelFa: 'هشدار (چندگانگی ریزالورها)',
      statusLabelEn: 'Warning (Multiple Resolver Locations)',
      resolvers,
      detectedCountries,
      explanationFa: `درخواست‌های DNS به سرورهایی در چند کشور مختلف (${detectedCountries.join(', ')}) ارسال می‌شوند. این امر ممکن است نشان‌دهنده مسیریابی دوگانه یا کش پراکنده باشد.`,
      explanationEn: `DNS queries route to resolvers across multiple countries (${detectedCountries.join(', ')}).`,
      isDohActive: hasKnownDoH
    };
  }

  return {
    status: 'PASSED',
    statusLabelFa: 'آزمایش موفق',
    statusLabelEn: 'Test Passed',
    resolvers,
    detectedCountries,
    explanationFa: hasKnownDoH
      ? 'پروتکل DNS رمزگذاری‌شده (DoH/DoT) شناسایی شد و هیچ نشت ناخواسته‌ای به ارائه‌دهنده اینترنت محلی مشاهده نشد.'
      : 'کلیه ریزالورهای مشاهده‌شده با موقعیت و خط‌مشی تعریف‌شده شبکه همخوانی دارند.',
    explanationEn: 'Resolvers are consistent with active network routing.',
    isDohActive: hasKnownDoH
  };
}

// ===============================
// VPN & Proxy Compatibility Audit
// ===============================

export function auditVPNAndProxyConsistency(params: {
  ipv4Geo?: GeoIPRecord | null;
  ipv6Geo?: GeoIPRecord | null;
  webrtcResult?: WebRTCLeakResult;
  dnsResult?: DNSLeakResult;
  browserTimezone: string;
  expectedVpnCountry?: string;
  expectedVpnIpPrefix?: string;
}): VPNAuditResult {
  const evidenceFa: string[] = [];
  const evidenceEn: string[] = [];
  const recommendationsFa: string[] = [];
  const recommendationsEn: string[] = [];

  let status: TestStatus = 'PASSED';
  let timeZoneMismatch = false;
  let dualStackLeak = false;
  let dnsCountryMismatch = false;
  let providerDivergence = false;

  const { ipv4Geo, ipv6Geo, webrtcResult, dnsResult, browserTimezone, expectedVpnCountry, expectedVpnIpPrefix } = params;

  // 1. Dual-Stack Leak Check (IPv4 vs IPv6 country mismatch)
  if (ipv4Geo && ipv6Geo) {
    if (ipv4Geo.countryCode && ipv6Geo.countryCode && ipv4Geo.countryCode !== ipv6Geo.countryCode) {
      dualStackLeak = true;
      status = 'LEAK_DETECTED';
      evidenceFa.push(`نشت شدید پروتکل دوگانه: کشور آدرس IPv4 (${ipv4Geo.country}) با کشور آدرس IPv6 (${ipv6Geo.country}) متفاوت است! این یعنی ترافیک IPv6 شما از تونل VPN عبور نکرده است.`);
      evidenceEn.push(`Dual-stack leak: IPv4 country (${ipv4Geo.country}) differs from IPv6 country (${ipv6Geo.country}). IPv6 traffic is bypassing VPN tunnel.`);
      recommendationsFa.push('پروتکل IPv6 را در کارت شبکه ویندوز یا تنظیمات APN اندروید غیرفعال کنید، یا در نرم‌افزار VPN گزینه "IPv6 Leak Protection" را فعال نمایید.');
      recommendationsEn.push('Disable IPv6 in network adapter settings or enable IPv6 Leak Protection in your VPN client.');
    }
  }

  // 2. WebRTC Leak propagation
  if (webrtcResult && webrtcResult.status === 'LEAK_DETECTED') {
    status = 'LEAK_DETECTED';
    evidenceFa.push(`نشت WebRTC شناسایی شد: IP عمومی حقیقی شما (${webrtcResult.publicIpsFound.join(', ')}) از طریق پروتکل STUN مرورگر افشا شده است.`);
    evidenceEn.push(`WebRTC leak detected: Real IP exposed via STUN.`);
    recommendationsFa.push('در مرورگر فایرفاکس عبارت media.peerconnection.enabled را در about:config بر روی false قرار دهید یا در کروم از اکستنشن‌های WebRTC Control استفاده فرمایید.');
    recommendationsEn.push('Disable WebRTC in browser settings or install a WebRTC block extension.');
  }

  // 3. DNS Leak propagation
  if (dnsResult && dnsResult.status === 'LEAK_DETECTED') {
    status = 'LEAK_DETECTED';
    evidenceFa.push(`نشت DNS تایید شد: ریزالورهای پاسخ‌دهنده در کشور مبدا قرار دارند.`);
    evidenceEn.push(`DNS leak confirmed: Resolvers situated in origin country.`);
    recommendationsFa.push('تنظیمات DNS کارت شبکه را روی مقادیر امن (مثل 1.1.1.1 یا 9.9.9.9) قرار دهید یا قابلیت DNS Leak Shield را در VPN روشن کنید.');
    recommendationsEn.push('Configure secure static DNS or enable DNS leak prevention in VPN.');
  }

  // 4. Timezone inconsistency heuristic
  if (ipv4Geo?.timezone && browserTimezone) {
    if (ipv4Geo.timezone !== browserTimezone) {
      timeZoneMismatch = true;
      if (status === 'PASSED') {
        status = 'WARNING';
      }
      evidenceFa.push(`عدم انطباق منطقه زمانی: منطقه زمانی مرورگر (${browserTimezone}) با منطقه زمانی IP (${ipv4Geo.timezone}) همخوانی ندارد. سایت‌های پیشرفته این اختلاف را به عنوان شاخص حضور پشت پروکسی یا VPN شناسایی می‌کنند.`);
      evidenceEn.push(`Timezone mismatch: Browser timezone (${browserTimezone}) does not match IP timezone (${ipv4Geo.timezone}). Sites may flag this as proxy usage.`);
      recommendationsFa.push('در صورت لزوم منطقه زمانی سیستم‌عامل خود را موقتاً با سرور VPN مقصد هماهنگ کنید.');
      recommendationsEn.push('Align system timezone with target VPN exit location if bypassing strict geo-checks.');
    }
  }

  // 5. Expected VPN country / IP check
  if (expectedVpnCountry && ipv4Geo?.countryCode) {
    if (ipv4Geo.countryCode.toUpperCase() !== expectedVpnCountry.toUpperCase()) {
      dnsCountryMismatch = true;
      if (status !== 'LEAK_DETECTED') {
        status = 'WARNING';
      }
      evidenceFa.push(`کشور IP خروجی (${ipv4Geo.country} - ${ipv4Geo.countryCode}) با کشور مورد انتظار شما (${expectedVpnCountry}) تطابق ندارد.`);
      evidenceEn.push(`Exit country does not match expected VPN country.`);
    }
  }

  if (expectedVpnIpPrefix && ipv4Geo?.ip) {
    if (!ipv4Geo.ip.startsWith(expectedVpnIpPrefix)) {
      if (status !== 'LEAK_DETECTED') {
        status = 'WARNING';
      }
      evidenceFa.push(`آدرس IP خروجی (${ipv4Geo.ip}) با پیش‌شماره مورد انتظار (${expectedVpnIpPrefix}) مطابقت ندارد.`);
      evidenceEn.push(`IP does not match expected prefix.`);
    }
  }

  if (evidenceFa.length === 0) {
    evidenceFa.push('تمام بررسی‌های سازگاری VPN، تطابق پروتکل‌ها و مسیریابی بدون خطا و با وضعیت پایدار تایید شد.');
    evidenceEn.push('All VPN consistency checks passed cleanly.');
  }

  const statusLabelFa =
    status === 'PASSED'
      ? 'آزمایش موفق'
      : status === 'LEAK_DETECTED'
      ? 'نشت شناسایی شد'
      : status === 'WARNING'
      ? 'هشدار امنیتی'
      : 'نتیجه نامشخص';

  const statusLabelEn =
    status === 'PASSED'
      ? 'Test Passed'
      : status === 'LEAK_DETECTED'
      ? 'Leak Detected'
      : status === 'WARNING'
      ? 'Security Warning'
      : 'Inconclusive';

  return {
    status,
    statusLabelFa,
    statusLabelEn,
    timeZoneMismatch,
    browserTimezone,
    ipTimezone: ipv4Geo?.timezone,
    dualStackLeak,
    dnsCountryMismatch,
    providerDivergence,
    evidenceFa,
    evidenceEn,
    recommendationsFa,
    recommendationsEn
  };
}

// ===============================
// Overall Security Score Calculation
// ===============================

export function calculateSecurityScore(params: {
  hasIpv4: boolean;
  hasIpv6: boolean;
  webrtcStatus: TestStatus;
  dnsStatus: TestStatus;
  vpnStatus: TestStatus;
}): { score: number; verdictFa: string; verdictEn: string } {
  let score = 100;

  if (params.webrtcStatus === 'LEAK_DETECTED') score -= 35;
  else if (params.webrtcStatus === 'WARNING') score -= 15;

  if (params.dnsStatus === 'LEAK_DETECTED') score -= 35;
  else if (params.dnsStatus === 'WARNING') score -= 15;

  if (params.vpnStatus === 'LEAK_DETECTED') score -= 25;
  else if (params.vpnStatus === 'WARNING') score -= 10;

  if (!params.hasIpv4 && !params.hasIpv6) {
    score = 0;
  }

  score = Math.max(0, Math.min(100, score));

  let verdictFa = 'عالی و ایمن';
  let verdictEn = 'Secure';

  if (score < 50) {
    verdictFa = 'خطر جدی نشت اطلاعات';
    verdictEn = 'Critical Leak Risk';
  } else if (score < 80) {
    verdictFa = 'متوسط - نیازمند توجه و تنظیم';
    verdictEn = 'Moderate - Needs Attention';
  }

  return { score, verdictFa, verdictEn };
}

// ============================================
// IP Usage Type & VPN Heuristics Classifier
// ============================================

export function classifyIPUsageAndVPN(
  geo?: Partial<GeoIPRecord> | null,
  securityFlags?: { vpn?: boolean; proxy?: boolean; tor?: boolean; hosting?: boolean }
): IPUsageClassification {
  if (!geo) {
    return {
      type: 'unknown',
      labelFa: 'نامشخص',
      labelEn: 'Unknown',
      descriptionFa: 'اطلاعات کافی جهت بررسی نوع IP موجود نیست.',
      descriptionEn: 'Insufficient data to classify IP usage type.',
      isVpnLikely: false,
      vpnConfidence: 'none',
      evidenceDetailsFa: []
    };
  }

  const combinedText = `${geo.isp || ''} ${geo.org || ''} ${geo.asn || ''}`.toLowerCase();
  const evidenceDetailsFa: string[] = [];

  // Known Datacenter / Cloud / Hosting ASNs and Providers
  const datacenterKeywords = [
    'hosting', 'cloud', 'server', 'datacenter', 'data center', 'vps', 'dedicated',
    'hetzner', 'm247', 'digitalocean', 'ovh', 'linode', 'choopa', 'datacamp',
    'vultr', 'leaseweb', 'google cloud', 'google llc', 'amazon', 'aws', 'azure',
    'microsoft corp', 'oracle', 'fastly', 'cloudflare', 'akamai', 'cdn',
    'cogent', 'contabo', 'scaleway', 'equinix', 'rackspace', 'zenlayer'
  ];

  // Known Consumer / Residential ISP keywords
  const residentialKeywords = [
    'telecom', 'broadband', 'cable', 'dsl', 'fiber', 'ftth', 'mobile',
    'cellular', 'wireless', 'shatel', 'mci', 'irancell', 'asiatech', 'tci',
    'mokhaberat', 'rightel', 'hiweb', 'fanava', 'parsonline', 'comcast',
    'verizon', 'charter', 'spectrum', 'vodafone', 'deutsche telekom', 'orange',
    'bt ', 'telefonica', 'consumer', 'residential', 'home', 'att internet',
    'cox communications', 'centurylink', 'bell canada', 'rogers'
  ];

  // Known Business / Enterprise keywords
  const businessKeywords = [
    'business', 'enterprise', 'corporate', 'bank', 'university', 'college',
    'ministry', 'government', 'commercial', 'office', 'holding', 'industrial'
  ];

  const hasSecurityFlagVPN = Boolean(securityFlags?.vpn || securityFlags?.proxy || securityFlags?.tor);
  const hasSecurityFlagHosting = Boolean(securityFlags?.hosting);

  const isDatacenterMatch = datacenterKeywords.some(kw => combinedText.includes(kw));
  const isResidentialMatch = residentialKeywords.some(kw => combinedText.includes(kw));
  const isBusinessMatch = businessKeywords.some(kw => combinedText.includes(kw));

  // 1. Datacenter / VPN classification
  if (hasSecurityFlagVPN || hasSecurityFlagHosting || (isDatacenterMatch && !isResidentialMatch)) {
    if (hasSecurityFlagVPN) {
      evidenceDetailsFa.push('پایگاه داده هوش تهدیدات، این آدرس را به عنوان سرور پروکسی یا VPN شناسایی کرده است.');
    }
    if (isDatacenterMatch || hasSecurityFlagHosting) {
      evidenceDetailsFa.push(`این IP متعلق به شبکه سرور یا دیتاسنتر ابری (${geo.isp || geo.org}) است و اشتراک خانگی نیست.`);
    }

    return {
      type: 'datacenter',
      labelFa: 'دیتاسنتر و سرور ابری (میزبانی / VPN)',
      labelEn: 'Datacenter / Hosting / VPN',
      descriptionFa: 'این آدرس متعلق به یک دیتاسنتر یا سرور میزبانی ابری است. از آنجا که کاربران عادی به اینترنت خانگی متصل هستند، خروج ترافیک از سرور دیتاسنتر نشانگر اتصال فعال شما از طریق یک سرویس VPN، تونل یا سرور پروکسی است.',
      descriptionEn: 'This IP belongs to a cloud hosting datacenter. Traffic originating from a datacenter strongly indicates an active VPN tunnel or proxy.',
      isVpnLikely: true,
      vpnConfidence: hasSecurityFlagVPN ? 'high' : 'medium',
      evidenceDetailsFa
    };
  }

  // 2. Business / Corporate classification
  if (isBusinessMatch && !isResidentialMatch) {
    evidenceDetailsFa.push(`این IP به عنوان شبکه سازمانی یا اداری (${geo.isp || geo.org}) ثبت گردیده است.`);
    return {
      type: 'business',
      labelFa: 'تجاری و شرکتی (سازمانی)',
      labelEn: 'Commercial / Business',
      descriptionFa: 'این آدرس متعلق به شبکه یک سازمان، اداره، دانشگاه یا شرکت تجاری است.',
      descriptionEn: 'This IP belongs to a corporate, educational, or commercial enterprise.',
      isVpnLikely: false,
      vpnConfidence: 'low',
      evidenceDetailsFa
    };
  }

  // 3. Residential / Consumer ISP
  if (isResidentialMatch || (!isDatacenterMatch && !isBusinessMatch)) {
    evidenceDetailsFa.push(`این IP در رنج اختصاص داده شده به کاربران خانگی یا تلفن همراه توسط ارائه‌دهنده (${geo.isp || geo.org}) قرار دارد.`);
    return {
      type: 'residential',
      labelFa: 'مسکونی (خانگی / همراه)',
      labelEn: 'Residential / Consumer',
      descriptionFa: 'این آدرس یک IP مسکونی معمولی (اینترنت خانگی، ADSL، فیبر نوری یا اینترنت سیم‌کارت موبایل) است. شما مستقیماً از طریق ارائه‌دهنده خدمات اینترنت محلی متصل هستید و هیچ ردپایی از تونل دیتاسنتری VPN مشاهده نمی‌شود.',
      descriptionEn: 'This IP is a consumer residential or mobile broadband connection without datacenter routing.',
      isVpnLikely: false,
      vpnConfidence: 'none',
      evidenceDetailsFa
    };
  }

  return {
    type: 'unknown',
    labelFa: 'نامشخص / عمومی',
    labelEn: 'Unknown / Generic',
    descriptionFa: 'نوع تخصیص این آدرس به صورت قطعی قابل تفکیک نیست.',
    descriptionEn: 'Unable to definitively classify IP allocation type.',
    isVpnLikely: false,
    vpnConfidence: 'none',
    evidenceDetailsFa: []
  };
}

// ============================================
// IP Reputation & Fraud Risk Evaluator
// ============================================

export function evaluateIPReputation(
  geo?: Partial<GeoIPRecord> | null,
  securityFlags?: { vpn?: boolean; proxy?: boolean; tor?: boolean; hosting?: boolean }
): IPReputationResult {
  if (!geo) {
    return {
      fraudScore: 0,
      trustScore: {
        overallTrustScore: 50,
        googleAcceptanceRate: 50,
        financialServicesRate: 50,
        streamingServicesRate: 50,
        captchaFrictionLevel: 'MODERATE',
        captchaFrictionFa: 'نامشخص',
        verdictFa: 'اطلاعات کافی جهت بررسی پذیرش در سایت‌های بزرگ وجود ندارد.',
        verdictEn: 'Insufficient data'
      },
      riskLevel: 'LOW',
      riskLabelFa: 'نامشخص',
      riskLabelEn: 'Unknown',
      isBlacklisted: false,
      isGoogleCaptchaRisk: false,
      categoriesFa: [],
      googleFlagNoteFa: 'اطلاعات کافی برای بررسی شهرت IP وجود ندارد.',
      evidenceFa: []
    };
  }

  let fraudScore = 5; // Base clean score
  const categoriesFa: string[] = [];
  const evidenceFa: string[] = [];
  let isBlacklisted = false;
  let isGoogleCaptchaRisk = false;

  const combinedText = `${geo.isp || ''} ${geo.org || ''} ${geo.asn || ''}`.toLowerCase();

  // 1. Tor Exit Node Check
  if (securityFlags?.tor || combinedText.includes('tor exit') || combinedText.includes('tor-exit')) {
    fraudScore += 85;
    isBlacklisted = true;
    categoriesFa.push('گره خروجی شبکه تور (Tor Exit Node)');
    evidenceFa.push('این آدرس به عنوان گره خروجی Tor شناسایی شده که در تمام پایگاه‌های داده ضدتقلب و گوگل در بالاترین سطح ریسک قرار دارد.');
  }

  // 2. Public Proxy / Open Relay
  if (securityFlags?.proxy) {
    fraudScore += 45;
    categoriesFa.push('سرور پروکسی عمومی یا رله باز');
    evidenceFa.push('این IP به عنوان پروکسی عمومی یا رله اشتراکی ثبت شده است.');
  }

  // 3. Datacenter / Commercial Hosting
  const isDatacenter = Boolean(
    securityFlags?.hosting ||
    ['m247', 'hetzner', 'digitalocean', 'ovh', 'linode', 'choopa', 'datacamp', 'vultr', 'leaseweb', 'cogent'].some(kw => combinedText.includes(kw))
  );

  if (isDatacenter) {
    fraudScore += 35;
    isGoogleCaptchaRisk = true;
    categoriesFa.push('سرور دیتاسنتر ابری (میزبانی تجاری)');
    evidenceFa.push('گوگل و سرویس‌های حساس مالی (پی‌پال، استرایپ، صرافی‌ها) ترافیک این رنج سرورها را تحت نظر داشته و ممکن است چالش reCAPTCHA یا تایید هویت اجباری درخواست کنند.');
  }

  // 4. Clean Residential Consumer ISP
  const isResidential = ['telecom', 'broadband', 'dsl', 'fiber', 'mobile', 'cellular', 'shatel', 'mci', 'irancell', 'asiatech', 'tci', 'mokhaberat', 'comcast', 'verizon', 'deutsche telekom'].some(kw => combinedText.includes(kw));

  if (isResidential && !isDatacenter && !securityFlags?.tor && !securityFlags?.proxy) {
    fraudScore = Math.min(fraudScore, 5);
    evidenceFa.push('این آدرس متعلق به رنج مشترکین خانگی/موبایل است و در بلک‌لیست‌های ضدکلاهبرداری و اسپم گوگل گزارش منفی ندارد.');
  }

  fraudScore = Math.max(0, Math.min(100, fraudScore));

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let riskLabelFa = 'پاک و معتبر (بدون سوءسابقه)';
  let riskLabelEn = 'Clean / Low Risk';

  if (fraudScore >= 60) {
    riskLevel = 'HIGH';
    riskLabelFa = 'ریسک بالا / احتمال فلگ و مسدودی';
    riskLabelEn = 'High Risk / Potential Blacklist';
    isBlacklisted = true;
  } else if (fraudScore >= 30) {
    riskLevel = 'MEDIUM';
    riskLabelFa = 'ریسک متوسط (دیتاسنتر / کپچای گوگل)';
    riskLabelEn = 'Medium Risk / Cloud Datacenter';
    isGoogleCaptchaRisk = true;
  }

  let googleFlagNoteFa = '';
  let googleAcceptanceRate = 96;
  let financialServicesRate = 95;
  let streamingServicesRate = 94;
  let captchaFrictionLevel: 'MINIMAL' | 'MODERATE' | 'FREQUENT' = 'MINIMAL';
  let captchaFrictionFa = 'حداقلی (بدون چالش reCAPTCHA)';
  let verdictFa = 'مورد تایید و پذیرش بالا در گوگل و سایت‌های معتبر';
  let verdictEn = 'Highly Accepted by Google & Major Sites';

  if (isBlacklisted) {
    googleFlagNoteFa = 'هشدار شدید: این IP دارای سابقه سوءاستفاده یا گزارش اسپم/فیشینگ در سیستم‌های رتبه‌بندی امنیتی است و احتمال مسدودی در گوگل و سرویس‌های پرداخت بسیار بالا است.';
    googleAcceptanceRate = 18;
    financialServicesRate = 8;
    streamingServicesRate = 12;
    captchaFrictionLevel = 'FREQUENT';
    captchaFrictionFa = 'مکرر / مسدود شده توسط فایروال‌های ضدبات';
    verdictFa = 'رد شده / مسدود در سایت‌های بزرگ به دلیل سوءپیشینه یا رله باز';
    verdictEn = 'Rejected / High Block Rate on Major Services';
  } else if (isGoogleCaptchaRisk) {
    googleFlagNoteFa = 'این IP در دیتاسنتر واقع شده و گرچه کلاهبرداری ثبت نشده، اما سیستم‌های ضدبات گوگل (Google reCAPTCHA و Cloudflare Bot Management) احتمالاً از شما چالش تایید هویت می‌خواهند.';
    googleAcceptanceRate = 62;
    financialServicesRate = 48;
    streamingServicesRate = 38;
    captchaFrictionLevel = 'MODERATE';
    captchaFrictionFa = 'متوسط (احتمال بالای درخواست کپچا در گوگل)';
    verdictFa = 'پذیرش مشروط (ترافیک دیتاسنتر/VPN نیازمند تایید هویت)';
    verdictEn = 'Conditional Acceptance (Datacenter / VPN Range)';
  } else {
    googleFlagNoteFa = 'وضعیت کاملاً پاک: این IP هیچ‌گونه گزارش کلاهبرداری، فیشینگ یا نقض قوانین در گوگل، AbuseIPDB و Spamhaus ندارد.';
    googleAcceptanceRate = 98;
    financialServicesRate = 96;
    streamingServicesRate = 95;
    captchaFrictionLevel = 'MINIMAL';
    captchaFrictionFa = 'حداقلی (بدون چالش reCAPTCHA)';
    verdictFa = 'مورد تایید و پذیرش کامل در گوگل و سایت‌های مالی و تجاری بین‌المللی';
    verdictEn = 'Fully Accepted by Google & Global Services';
  }

  const overallTrustScore = Math.round((googleAcceptanceRate * 0.45) + (financialServicesRate * 0.35) + (streamingServicesRate * 0.20));

  const trustScore: IPTrustScoreBreakdown = {
    overallTrustScore,
    googleAcceptanceRate,
    financialServicesRate,
    streamingServicesRate,
    captchaFrictionLevel,
    captchaFrictionFa,
    verdictFa,
    verdictEn
  };

  return {
    fraudScore,
    trustScore,
    riskLevel,
    riskLabelFa,
    riskLabelEn,
    isBlacklisted,
    isGoogleCaptchaRisk,
    categoriesFa,
    googleFlagNoteFa,
    evidenceFa
  };
}


