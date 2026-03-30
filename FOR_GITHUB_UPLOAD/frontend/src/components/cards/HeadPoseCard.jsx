export const HeadPoseCard = ({ pitch, yaw, roll, nodding }) => {
  return (
    <div className="col-span-12 md:col-span-4 card p-4" style={{ height: '200px' }}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase" style={{ color: '#00d4ff' }}>
          HEAD_POSE_3D
        </h3>
        <span className="mat-icon" style={{ color: '#3a3a4a', fontSize: '16px' }}>3d_rotation</span>
      </div>

      <div className="flex items-center gap-4">
        {/* 3D Head model */}
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center" style={{ background: '#0c0c12', border: '0.5px solid rgba(0,212,255,0.1)' }}>
          <svg
            width="44" height="44" viewBox="0 0 48 48"
            style={{
              transformOrigin: '24px 24px',
              transform: `rotateX(${(pitch * 0.5).toFixed(1)}deg) rotateY(${(yaw * 0.3).toFixed(1)}deg)`,
              transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <rect x="14" y="10" width="20" height="28" fill="rgba(0,212,255,0.03)" stroke="#00d4ff" strokeWidth="0.8" opacity="0.6" />
            <rect x="11" y="7" width="26" height="34" fill="none" stroke="#00d4ff" strokeWidth="0.3" opacity="0.25" />
            <line x1="14" y1="10" x2="11" y2="7" stroke="#00d4ff" strokeWidth="0.3" opacity="0.25" />
            <line x1="34" y1="10" x2="37" y2="7" stroke="#00d4ff" strokeWidth="0.3" opacity="0.25" />
            <line x1="14" y1="38" x2="11" y2="41" stroke="#00d4ff" strokeWidth="0.3" opacity="0.25" />
            <line x1="34" y1="38" x2="37" y2="41" stroke="#00d4ff" strokeWidth="0.3" opacity="0.25" />
            <circle cx="20" cy="20" r="2" fill="#00d4ff" opacity="0.4" />
            <circle cx="28" cy="20" r="2" fill="#00d4ff" opacity="0.4" />
            <path d="M20 29 Q24 32 28 29" fill="none" stroke="#00d4ff" strokeWidth="0.6" opacity="0.4" />
            <text x="16" y="46" fill="#00d4ff" fontSize="4" fontFamily="JetBrains Mono, monospace" opacity="0.3">Z-AXIS</text>
          </svg>
        </div>

        {/* Metrics */}
        <div className="flex-1 space-y-1.5">
          {[
            { label: 'PITCH', value: pitch, color: '#00d4ff' },
            { label: 'YAW',   value: yaw,   color: '#00d4ff' },
            { label: 'ROLL',  value: roll,   color: '#00d4ff' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-1" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[9px] font-mono" style={{ color: '#5a5a6a' }}>{label}</span>
              <span className="text-[10px] font-mono font-semibold" style={{ color }}>
                {value >= 0 ? '+' : ''}{value?.toFixed(1)}°
              </span>
            </div>
          ))}

          {/* Nod indicator */}
          <div className="flex items-center gap-2 pt-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{
              background: nodding ? '#ffaa00' : '#00d68f',
              transition: 'background 0.3s',
            }} />
            <span className="text-[8px] font-mono" style={{
              color: nodding ? '#ffaa00' : '#5a5a6a',
              transition: 'color 0.3s',
            }}>
              {nodding ? 'NOD_DETECTED' : 'STABLE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
