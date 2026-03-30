const GAZE_MAP = {
  FORWARD: { x: 50, y: 50 },
  LEFT:    { x: 18, y: 50 },
  RIGHT:   { x: 82, y: 50 },
  UP:      { x: 50, y: 18 },
  DOWN:    { x: 50, y: 82 },
};

export const GazeCard = ({ gazeDir, gazeAlert, gazeOff }) => {
  const pos = GAZE_MAP[gazeDir] || GAZE_MAP.FORWARD;

  return (
    <div className="col-span-12 md:col-span-4 card p-4" style={{ height: '200px' }}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase" style={{ color: '#00d4ff' }}>
          GAZE_HEATMAP
        </h3>
        <span className="mat-icon" style={{ color: '#3a3a4a', fontSize: '16px' }}>visibility</span>
      </div>

      <div className="flex items-start gap-4">
        {/* Heatmap visualization */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{
            width: '120px',
            height: '100px',
            background: '#0c0c12',
            border: '0.5px solid rgba(0,212,255,0.1)',
          }}
        >
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 100" style={{ opacity: 0.15 }}>
            {[20, 40, 60, 80, 100].map(x => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#00d4ff" strokeWidth="0.3" />
            ))}
            {[20, 40, 60, 80].map(y => (
              <line key={`h${y}`} x1="0" y1={y} x2="120" y2={y} stroke="#00d4ff" strokeWidth="0.3" />
            ))}
          </svg>

          {/* Gaussian heatmap glow */}
          <div
            className="absolute"
            style={{
              width: '60px',
              height: '50px',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              background: gazeAlert
                ? 'radial-gradient(ellipse, rgba(255,59,59,0.25) 0%, rgba(255,59,59,0.08) 40%, transparent 70%)'
                : 'radial-gradient(ellipse, rgba(0,212,255,0.2) 0%, rgba(0,212,255,0.06) 40%, transparent 70%)',
              transition: 'left 0.4s cubic-bezier(0.34,1.56,0.64,1), top 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.3s',
            }}
          />

          {/* Center dot */}
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              background: gazeAlert ? '#ff3b3b' : '#00d4ff',
              boxShadow: gazeAlert ? '0 0 6px rgba(255,59,59,0.6)' : '0 0 6px rgba(0,212,255,0.4)',
              transition: 'left 0.4s cubic-bezier(0.34,1.56,0.64,1), top 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.3s',
            }}
          />
        </div>

        {/* Metrics */}
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-[7px] font-mono uppercase" style={{ color: '#5a5a6a' }}>DIRECTION</p>
            <p className="text-xs font-headline font-bold mt-0.5" style={{ color: '#e8e8ef' }}>{gazeDir}</p>
          </div>
          <div>
            <p className="text-[7px] font-mono uppercase" style={{ color: '#5a5a6a' }}>OFF-ROAD TIMER</p>
            <p className="text-xs font-mono font-semibold mt-0.5" style={{ color: gazeAlert ? '#ff3b3b' : '#e8e8ef' }}>
              {gazeOff?.toFixed(1)}s
            </p>
          </div>
          {/* Alert progress */}
          <div>
            <div className="w-full h-1 mt-1" style={{ background: '#1a1a22' }}>
              <div className="h-full" style={{
                width: `${Math.min(100, (gazeOff / 2.5) * 100)}%`,
                background: gazeAlert ? '#ff3b3b' : '#00d68f',
                transition: 'width 0.3s, background 0.3s',
              }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{
              background: gazeAlert ? '#ff3b3b' : '#00d68f',
              transition: 'background 0.3s',
            }} />
            <span className="text-[8px] font-mono" style={{
              color: gazeAlert ? '#ff3b3b' : '#00d68f',
              transition: 'color 0.3s',
            }}>
              {gazeAlert ? 'OFF_ROAD_ALERT' : 'GAZE_LOCKED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
