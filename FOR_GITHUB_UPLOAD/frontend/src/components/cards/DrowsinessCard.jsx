import { getDrowsinessColor, getDrowsinessLabel } from '../../utils/simulation';

export const DrowsinessCard = ({ drowsyScore, ear, earHistory, perclos }) => {
  const color = getDrowsinessColor(drowsyScore);
  const label = getDrowsinessLabel(drowsyScore);
  const circumference = 226.2; // 2 * PI * 36
  const offset = circumference - (drowsyScore / 100) * circumference;

  // Blink frequency derived from EAR
  const blinkFreq = (12 + (1 - ear / 0.3) * 8).toFixed(1);

  return (
    <div className="col-span-12 lg:col-span-5 card p-5 flex flex-col" style={{ height: '280px' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase" style={{ color: '#00d4ff' }}>
          DROWSINESS_METRIC
        </h3>
        <span className="mat-icon" style={{ color: '#3a3a4a', fontSize: '16px' }}>monitor_heart</span>
      </div>

      {/* Body: Ring + EAR bars */}
      <div className="flex items-start gap-5 flex-1">
        {/* Ring gauge */}
        <div className="relative w-[82px] h-[82px] flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 82 82">
            <circle cx="41" cy="41" r="36" fill="transparent" stroke="#1a1a22" strokeWidth="3" />
            <circle
              cx="41" cy="41" r="36"
              fill="transparent"
              stroke={color}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s' }}
            />
          </svg>
          <span className="absolute text-base font-headline font-bold" style={{ color }}>
            {drowsyScore}%
          </span>
        </div>

        {/* Right: EAR Trend + metrics */}
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-mono uppercase tracking-widest mb-1" style={{ color: '#5a5a6a' }}>
            EAR TREND (EYE ASPECT RATIO)
          </p>

          {/* Block-style bar chart */}
          <div className="flex items-end gap-1 h-12 mb-3">
            {earHistory.map((v, i) => {
              const h = Math.max(8, Math.round((v / 0.4) * 100));
              const barColor = v < 0.15 ? '#ff3b3b' : v < 0.22 ? '#ffaa00' : '#00d4ff';
              return (
                <div
                  key={i}
                  className="flex-1"
                  style={{
                    height: `${h}%`,
                    background: barColor,
                    opacity: 0.25 + i * 0.06,
                    transition: 'height 0.5s ease',
                  }}
                />
              );
            })}
          </div>

          {/* Metric boxes */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2" style={{ background: '#0f1015', border: '0.5px solid rgba(0,212,255,0.08)' }}>
              <p className="text-[7px] font-mono uppercase" style={{ color: '#5a5a6a' }}>BLINK FREQUENCY</p>
              <p className="text-sm font-headline font-bold mt-0.5" style={{ color: '#e8e8ef' }}>
                {blinkFreq} <span className="text-[8px] font-mono" style={{ color: '#5a5a6a' }}>/ min</span>
              </p>
            </div>
            <div className="p-2" style={{ background: '#0f1015', border: '0.5px solid rgba(0,212,255,0.08)' }}>
              <p className="text-[7px] font-mono uppercase" style={{ color: '#5a5a6a' }}>PERCLOS SCORE</p>
              <p className="text-sm font-headline font-bold mt-0.5" style={{ color: '#e8e8ef' }}>
                {perclos?.toFixed(3) ?? '0.000'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
