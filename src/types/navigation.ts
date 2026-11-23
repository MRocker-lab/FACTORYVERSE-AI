export type SurfaceTheme = 'dark-command' | 'light-enterprise';

export type NavSectionId =
  | 'command-centre'
  | 'digital-twin'
  | 'enterprise-analytics'
  | 'predictive-ai'
  | 'energy-sustainability'
  | 'system-governance';

export interface NavItem {
  id: NavSectionId;
  label: string;
  shortLabel: string;
  description: string;
  defaultTheme: SurfaceTheme;
  category: 'REAL-TIME OPERATIONS' | 'ENTERPRISE INTELLIGENCE';
  badge?: string;
  badgeTone?: 'cyan' | 'emerald' | 'amber' | 'violet';
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'command-centre',
    label: 'Command Centre',
    shortLabel: 'Command',
    description: 'Live 6-cell simulated telemetry, OEE efficiency & real-time diagnostics',
    defaultTheme: 'dark-command',
    category: 'REAL-TIME OPERATIONS',
    badge: 'LIVE',
    badgeTone: 'violet',
  },
  {
    id: 'digital-twin',
    label: 'Digital Factory Floor',
    shortLabel: 'Floor Map',
    description: 'Interactive spatial workcell topology, line conduits & thermal telemetry',
    defaultTheme: 'dark-command',
    category: 'REAL-TIME OPERATIONS',
    badge: '6 CELLS',
    badgeTone: 'emerald',
  },
  {
    id: 'predictive-ai',
    label: 'AI Anomaly Radar',
    shortLabel: 'AI Radar',
    description: 'Explainable rule & derivative anomaly detection, fault lab & predictive maintenance',
    defaultTheme: 'dark-command',
    category: 'REAL-TIME OPERATIONS',
    badge: 'AI ENGINE',
    badgeTone: 'violet',
  },
  {
    id: 'enterprise-analytics',
    label: 'Enterprise Analytics',
    shortLabel: 'Analytics',
    description: 'Cross-line efficiency comparison, cycle output & workcell performance matrix',
    defaultTheme: 'dark-command',
    category: 'ENTERPRISE INTELLIGENCE',
  },
  {
    id: 'energy-sustainability',
    label: 'Energy & Power Ledger',
    shortLabel: 'Power Grid',
    description: 'Simulated kW demand distribution, rated load utilization & specific energy intensity',
    defaultTheme: 'dark-command',
    category: 'ENTERPRISE INTELLIGENCE',
    badge: 'GRID',
    badgeTone: 'cyan',
  },
  {
    id: 'system-governance',
    label: 'Architecture & Design System',
    shortLabel: 'System',
    description: 'Dark Obsidian + Electric Purple tokens, rule threshold matrix & simulation specs',
    defaultTheme: 'dark-command',
    category: 'ENTERPRISE INTELLIGENCE',
  },
];
