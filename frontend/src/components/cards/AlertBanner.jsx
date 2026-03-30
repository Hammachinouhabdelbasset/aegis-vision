import { LEVEL_CFG } from '../../utils/simulation';

export const AlertBanner = ({ level, uptime }) => {
  const s = Math.floor(uptime);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');

  const configs = {
    OK: {
      bg: 'transparent',
      border: 'rgba(0,214,143,0.15)',
      color: '#00d68f',
      icon: 'check_circle',
      title: 'ALL SYSTEMS NOMINAL',
      sub: 'MONITORING ACTIVE — NO ANOMALIES DETECTED',
      badge: 'NOMINAL',
      badgeBg: 'rgba(0,214,143,0.15)',
      badgeColor: '#00d68f',
    },
    WARNING: {
      bg: 'linear-gradient(90deg, rgba(255,170,0,0.06) 0%, transparent 60%)',
      border: 'rgba(255,170,0,0.2)',
      color: '#ffaa00',
      icon: 'warning',
      title: 'ATTENTION: REDUCED ALERTNESS DETECTED',
      sub: `EVENT_ID: ${Math.floor(Math.random() * 9000 + 1000)}-W | DURATION: ${mm}:${ss}`,
      badge: 'WARNING',
      badgeBg: 'rgba(255,170,0,0.15)',
      badgeColor: '#ffaa00',
    },
    ALERT: {
      bg: 'linear-gradient(90deg, rgba(255,59,59,0.08) 0%, rgba(255,59,59,0.02) 40%, transparent 70%)',
      border: 'rgba(255,59,59,0.25)',
      color: '#ff6b6b',
      icon: 'priority_high',
      title: 'ALERT: ATTENTION DEGRADATION DETECTED',
      sub: `EVENT_ID: ${Math.floor(Math.random() * 9000 + 1000)}-X | DURATION: ${mm}:${ss}`,
      badge: 'ALERT',
      badgeBg: 'rgba(255,59,59,0.15)',
      badgeColor: '#ff6b6b',
    },
    CRITICAL: {
      bg: 'linear-gradient(90deg, rgba(255,59,59,0.12) 0%, rgba(255,59,59,0.04) 50%, transparent 80%)',
      border: 'rgba(255,59,59,0.35)',
      color: '#ff3b3b',
      icon: 'emergency',
      title: 'CRITICAL: IMMEDIATE INTERVENTION REQUIRED',
      sub: `EVENT_ID: ${Math.floor(Math.random() * 9000 + 1000)}-X | DURATION: ${mm}:${ss}`,
      badge: 'CRITICAL',
      badgeBg: '#ff3b3b',
      badgeColor: '#fff',
    },
  };

  const c = configs[level] || configs.OK;

  return (
    <div
      className="mb-4 flex items-center justify-between px-4 py-2.5"
      style={{
        background: c.bg,
        borderBottom: `0.5px solid ${c.border}`,
        transition: 'all 0.5s ease',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="mat-icon" style={{ color: c.color, fontSize: '18px' }}>{c.icon}</span>
        <div>
          <p className="text-[11px] font-headline font-bold tracking-tight" style={{ color: c.color }}>
            {c.title}
          </p>
          <p className="text-[9px] font-mono tracking-widest" style={{ color: '#5a5a6a' }}>
            {c.sub}
          </p>
        </div>
      </div>
      <span
        className="px-3 py-1 text-[10px] font-headline font-bold tracking-wider"
        style={{ background: c.badgeBg, color: c.badgeColor }}
      >
        {c.badge}
      </span>
    </div>
  );
};
