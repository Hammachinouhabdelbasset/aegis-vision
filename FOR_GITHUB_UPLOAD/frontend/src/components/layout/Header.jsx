import { useState, useEffect } from 'react';

export const Header = ({ currentPage, setCurrentPage, isConnected }) => {
  const [clock, setClock] = useState('');
  const [fps, setFps] = useState('60.00');

  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      setClock(now.toTimeString().slice(0, 8));
      setFps((58 + Math.random() * 4).toFixed(2));
    }, 500);
    return () => clearInterval(tick);
  }, []);

  const tabs = [
    { id: 'system',      label: 'SYSTEM' },
    { id: 'telemetry',   label: 'TELEMETRY' },
    { id: 'diagnostics', label: 'DIAGNOSTICS' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 px-5"
      style={{ background: '#0a0a0f', borderBottom: '0.5px solid rgba(0,212,255,0.12)' }}
    >
      {/* Left: Brand + Tabs */}
      <div className="flex items-center gap-10">
        <span className="text-sm font-black tracking-tight font-headline" style={{ color: '#00d4ff' }}>
          AEGIS VISION CLINICAL
        </span>

        <div className="flex items-center gap-1">
          {tabs.map(tab => {
            const active = currentPage === tab.id ||
              (tab.id === 'system' && currentPage === 'system') ||
              (tab.id === 'diagnostics' && currentPage === 'calibration');
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id)}
                className="relative px-3 py-1 font-headline text-[11px] font-semibold tracking-wide transition-colors"
                style={{
                  color: active ? '#00d4ff' : '#5a5a6a',
                  textDecoration: active ? 'underline' : 'none',
                  textUnderlineOffset: '6px',
                  textDecorationThickness: '1.5px',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Status indicators + Avatar */}
      <div className="flex items-center gap-4">
        {/* Connection indicators */}
        <div className="flex items-center gap-3">
          <span className="mat-icon text-sm" style={{ color: isConnected ? '#00d68f' : '#5a5a6a', fontSize: '16px' }}>
            cell_tower
          </span>
          <span className="mat-icon text-sm" style={{ color: '#00d4ff', fontSize: '16px' }}>
            vpn_key
          </span>
          {/* Signal bars */}
          <div className="flex items-end gap-0.5 h-3">
            {[3, 5, 7, 9, 11].map((h, i) => (
              <div key={i} style={{ width: '2px', height: `${h}px`, background: i < 4 ? '#00d4ff' : '#2a2a35' }} />
            ))}
          </div>
        </div>

        {/* Avatar */}
        <div
          className="w-7 h-7 flex items-center justify-center overflow-hidden"
          style={{ background: '#141419', border: '0.5px solid rgba(0,212,255,0.2)' }}
        >
          <span className="mat-icon" style={{ color: '#5a5a6a', fontSize: '18px' }}>person</span>
        </div>
      </div>
    </nav>
  );
};
