// Alert level configurations
export const ALERT_LEVELS = {
  OK: {
    bg: 'rgba(22,40,22,0.8)',
    border: '#22c55e',
    icon: 'check_circle',
    title: 'SYSTEM NOMINAL',
    sub: 'ALL SIGNALS WITHIN SAFE PARAMETERS',
    badge: 'OK',
    badgeBg: '#22c55e',
    badgeColor: '#001f27',
    glow: '',
    textColor: '#22c55e',
  },
  WARNING: {
    bg: 'rgba(40,35,5,0.8)',
    border: '#eab308',
    icon: 'warning',
    title: 'WARNING — REDUCED ALERTNESS',
    sub: 'MONITOR DRIVER CLOSELY',
    badge: 'WARNING',
    badgeBg: '#eab308',
    badgeColor: '#000',
    glow: 'glow-warning pulse-warning',
    textColor: '#eab308',
  },
  ALERT: {
    bg: 'rgba(40,20,5,0.8)',
    border: '#f97316',
    icon: 'priority_high',
    title: 'ALERT — INTERVENTION RECOMMENDED',
    sub: 'DRIVER ATTENTION COMPROMISED',
    badge: 'ALERT',
    badgeBg: '#f97316',
    badgeColor: '#fff',
    glow: 'glow-error pulse-error',
    textColor: '#f97316',
  },
  CRITICAL: {
    bg: 'rgba(60,5,5,0.8)',
    border: '#ef4444',
    icon: 'emergency',
    title: 'CRITICAL — IMMEDIATE ACTION REQUIRED',
    sub: 'EMERGENCY PROTOCOL ACTIVE',
    badge: 'CRITICAL',
    badgeBg: '#ef4444',
    badgeColor: '#fff',
    glow: 'critical-flash pulse-error',
    textColor: '#ef4444',
  },
};

// Color mappings
export const COLORS = {
  primary: '#00d4ff',
  error: '#ef4444',
  warning: '#eab308',
  alert: '#f97316',
  success: '#22c55e',
};

// Thresholds for alert levels
export const THRESHOLDS = {
  drowsinessOK: 25,
  drowsinessWarning: 45,
  drowsinessAlert: 70,
  gazeOffTimeout: 2.5,
};

// Gaze directions
export const GAZE_DIRECTIONS = ['FORWARD', 'LEFT', 'RIGHT', 'UP', 'DOWN'];
