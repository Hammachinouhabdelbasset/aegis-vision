import { useState, useEffect } from 'react';

const INCIDENTS = [
  { time: '14:45:12', type: 'DEVICE_OBSCURATION',    sev: 2, sevLabel: 'LVL_02', action: 'AUDIO_PROMPT_L1',   status: '[RESOLVED]',  statusColor: '#00d68f' },
  { time: '15:12:44', type: 'PROLONGED_PHONE_USE',   sev: 4, sevLabel: 'LVL_04', action: 'FORCE_STATION_HALT', status: '[IMMEDIATE]', statusColor: '#ff3b3b' },
  { time: '16:05:30', type: 'MICROSLEEP_DETECTED',   sev: 3, sevLabel: 'LVL_03', action: 'HAPTIC_PULSE_GEN',  status: '[CAUTION]',   statusColor: '#ffaa00' },
  { time: '17:40:01', type: 'PERSISTENT_YAWNING',    sev: 1, sevLabel: 'LVL_01', action: 'VISUAL_REMINDER',   status: '[RESOLVED]',  statusColor: '#00d68f' },
  { time: '17:55:22', type: 'GAZE_DEVIATION_EXTEND', sev: 2, sevLabel: 'LVL_02', action: 'AUDIO_PROMPT_L2',   status: '[RESOLVED]',  statusColor: '#00d68f' },
];

const SEV_COLORS = {
  1: '#00d4ff',
  2: '#ffaa00',
  3: '#ff6b6b',
  4: '#ff3b3b',
};

const MetricCard = ({ label, value, unit, sub, subColor, icon }) => (
  <div className="card p-4">
    <div className="flex justify-between items-start mb-2">
      <p className="text-[8px] font-mono uppercase tracking-widest" style={{ color: '#5a5a6a' }}>{label}</p>
      {icon && <span className="mat-icon" style={{ color: '#3a3a4a', fontSize: '14px' }}>{icon}</span>}
    </div>
    <p className="text-3xl font-headline font-black" style={{ color: '#e8e8ef' }}>
      {value}
      {unit && <span className="text-sm font-normal ml-1" style={{ color: '#5a5a6a' }}>{unit}</span>}
    </p>
    {sub && (
      <p className="text-[8px] font-mono mt-2 uppercase tracking-wider" style={{ color: subColor || '#5a5a6a' }}>
        {sub}
      </p>
    )}
  </div>
);

// SVG Chart component
const TimelineChart = () => {
  const drowsinessPoints = "0,85 60,82 120,78 180,80 240,70 300,55 360,45 420,38 480,42 540,30 600,22 660,35 720,50 780,65 800,70";
  const yawnPoints = "0,90 60,88 120,90 180,85 240,88 300,78 360,90 420,85 480,75 540,82 600,88 660,86 720,90 780,88 800,90";
  const phonePoints = "0,95 60,95 120,95 180,95 240,95 300,95 360,30 420,25 480,95 540,95 600,95 660,95 720,95 780,95 800,95";

  return (
    <div className="card p-5 mb-3">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase" style={{ color: '#00d4ff' }}>
            NEURAL_TELEMETRY_TIMELINE
          </h3>
          <p className="text-[8px] font-mono uppercase tracking-widest mt-0.5" style={{ color: '#3a3a4a' }}>
            MULTI-LAYER EVENT DISTRIBUTION MAPPING
          </p>
        </div>
        <div className="flex gap-5 text-[8px] font-mono">
          <span className="flex items-center gap-1.5">
            <span style={{ width: '12px', height: '2px', background: '#00d4ff', display: 'inline-block' }} />
            DROWSINESS
          </span>
          <span className="flex items-center gap-1.5" style={{ color: '#8a8a9a' }}>
            <span style={{ width: '12px', height: '2px', background: '#5a5a6a', display: 'inline-block' }} />
            YAWN
          </span>
          <span className="flex items-center gap-1.5" style={{ color: '#ff2d78' }}>
            <span style={{ width: '12px', height: '2px', background: '#ff2d78', display: 'inline-block' }} />
            PHONE_USAGE
          </span>
        </div>
      </div>

      <svg width="100%" height="180" viewBox="0 0 800 120" preserveAspectRatio="none">
        {/* Grid lines */}
        {[30, 60, 90].map(y => (
          <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#1a1a22" strokeWidth="0.5" />
        ))}

        {/* Area fill */}
        <polygon fill="rgba(0,212,255,0.04)" points={`0,100 ${drowsinessPoints} 800,100`} />

        {/* Lines */}
        <polyline fill="none" stroke="#5a5a6a" strokeWidth="1" points={yawnPoints} opacity="0.4" />
        <polyline fill="none" stroke="#ff2d78" strokeWidth="1" points={phonePoints} opacity="0.6" />
        <polyline fill="none" stroke="#00d4ff" strokeWidth="1.5" points={drowsinessPoints} />

        {/* Critical event markers */}
        <g>
          <rect x="536" y="18" width="4" height="4" fill="#ff3b3b" transform="rotate(45 538 20)" />
          <text x="542" y="18" fill="#ff3b3b" fontSize="5" fontFamily="JetBrains Mono, monospace" transform="rotate(-45 542 18)">
            CRITICAL_EVENT
          </text>
        </g>
        <g>
          <rect x="400" y="26" width="3" height="3" fill="#ffaa00" transform="rotate(45 401.5 27.5)" />
          <text x="406" y="26" fill="#ffaa00" fontSize="4.5" fontFamily="JetBrains Mono, monospace" transform="rotate(-45 406 26)">
            CRITICAL_EVENT
          </text>
        </g>

        {/* Data points on drowsiness line */}
        {[[240, 70], [360, 45], [480, 42], [540, 30], [600, 22]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="#0a0a0f" stroke="#00d4ff" strokeWidth="1" />
        ))}

        {/* Time axis */}
        {['14:22:05', '15:00:00', '16:00:00', '17:00:00', '18:34:18'].map((t, i) => (
          <text key={i} x={i * 200} y="115" fill="#3a3a4a" fontSize="6" fontFamily="JetBrains Mono, monospace">{t}</text>
        ))}
      </svg>
    </div>
  );
};

// Clinical Assessment panel
const ClinicalAssessment = () => (
  <div className="card p-4">
    <div className="flex items-center gap-2 mb-4">
      <span className="mat-icon" style={{ color: '#3a3a4a', fontSize: '14px' }}>clinical_notes</span>
      <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase" style={{ color: '#00d4ff' }}>
        CLINICAL_ASSESSMENT
      </h3>
    </div>

    {/* Score bars */}
    <div className="space-y-3 mb-4">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[8px] font-mono uppercase" style={{ color: '#5a5a6a' }}>SUBJECTIVE_SCORE</span>
          <span className="text-[9px] font-mono" style={{ color: '#e8e8ef' }}>88/100</span>
        </div>
        <div className="h-1.5" style={{ background: '#1a1a22' }}>
          <div className="h-full" style={{ width: '88%', background: '#00d4ff' }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[8px] font-mono uppercase" style={{ color: '#5a5a6a' }}>COGNITIVE_LOAD</span>
          <span className="text-[9px] font-mono" style={{ color: '#e8e8ef' }}>42/100</span>
        </div>
        <div className="h-1.5" style={{ background: '#1a1a22' }}>
          <div className="h-full" style={{ width: '42%', background: '#007a94' }} />
        </div>
      </div>
    </div>

    {/* Recommendation */}
    <div className="mb-3">
      <p className="text-[8px] font-mono uppercase tracking-widest mb-1.5" style={{ color: '#5a5a6a' }}>
        DIAGNOSTIC_RECOMMENDATION
      </p>
      <div className="p-3" style={{ background: '#0c0c12', border: '0.5px solid rgba(0,212,255,0.06)' }}>
        <p className="text-[10px] leading-relaxed italic" style={{ color: '#8a8a9a', fontFamily: 'Inter, sans-serif' }}>
          "Operator shows high focus levels. Isolated incidents of phone distraction at 15:12 were
          promptly corrected. Recommend shift duration reduction by 10% for next cycle to mitigate
          late-session yawning onset."
        </p>
      </div>
    </div>

    {/* Final Status */}
    <div className="text-center p-3" style={{ background: '#0c0c12', border: '0.5px solid rgba(0,212,255,0.1)' }}>
      <p className="text-[7px] font-mono uppercase tracking-widest mb-1" style={{ color: '#5a5a6a' }}>FINAL STATUS</p>
      <p className="text-sm font-headline font-bold tracking-tight" style={{ color: '#e8e8ef' }}>OPERATIONAL_READY</p>
    </div>
  </div>
);

export const Report = ({ uptime }) => {
  const s = Math.floor(uptime);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');

  return (
    <div className="p-5 animate-fade-in">
      {/* Title row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-2xl font-headline font-black tracking-tight" style={{ color: '#e8e8ef' }}>
            SESSION_REPORT <span style={{ color: '#5a5a6a' }}>#8842-X</span>
          </h1>
          <p className="text-[9px] font-mono uppercase tracking-widest mt-1" style={{ color: '#5a5a6a' }}>
            OPERATOR_ID: 01 // START_TIME: 2024.05.12-14:22:05 // UNIT: DMS_PRO_V4
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.open('http://localhost:8000/api/export/csv', '_blank')}
            className="px-4 py-2 text-[9px] font-headline font-bold uppercase tracking-wider cursor-pointer transition-colors"
            style={{ background: '#141419', color: '#e8e8ef', border: '0.5px solid rgba(0,212,255,0.2)' }}>
            EXPORT_CSV
          </button>
          <button 
            onClick={() => window.open('http://localhost:8000/api/export/pdf', '_blank')}
            className="px-4 py-2 text-[9px] font-headline font-bold uppercase tracking-wider cursor-pointer transition-colors"
            style={{ background: '#00d4ff', color: '#0a0a0f' }}>
            GENERATE_PDF
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <MetricCard
          label="TOTAL RISK SCORE"
          value="12.4" unit="%"
          sub="NOMINAL_THRESHOLD_RETAINED"
          subColor="#00d68f"
          icon="shield"
        />
        <MetricCard
          label="CRITICAL EVENTS"
          value="03" unit="ALERTS"
          sub="IMMEDIATE_INTERVENTION_LOGGED"
          subColor="#ffaa00"
          icon="warning"
        />
        <div className="card p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[8px] font-mono uppercase tracking-widest" style={{ color: '#5a5a6a' }}>SESSION DURATION</p>
            <span className="mat-icon" style={{ color: '#3a3a4a', fontSize: '14px' }}>schedule</span>
          </div>
          <p className="text-3xl font-headline font-black" style={{ color: '#e8e8ef' }}>{hh}:{mm}:{ss}</p>
          <div className="flex gap-4 mt-2">
            {[['ACTIVE', '82%'], ['IDLE', '15%'], ['CALIBRATION', '03%']].map(([l, v]) => (
              <div key={l}>
                <p className="text-[7px] font-mono" style={{ color: '#3a3a4a' }}>{l}</p>
                <p className="text-[9px] font-mono font-bold" style={{ color: '#8a8a9a' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[8px] font-mono uppercase tracking-widest" style={{ color: '#5a5a6a' }}>AVG FATIGUE LEVEL</p>
            <span className="mat-icon" style={{ color: '#3a3a4a', fontSize: '14px' }}>psychology</span>
          </div>
          <p className="text-3xl font-headline font-black" style={{ color: '#e8e8ef' }}>LOW</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d68f' }} />
            <span className="text-[8px] font-mono" style={{ color: '#00d68f' }}>COGNITIVE STABILITY VERIFIED</span>
          </div>
          <p className="text-[7px] font-mono mt-0.5" style={{ color: '#3a3a4a' }}>NEURAL BASELINE: STABLE</p>
        </div>
      </div>

      {/* Timeline Chart */}
      <TimelineChart />

      {/* Bottom: Incident Log + Clinical Assessment */}
      <div className="grid grid-cols-12 gap-3">
        {/* Incident Log */}
        <div className="col-span-12 lg:col-span-7 card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="mat-icon" style={{ color: '#3a3a4a', fontSize: '14px' }}>format_list_bulleted</span>
            <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase" style={{ color: '#00d4ff' }}>
              DETAILED_INCIDENT_LOG
            </h3>
          </div>
          <table className="w-full text-[9px]">
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                {['TIMESTAMP', 'EVENT_TYPE', 'SEVERITY', 'ACTION', 'STATUS'].map(h => (
                  <th key={h} className="text-left pb-2 pr-3 font-mono font-normal uppercase" style={{ color: '#5a5a6a' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {INCIDENTS.map((row, i) => (
                <tr key={i} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.03)' }}>
                  <td className="py-2.5 pr-3" style={{ color: '#5a5a6a' }}>{row.time}</td>
                  <td className="py-2.5 pr-3 font-bold" style={{ color: row.sev >= 3 ? '#ff6b6b' : '#e8e8ef' }}>{row.type}</td>
                  <td className="py-2.5 pr-3">
                    <span className="px-2 py-0.5 text-[8px] font-bold"
                      style={{ background: SEV_COLORS[row.sev], color: row.sev >= 3 ? '#fff' : '#0a0a0f' }}>
                      {row.sevLabel}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3" style={{ color: '#8a8a9a' }}>{row.action}</td>
                  <td className="py-2.5 font-bold" style={{ color: row.statusColor }}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clinical Assessment */}
        <div className="col-span-12 lg:col-span-5">
          <ClinicalAssessment />
        </div>
      </div>
    </div>
  );
};
