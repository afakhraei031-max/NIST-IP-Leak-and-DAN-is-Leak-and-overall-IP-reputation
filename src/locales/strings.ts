/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const STRINGS = {
  fa: {
    appTitle: 'NetLeakGuard Pro',
    appSubtitle: 'سامانه پیشرفته تشخیص نشت IP، DNS و WebRTC',
    appBadge: 'نسخه حرفه‌ای ویندوز و اندروید',
    startTest: 'شروع آزمایش کامل',
    runningTest: 'در حال اجرای آزمایش...',
    retest: 'تکرار آزمایش مجدد',
    readyToTest: 'سیستم آماده آغاز ارزیابی امنیتی اتصال شبکه است.',
    systemReady: 'آماده ارزیابی',
    testRunning: 'در حال پردازش',
    testCompleted: 'آزمایش کامل شد',
    viewTechnicalDetails: 'مشاهده جزئیات فنی و شواهد',
    exportReport: 'ذخیره گزارش (PDF / JSON)',
    buildGuide: 'راهنمای ساخت ویندوز و اندروید',
    settings: 'تنظیمات شبکه و VPN',
    language: 'زبان / Language',
    overallScore: 'شاخص امنیت اتصال',
    evidenceHash: 'شناسه یکتا و امضای شواهد (SHA-256):',
    duration: 'زمان اجرا:',
    ms: 'میلی‌ثانیه',

    // Statuses
    statusPassed: 'آزمایش موفق',
    statusWarning: 'هشدار امنیتی',
    statusLeak: 'نشت شناسایی شد',
    statusInconclusive: 'نتیجه نامشخص',
    statusNotPerformed: 'آزمایش انجام نشد',
    statusNotApplicable: 'نامرتبط',

    // Cards
    cardIpv4Title: 'آدرس IP عمومی IPv4',
    cardIpv4Desc: 'بررسی آدرس عمومی IPv4 از طریق مقایسه چند ارائه‌دهنده مستقل',
    cardIpv6Title: 'آدرس IP عمومی IPv6',
    cardIpv6Desc: 'ارزیابی دسترسی پروتکل دوگانه و شناسایی ترافیک احتمالی IPv6',
    cardDnsTitle: 'آزمایش نشت DNS',
    cardDnsDesc: 'شناسایی ریزالورهای پاسخ‌دهنده به درخواست‌های تفکیک دامنه',
    cardWebrtcTitle: 'افشای IP از طریق WebRTC',
    cardWebrtcDesc: 'تحلیل کاندیدهای پروتکل ICE و تفکیک آدرس‌های لوکال، عمومی و mDNS',
    cardVpnTitle: 'سازگاری و یکپارچگی VPN و Proxy',
    cardVpnDesc: 'بررسی عدم انطباق منطقه زمانی، نشت پروتکل دوگانه و کشور خروجی',
    cardGeoTitle: 'موقعیت تقریبی و مشخصات شبکه (GeoIP)',
    cardGeoDesc: 'کشور، شهر تقریبی، شماره ASN و ارائه‌دهنده اینترنت (ISP)',
    cardRecommendationsTitle: 'ارزیابی کلی و راهکارهای رفع نشت',
    cardRecommendationsDesc: 'شواهد ثبت‌شده و دستورالعمل‌های گام‌به‌گام برای برطرف‌سازی آسیب‌پذیری‌ها',

    // Disclaimers
    geoDisclaimer: 'توجه: موقعیت جغرافیایی IP موقعیت تقریبی دیتاسنتر یا درگاه ISP است و نباید با موقعیت دقیق GPS کاربر اشتباه گرفته شود.',
    honestDnsDisclaimer: 'توجه: سرورهای آزمایشی ممکن است IP ریزالور بازگشتی (مانند کلودفلر یا گوگل) را مشاهده کنند، نه مستقیماً DNS سیستم کاربر. تفاوت نام ارائه‌دهنده به‌تنهایی اثبات نشت نیست.',
    honestWebRtcDisclaimer: 'وجود آدرس‌های خصوصی (RFC 1918 نظیر 192.168.x.x) در WebRTC رفتار طبیعی مرورگر است و نشت عمومی محسوب نمی‌شود.',

    // Actions
    copy: 'کپی',
    copied: 'کپی شد!',
    downloadJson: 'دانلود فایل JSON',
    downloadCsv: 'دانلود فایل CSV',
    printPdf: 'چاپ / ذخیره PDF رسمی',
    close: 'بستن'
  },
  en: {
    appTitle: 'NetLeakGuard Pro',
    appSubtitle: 'Advanced IP, DNS & WebRTC Leak Diagnostic System',
    appBadge: 'Pro Edition for Windows & Android',
    startTest: 'Start Full Diagnostic',
    runningTest: 'Running Diagnostic...',
    retest: 'Re-run Diagnostic',
    readyToTest: 'System is ready to perform network security audit.',
    systemReady: 'System Ready',
    testRunning: 'Processing',
    testCompleted: 'Test Completed',
    viewTechnicalDetails: 'View Technical Evidence',
    exportReport: 'Export Report (PDF / JSON)',
    buildGuide: 'Windows & Android Build Guide',
    settings: 'Network & VPN Settings',
    language: 'Language / زبان',
    overallScore: 'Connection Security Index',
    evidenceHash: 'Cryptographic Evidence Hash (SHA-256):',
    duration: 'Duration:',
    ms: 'ms',

    // Statuses
    statusPassed: 'Test Passed',
    statusWarning: 'Security Warning',
    statusLeak: 'Leak Detected',
    statusInconclusive: 'Inconclusive',
    statusNotPerformed: 'Not Performed',
    statusNotApplicable: 'Not Applicable',

    // Cards
    cardIpv4Title: 'Public IPv4 Address',
    cardIpv4Desc: 'Independent multi-source public IPv4 detection and cross-validation',
    cardIpv6Title: 'Public IPv6 Address',
    cardIpv6Desc: 'Dual-stack accessibility audit and IPv6 exposure check',
    cardDnsTitle: 'DNS Leak Test',
    cardDnsDesc: 'Resolver origin tracking and DNS-over-HTTPS inspection',
    cardWebrtcTitle: 'WebRTC IP Exposure',
    cardWebrtcDesc: 'ICE candidate gathering distinguishing local, public, and mDNS candidates',
    cardVpnTitle: 'VPN & Proxy Compatibility',
    cardVpnDesc: 'Timezone divergence, dual-stack split, and routing integrity',
    cardGeoTitle: 'Approximate GeoIP & ASN Info',
    cardGeoDesc: 'Country, city, autonomous system number (ASN), and ISP details',
    cardRecommendationsTitle: 'Security Assessment & Remediation',
    cardRecommendationsDesc: 'Logged evidence and step-by-step mitigation instructions',

    // Disclaimers
    geoDisclaimer: 'Notice: IP geolocation reflects approximate datacenter or gateway location, not user physical GPS.',
    honestDnsDisclaimer: 'Notice: Authoritative probes observe recursive resolvers (e.g. Cloudflare, Google), which may differ from local stub DNS. Different ISP name is not alone proof of leak.',
    honestWebRtcDisclaimer: 'Private RFC 1918 IPs (192.168.x.x) in WebRTC are normal browser behavior and not a public leak.',

    // Actions
    copy: 'Copy',
    copied: 'Copied!',
    downloadJson: 'Download JSON',
    downloadCsv: 'Download CSV',
    printPdf: 'Print / Save PDF Report',
    close: 'Close'
  }
};
