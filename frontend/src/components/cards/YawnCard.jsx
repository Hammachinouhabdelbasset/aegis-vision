export const YawnCard = ({ yawning, mar, yawnCount }) => {
  const mouthOpen = yawning ? Math.max(4, mar * 50) : 1.5;

  return (
    <div className="col-span-12 md:col-span-4 card p-4" style={{ height: '200px' }}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase" style={{ color: '#00d4ff' }}>
          YAWN_ANALYSIS
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{
            background: yawning ? '#ffaa00' : '#00d68f',
            transition: 'background 0.3s',
          }} />
          <span className="text-[8px] font-mono" style={{
            color: yawning ? '#ffaa00' : '#00d68f',
            transition: 'color 0.3s',
          }}>
            {yawning ? 'YAWNING' : 'NOMINAL'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mouth SVG */}
        <div className="w-20 h-14 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 70 50" className="w-full h-full">
            {/* Lips outline */}
            <ellipse cx="35" cy="25" rx="28" ry="18" fill="none" stroke="#1a1a22" strokeWidth="0.8" />
            {/* Mouth shape */}
            <path
              d={`M12 25 Q35 ${25 + mouthOpen} 58 25`}
              fill="none"
              stroke={yawning ? '#ffaa00' : '#00d4ff'}
              strokeWidth="1.5"
              style={{ transition: 'all 0.5s ease' }}
            />
            {yawning && (
              <ellipse
                cx="35" cy={25 + mouthOpen * 0.35}
                rx="10" ry={mouthOpen * 0.3}
                fill={`rgba(255,170,0,0.12)`}
                style={{ transition: 'all 0.5s' }}
              />
            )}
          </svg>
        </div>

        {/* Metrics */}
        <div className="flex-1 space-y-2.5">
          <div>
            <p className="text-[8px] font-mono uppercase" style={{ color: '#5a5a6a' }}>MAR VALUE (MOUTH ASPECT)</p>
            <div className="flex justify-between items-center mt-1">
              <div className="flex-1 mr-3 h-1" style={{ background: '#1a1a22' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(100, (mar / 0.8) * 100)}%`,
                    background: yawning ? '#ffaa00' : '#00d4ff',
                    transition: 'width 0.5s, background 0.3s',
                  }}
                />
              </div>
              <span className="text-xs font-headline font-bold" style={{ color: '#e8e8ef' }}>
                {mar?.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <div>
              <p className="text-[7px] font-mono uppercase" style={{ color: '#5a5a6a' }}>DELTA (60S)</p>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: yawning ? '#ffaa00' : '#5a5a6a' }}>
                {yawning ? '+0.42 ▲' : '+0.02 ▲'}
              </p>
            </div>
            <div>
              <p className="text-[7px] font-mono uppercase" style={{ color: '#5a5a6a' }}>TOTAL YAWNS</p>
              <p className="text-[10px] font-headline font-bold mt-0.5" style={{ color: '#e8e8ef' }}>
                {String(yawnCount ?? 0).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
