/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidIPv4,
  isValidIPv6,
  classifyIP,
  parseIceCandidateString,
  evaluateWebRTCLeak,
  evaluateDNSLeak,
  auditVPNAndProxyConsistency,
  calculateSecurityScore,
  classifyIPUsageAndVPN,
  evaluateIPReputation
} from './networkAudit.ts';

test('IPv4 validator accurately distinguishes valid and invalid addresses', () => {
  assert.equal(isValidIPv4('192.168.1.1'), true);
  assert.equal(isValidIPv4('8.8.8.8'), true);
  assert.equal(isValidIPv4('255.255.255.255'), true);
  assert.equal(isValidIPv4('0.0.0.0'), true);
  assert.equal(isValidIPv4('256.1.1.1'), false);
  assert.equal(isValidIPv4('1.2.3'), false);
  assert.equal(isValidIPv4('abc.def.ghi.jkl'), false);
  assert.equal(isValidIPv4(''), false);
});

test('IPv6 validator accurately identifies IPv6 strings', () => {
  assert.equal(isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334'), true);
  assert.equal(isValidIPv6('2001:db8::1'), true);
  assert.equal(isValidIPv6('::1'), true);
  assert.equal(isValidIPv6('fe80::1ff:fe23:4567:890a'), true);
  assert.equal(isValidIPv6('192.168.1.1'), false);
  assert.equal(isValidIPv6('invalid:ipv6::too::many::colons'), false);
});

test('classifyIP correctly identifies public, RFC1918, CGNAT, loopback and mDNS', () => {
  const publicV4 = classifyIP('8.8.8.8');
  assert.equal(publicV4.isPublic, true);
  assert.equal(publicV4.type, 'Public');
  assert.equal(publicV4.version, 'IPv4');

  const rfc1918 = classifyIP('192.168.0.10');
  assert.equal(rfc1918.isPublic, false);
  assert.equal(rfc1918.type, 'RFC1918');

  const rfc1918_10 = classifyIP('10.200.1.1');
  assert.equal(rfc1918_10.type, 'RFC1918');

  const rfc1918_172 = classifyIP('172.20.5.1');
  assert.equal(rfc1918_172.type, 'RFC1918');

  const cgnat = classifyIP('100.64.0.1');
  assert.equal(cgnat.isPublic, false);
  assert.equal(cgnat.type, 'CarrierGradeNAT');

  const loopback = classifyIP('127.0.0.1');
  assert.equal(loopback.type, 'Loopback');

  const mdns = classifyIP('e8f9a2b0-4321-4def-91a2-3b4c5d6e7f8a.local');
  assert.equal(mdns.type, 'mDNS');
  assert.equal(mdns.isPublic, false);

  const ipv6Public = classifyIP('2606:4700:4700::1111');
  assert.equal(ipv6Public.isPublic, true);
  assert.equal(ipv6Public.version, 'IPv6');
});

test('parseIceCandidateString accurately extracts candidate type and addresses', () => {
  const hostStr = 'candidate:1867140788 1 udp 2122260223 192.168.1.105 59234 typ host generation 0';
  const hostCandidate = parseIceCandidateString(hostStr);
  assert.notEqual(hostCandidate, null);
  assert.equal(hostCandidate?.type, 'host');
  assert.equal(hostCandidate?.address, '192.168.1.105');
  assert.equal(hostCandidate?.port, 59234);
  assert.equal(hostCandidate?.classification.type, 'RFC1918');

  const srflxStr = 'candidate:842163049 1 udp 1686052607 198.51.100.5 54321 typ srflx raddr 192.168.1.105 rport 59234';
  const srflxCandidate = parseIceCandidateString(srflxStr);
  assert.notEqual(srflxCandidate, null);
  assert.equal(srflxCandidate?.type, 'srflx');
  assert.equal(srflxCandidate?.address, '198.51.100.5');
  assert.equal(srflxCandidate?.classification.isPublic, true);
});

test('evaluateWebRTCLeak avoids false positives on private RFC1918 addresses', () => {
  const cand1 = parseIceCandidateString('candidate:1 1 udp 2122260223 192.168.1.50 5000 typ host')!;
  const cand2 = parseIceCandidateString('candidate:2 1 udp 2122260223 10.0.0.5 5001 typ host')!;

  const result = evaluateWebRTCLeak([cand1, cand2], '185.220.101.5', true);
  // Must NOT trigger leak just because of local IPs
  assert.equal(result.status, 'PASSED');
  assert.equal(result.isLeakingHomeIP, false);
  assert.equal(result.publicIpsFound.length, 0);
  assert.equal(result.privateIpsFound.length, 2);
});

test('evaluateWebRTCLeak flags leaks when WebRTC exposes public IP different from VPN', () => {
  const vpnExitIp = '185.220.101.5';
  const leakedHomeIp = '2.180.12.34'; // Home ISP IP
  const cand = parseIceCandidateString(`candidate:3 1 udp 1686052607 ${leakedHomeIp} 54321 typ srflx`)!;

  const result = evaluateWebRTCLeak([cand], vpnExitIp, true);
  assert.equal(result.status, 'LEAK_DETECTED');
  assert.equal(result.isLeakingHomeIP, true);
  assert.equal(result.publicIpsFound.includes(leakedHomeIp), true);
});

test('evaluateDNSLeak detects DNS leak when resolver country matches home country rather than VPN', () => {
  const resolvers = [
    { ip: '5.200.1.2', country: 'Iran', countryCode: 'IR', isp: 'MCI Telecom' }
  ];
  const clientGeo = { countryCode: 'IR', isp: 'MCI Telecom' };
  const expectedVpnCountry = 'DE'; // Expected Germany

  const result = evaluateDNSLeak(resolvers, clientGeo, expectedVpnCountry);
  assert.equal(result.status, 'LEAK_DETECTED');
  assert.equal(result.detectedCountries.includes('IR'), true);
});

test('evaluateDNSLeak marks clean when resolvers are in expected country', () => {
  const resolvers = [
    { ip: '1.1.1.1', country: 'Germany', countryCode: 'DE', isp: 'Cloudflare', isKnownPublicDoH: true }
  ];
  const result = evaluateDNSLeak(resolvers, { countryCode: 'IR' }, 'DE');
  assert.equal(result.status, 'PASSED');
});

test('auditVPNAndProxyConsistency detects dual-stack IPv4/IPv6 leak and timezone discrepancy', () => {
  const ipv4Geo = {
    ip: '185.220.101.5',
    source: 'test',
    country: 'Germany',
    countryCode: 'DE',
    region: 'Hesse',
    city: 'Frankfurt',
    isp: 'M247',
    org: 'M247 Ltd',
    asn: 'AS9009',
    timezone: 'Europe/Berlin'
  };

  const ipv6Geo = {
    ip: '2a01:5ec0::1',
    source: 'test',
    country: 'Iran',
    countryCode: 'IR',
    region: 'Tehran',
    city: 'Tehran',
    isp: 'MCI',
    org: 'Mobile Telecommunication Company of Iran',
    asn: 'AS197207'
  };

  const audit = auditVPNAndProxyConsistency({
    ipv4Geo,
    ipv6Geo,
    browserTimezone: 'Asia/Tehran',
    expectedVpnCountry: 'DE'
  });

  assert.equal(audit.dualStackLeak, true);
  assert.equal(audit.status, 'LEAK_DETECTED');
  assert.equal(audit.timeZoneMismatch, true);
  assert.equal(audit.evidenceFa.length > 0, true);
  assert.equal(audit.recommendationsFa.length > 0, true);
});

test('calculateSecurityScore produces proportional scores', () => {
  const perfect = calculateSecurityScore({
    hasIpv4: true,
    hasIpv6: true,
    webrtcStatus: 'PASSED',
    dnsStatus: 'PASSED',
    vpnStatus: 'PASSED'
  });
  assert.equal(perfect.score, 100);

  const critical = calculateSecurityScore({
    hasIpv4: true,
    hasIpv6: false,
    webrtcStatus: 'LEAK_DETECTED',
    dnsStatus: 'LEAK_DETECTED',
    vpnStatus: 'LEAK_DETECTED'
  });
  assert.equal(critical.score <= 15, true);
});

test('classifyIPUsageAndVPN accurately identifies datacenter / VPN connections', () => {
  const datacenterGeo = {
    isp: 'Hetzner Online GmbH',
    org: 'Hetzner Online GmbH',
    asn: 'AS24940'
  };
  const result = classifyIPUsageAndVPN(datacenterGeo);
  assert.equal(result.type, 'datacenter');
  assert.equal(result.isVpnLikely, true);
  assert.equal(result.labelFa.includes('دیتاسنتر'), true);
});

test('classifyIPUsageAndVPN accurately identifies residential ISP connections', () => {
  const residentialGeo = {
    isp: 'MCI (Mobile Telecommunication Company of Iran)',
    org: 'MCI Cellular Broadband',
    asn: 'AS197207'
  };
  const result = classifyIPUsageAndVPN(residentialGeo);
  assert.equal(result.type, 'residential');
  assert.equal(result.isVpnLikely, false);
  assert.equal(result.labelFa.includes('مسکونی'), true);
});

test('classifyIPUsageAndVPN respects security flags for VPN / proxy detection', () => {
  const unknownGeo = {
    isp: 'Generic Network Corp',
    org: 'Network Corp',
    asn: 'AS12345'
  };
  const result = classifyIPUsageAndVPN(unknownGeo, { vpn: true, proxy: false });
  assert.equal(result.type, 'datacenter');
  assert.equal(result.isVpnLikely, true);
  assert.equal(result.vpnConfidence, 'high');
});

test('evaluateIPReputation awards high trust score to clean residential IP for Google & major sites', () => {
  const residentialGeo = {
    isp: 'Comcast Cable Communications',
    org: 'Comcast Consumer Broadband',
    asn: 'AS7922'
  };
  const rep = evaluateIPReputation(residentialGeo);
  assert.equal(rep.riskLevel, 'LOW');
  assert.equal(rep.trustScore.overallTrustScore >= 90, true);
  assert.equal(rep.trustScore.googleAcceptanceRate >= 95, true);
  assert.equal(rep.trustScore.captchaFrictionLevel, 'MINIMAL');
  assert.equal(rep.isGoogleCaptchaRisk, false);
});

test('evaluateIPReputation flags datacenter IP with moderate trust and Google CAPTCHA notice', () => {
  const datacenterGeo = {
    isp: 'DigitalOcean, LLC',
    org: 'DigitalOcean Cloud',
    asn: 'AS14061'
  };
  const rep = evaluateIPReputation(datacenterGeo);
  assert.equal(rep.isGoogleCaptchaRisk, true);
  assert.equal(rep.trustScore.googleAcceptanceRate <= 70, true);
  assert.equal(rep.trustScore.captchaFrictionLevel, 'MODERATE');
});

test('evaluateIPReputation flags Tor / Blacklisted IP with severe risk', () => {
  const torGeo = {
    isp: 'Tor Relay Node Hosting',
    org: 'Tor Project'
  };
  const rep = evaluateIPReputation(torGeo, { tor: true });
  assert.equal(rep.isBlacklisted, true);
  assert.equal(rep.riskLevel, 'HIGH');
  assert.equal(rep.trustScore.overallTrustScore <= 20, true);
  assert.equal(rep.trustScore.captchaFrictionLevel, 'FREQUENT');
});


