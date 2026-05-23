export type PageType = 'home' | 'send' | 'archive' | 'footprint';

export interface ClientInfo {
  ip: string;
  city: string;
  country: string;
  region: string;
  isp: string;
  battery: string;
  connType: string;
  rtt: string;
  downlink: string;
  cores: string;
  ramGB: string;
  browser: string;
  ua: string;
  screenRes: string;
  colorDepth: string;
  pixelRatio: number;
  darkMode: string;
  languages: string;
  tz: string;
  time: string;
  platform: string;
}

export interface SentMessage {
  id: string;
  name: string;
  subject: string;
  message: string;
  timestamp: string;
  info: ClientInfo;
}

export interface Template {
  id: string;
  label: string;
  subject: string;
  body: string;
  icon: string;
}
