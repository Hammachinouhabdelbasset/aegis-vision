export function getAlertLevel(drowsyScore, phoneAlert, gazeAlert, nodding, yawning) {
  if (phoneAlert || drowsyScore > 70) return 'CRITICAL';
  if (drowsyScore > 45 || gazeAlert) return 'ALERT';
  if (drowsyScore > 25 || nodding || yawning) return 'WARNING';
  return 'OK';
}

export function formatTime(seconds) {
  const s = Math.floor(seconds);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '00');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
