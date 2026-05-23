import { ClientInfo } from '../types';

export async function getClientInfo(): Promise<ClientInfo> {
  const info: Partial<ClientInfo> = {};

  // 1. IP and Geography (With abort-aware fetch)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const r = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    const data = await r.json();
    info.ip = data.ip || 'Unbekannt';
  } catch (e) {
    info.ip = 'Unbekannt';
  } finally {
    clearTimeout(timeoutId);
  }

  const geoController = new AbortController();
  const geoTimeoutId = setTimeout(() => geoController.abort(), 4500);

  try {
    if (info.ip && info.ip !== 'Unbekannt') {
      const r = await fetch(
        `https://ip-api.com/json/${info.ip}?fields=status,country,regionName,city,isp,org`,
        { signal: geoController.signal }
      );
      const g = await r.json();
      if (g.status === 'success') {
        info.city = g.city || '–';
        info.country = g.country || '–';
        info.region = g.regionName || '–';
        info.isp = g.isp || g.org || '–';
      }
    }
  } catch (e) {
    // Fail gracefully
  } finally {
    clearTimeout(geoTimeoutId);
  }

  // Set defaults for missing geo info
  info.city = info.city || 'Frankfurt am Main';
  info.country = info.country || 'Deutschland';
  info.region = info.region || 'Hessen';
  info.isp = info.isp || 'Local Area Network';

  // 2. Battery Tracker
  info.battery = '–';
  try {
    const nav = navigator as any;
    if ('getBattery' in nav) {
      const b = await nav.getBattery();
      const pct = Math.round(b.level * 100);
      info.battery = `${pct}% ${b.charging ? '⚡ (lädt)' : '🔋 (lädt nicht)'}`;
    }
  } catch (e) {
    // Ignore battery access error
  }

  // 3. Network Connection specs
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  info.connType = conn ? (conn.effectiveType || conn.type || '–') : '–';
  info.rtt = conn?.rtt !== undefined ? `${conn.rtt} ms` : '–';
  info.downlink = conn?.downlink !== undefined ? `${conn.downlink} Mbit/s` : '–';

  // 4. Hardware details
  info.cores = String(navigator.hardwareConcurrency || '–');
  info.ramGB = String((navigator as any).deviceMemory || '–');

  // 5. Browser detection
  const ua = navigator.userAgent;
  info.ua = ua;
  let browser = 'Unbekannt';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/OPR\//i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Apple Safari';
  info.browser = browser;

  // 6. Display metrics
  info.screenRes = `${window.screen.width}×${window.screen.height}`;
  info.colorDepth = `${window.screen.colorDepth}-bit`;
  info.pixelRatio = window.devicePixelRatio || 1;

  // 7. System Preferences
  info.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dunkel 🌙' : 'Hell ☀️';
  info.languages = (navigator.languages || [navigator.language]).join(', ');
  
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  info.tz = tz;
  info.time = new Date().toLocaleString('de-DE', { timeZone: tz });
  info.platform = navigator.platform || '–';

  return info as ClientInfo;
}
