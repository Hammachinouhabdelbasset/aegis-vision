const NAV_ITEMS = [
  { id: 'system',      icon: 'description',        label: 'STATUS' },
  { id: 'system',      icon: 'grid_view',          label: 'OVERVIEW', isDefault: true },
  { id: 'telemetry',   icon: 'monitoring',         label: 'TELEMETRY' },
  { id: 'diagnostics', icon: 'visibility',         label: 'OPTICS' },
  { id: 'diagnostics', icon: 'notifications',      label: 'ALERTS' },
  { id: 'calibration', icon: 'photo_camera_front', label: 'CAPTURE' },
];

export const Sidebar = ({ currentPage, setCurrentPage }) => {
  return (
    <aside
      className="fixed left-0 top-12 z-40 flex flex-col items-center py-3"
      style={{
        width: '56px',
        height: 'calc(100vh - 3rem - 1.5rem)',
        background: '#0a0a0f',
        borderRight: '0.5px solid rgba(0,212,255,0.08)',
      }}
    >
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item, i) => {
          const active = currentPage === item.id || (item.isDefault && currentPage === item.id);
          const isCurrentNav =
            (currentPage === item.id) ||
            (currentPage === 'calibration' && item.id === 'calibration');

          return (
            <button
              key={`${item.id}-${i}`}
              onClick={() => setCurrentPage(item.id)}
              className="relative flex flex-col items-center justify-center w-full py-2.5 transition-colors"
              style={{ color: isCurrentNav ? '#00d4ff' : '#3a3a4a' }}
              title={item.label}
            >
              {/* Active left bar */}
              {isCurrentNav && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                  style={{ width: '2px', height: '24px', background: '#00d4ff' }}
                />
              )}
              <span className="mat-icon" style={{ fontSize: '18px' }}>{item.icon}</span>
              <span
                className="text-[7px] font-mono mt-0.5 tracking-wider"
                style={{
                  color: isCurrentNav ? '#00d4ff' : '#3a3a4a',
                  opacity: isCurrentNav ? 1 : 0.8,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: Settings */}
      <button
        onClick={() => setCurrentPage('settings')}
        className="flex flex-col items-center py-2 transition-colors"
        style={{ color: currentPage === 'settings' ? '#00d4ff' : '#3a3a4a' }}
      >
        <span className="mat-icon" style={{ fontSize: '18px' }}>settings</span>
      </button>
    </aside>
  );
};
