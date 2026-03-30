// ═══════════════════════════════════════════════
//  AEGIS VISION — Live Simulation Engine
// ═══════════════════════════════════════════════

const simState = {
  t: 0,
  ear: 0.30,
  earHistory: Array(12).fill(0.30),
  drowsyScore: 0,
  perclos: 0,
  yawning: false,
  yawnCount: 0,
  mar: 0.14,
  pitch: 4.2,
  yaw: -12.8,
  roll: 1.5,
  nodding: false,
  gazeDir: 'FORWARD',
  gazeAlert: false,
  gazeOff: 0,
  phoneDetected: false,
  phoneAlert: false,
  phoneDuration: 0,
  phoneViolations: 0,
  level: 'OK',
  _lastPhoneAlert: false,
};

export function tickSimulation(currentState) {
  const s = { ...currentState };
  s.t += 0.033;
  const t = s.t;

  // EAR — slowly oscillates (drowsiness builds + natural variation)
  s.ear = Math.max(0.08, 0.30 - 0.10 * Math.abs(Math.sin(t / 15)) + (Math.random() - 0.5) * 0.012);
  const newHistory = [...s.earHistory.slice(1), s.ear];
  s.earHistory = newHistory;

  // Drowsiness score
  s.drowsyScore = Math.round(
    Math.min(100, Math.max(0, (1 - s.ear / 0.30) * 100 * Math.abs(Math.sin(t / 20))))
  );
  s.perclos = parseFloat((s.drowsyScore * 0.005).toFixed(3));

  // Yawning every 30s for a 3s window
  s.yawning = t % 30 < 3;
  s.yawnCount = Math.floor(t / 30);
  s.mar = s.yawning ? 0.6 + Math.sin(t * 3) * 0.05 : 0.12 + Math.random() * 0.04;

  // Head pose
  s.pitch = parseFloat((8 * Math.abs(Math.sin(t / 12))).toFixed(1));
  s.yaw = parseFloat((-15 * Math.sin(t / 8)).toFixed(1));
  s.roll = parseFloat((3 * Math.cos(t / 10)).toFixed(1));
  s.nodding = Math.abs(Math.sin(t / 12)) > 0.75;

  // Gaze direction
  const dirs = ['FORWARD', 'FORWARD', 'FORWARD', 'FORWARD', 'FORWARD', 'LEFT', 'RIGHT'];
  s.gazeDir = s.nodding ? 'DOWN' : dirs[Math.floor(t * 2) % dirs.length];
  s.gazeOff = s.gazeDir !== 'FORWARD' ? Math.min(5, (s.gazeOff || 0) + 0.033) : 0;
  s.gazeAlert = s.gazeOff > 2.5;

  // Phone detection: detected every 45s for a 5s window
  s.phoneDetected = t % 45 < 5;
  s.phoneAlert = s.phoneDetected && t % 45 > 2;
  s.phoneDuration = s.phoneDetected ? parseFloat((t % 45).toFixed(1)) : 0;
  if (s.phoneAlert && !s._lastPhoneAlert) s.phoneViolations = (s.phoneViolations || 0) + 1;
  s._lastPhoneAlert = s.phoneAlert;

  // Alert level
  if (s.phoneAlert || s.drowsyScore > 70) s.level = 'CRITICAL';
  else if (s.drowsyScore > 45 || s.gazeAlert) s.level = 'ALERT';
  else if (s.drowsyScore > 25 || s.nodding || s.yawning) s.level = 'WARNING';
  else s.level = 'OK';

  return s;
}

export const initialSimState = { ...simState };

export const LEVEL_CFG = {
  OK: {
    bg: 'rgba(22,40,22,0.85)',
    border: '#22c55e',
    icon: 'check_circle',
    title: 'SYSTEM NOMINAL',
    sub: 'ALL SIGNALS WITHIN SAFE PARAMETERS',
    badge: 'OK',
    badgeBg: '#22c55e',
    badgeColor: '#001f27',
    glow: '',
  },
  WARNING: {
    bg: 'rgba(40,35,5,0.85)',
    border: '#eab308',
    icon: 'warning',
    title: 'WARNING — REDUCED ALERTNESS',
    sub: 'MONITOR DRIVER CLOSELY',
    badge: 'WARNING',
    badgeBg: '#eab308',
    badgeColor: '#000',
    glow: 'animate-pulse-warning glow-warning',
  },
  ALERT: {
    bg: 'rgba(40,20,5,0.85)',
    border: '#f97316',
    icon: 'priority_high',
    title: 'ALERT — INTERVENTION RECOMMENDED',
    sub: 'DRIVER ATTENTION COMPROMISED',
    badge: 'ALERT',
    badgeBg: '#f97316',
    badgeColor: '#fff',
    glow: 'animate-pulse-error glow-error',
  },
  CRITICAL: {
    bg: 'rgba(60,5,5,0.9)',
    border: '#ef4444',
    icon: 'emergency',
    title: 'CRITICAL — IMMEDIATE ACTION REQUIRED',
    sub: 'EMERGENCY PROTOCOL ACTIVE',
    badge: 'CRITICAL',
    badgeBg: '#ef4444',
    badgeColor: '#fff',
    glow: 'animate-critical-flash animate-pulse-error',
  },
};

export function formatTime(seconds) {
  const s = Math.floor(seconds);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function getDrowsinessColor(score) {
  if (score > 70) return '#ef4444';
  if (score > 45) return '#f97316';
  if (score > 25) return '#eab308';
  return '#00d4ff';
}

export function getDrowsinessLabel(score) {
  if (score > 70) return 'CRITICAL';
  if (score > 45) return 'ALERT';
  if (score > 25) return 'WARNING';
  return 'NOMINAL';
}
