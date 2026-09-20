import {
  LayoutDashboard,
  Send,
  ReceiptText,
  Sparkles,
  MessageSquareText,
  Settings2,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar. */
  mobile: boolean;
  end?: boolean;
}

export const APP_NAV: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, mobile: true, end: true },
  { to: '/app/payment', label: 'Make payment', icon: Send, mobile: true },
  { to: '/app/transactions', label: 'Transactions', icon: ReceiptText, mobile: true },
  { to: '/app/insights', label: 'Insights', icon: Sparkles, mobile: true },
  { to: '/app/ask', label: 'Ask SpendSense', icon: MessageSquareText, mobile: true },
  { to: '/app/settings', label: 'Settings', icon: Settings2, mobile: false },
];

export const MARKETING_NAV = [
  { href: '#platform', label: 'Platform' },
  { href: '#vision', label: 'Our vision' },
  { href: '#security', label: 'Security' },
];
