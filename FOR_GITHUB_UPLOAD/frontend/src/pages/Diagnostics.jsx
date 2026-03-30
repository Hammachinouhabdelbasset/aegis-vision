import { useState, useEffect, useRef } from 'react';

const SYSTEM_LOGS = [
  '[12:44:01.002]  BOOT_SEQUENCE: INITIALIZING OPTICAL_PIPELINE...',
  '[12:44:01.249]  NPU_LOAD: ASSIGNING WEIGHTS TO CLINICAL_CORE_V2',
  '[12:44:01.488]  IR_ARRAY: CALIBRATION SUCCESSFUL AT 75% INTENSITY',
  '[12:44:02.102]  NETWORK: ESTABLISHED UPLINK TO AEGIS_CENTRAL_HUB',
  '[12:44:02.345]  TELEMETRY_LAG: PACKET LOSS DETECTED AT NODE_7 (RECOVERED)',
  '[12:44:03.011]  BUFFER: FLUSHING TEMPORAL_CACHE (4.2GB RELEASED)',
  '[12:44:03.567]  OPTICS: 4K_60FPS STREAM STABILIZED',
  '[12:44:04.128]  SYSTEM: HEARTBEAT NOMINAL. ALL SYSTEMS GO.',
  '[12:44:05.120]  > WAITING FOR INPUT...',
  '[12:44:06.001]  DMS_CORE: FACE DETECTION PIPELINE ACTIVE',
  '[12:44:06.234]  MODEL_V2: DROWSINESS CLASSIFIER LOADED (ONNX_RT)',
  '[12:44:06.890]  GAZE_ENGINE: PUPIL TRACKING INITIALIZED AT 120HZ',
  '[12:44:07.112]  PHONE_DET: YOLO_V8 OBJECT DETECTOR READY',
  '[12:44:07.456]  EAR_MODULE: BASELINE CALIBRATED — THRESHOLD 0.25',
  '[12:44:08.001]  SESSION: RECORDING STARTED — ID #8842-X',
  '[12:44:08.345]  SYSTEM: ALL MODULES OPERATIONAL. MONITORING ACTIVE.',
];

// Radar chart component
const RadarChart = () => {
  const axes = ['LATENCY', 'THROUGHPUT', 'STABILITY', 'ACCURACY'];
  const values = [0.85, 0.72, 0.9, 0.78]; // normalized 0-1
  const center = 130;
  const maxR = 100;
  const angleStep = (2 * Math.PI) / axes.length;

  const getPoint = (i, r) => {
    const angle = angleStep * i - Math.PI / 2;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  const dataPoints = values.map((v, i) => getPoint(i, v * maxR));
  const dataPath = dataPoints.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ') + ' Z';

  return (
    <div className="card p-5">
      <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase mb-1" style={{ color: '#e8e8ef' }}>
        <span style={{ color: '#3a3a4a' }}>▎</span> SYSTEM HEALTH RADAR
      </h3>

      <svg viewBox="0 0 260 260" className="w-full max-w-xs mx-auto">
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((r, i) => {
          const points = axes.map((_, ai) => getPoint(ai, r * maxR));
          const path = points.map(([x, y], pi) => (pi === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ') + ' Z';
          return <path key={i} d={path} fill="none" stroke="#1a1a22" strokeWidth="0.5" />;
        })}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const [x, y] = getPoint(i, maxR);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#1a1a22" strokeWidth="0.5" />;
        })}

        {/* Data area */}
        <path d={dataPath} fill="rgba(0,212,255,0.08)" stroke="#00d4ff" strokeWidth="1.5" />

        {/* Data points */}
        {dataPoints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#0a0a0f" stroke="#00d4ff" strokeWidth="1.5" />
        ))}

        {/* Labels */}
        {axes.map((label, i) => {
          const [x, y] = getPoint(i, maxR + 18);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fill="#5a5a6a" fontSize="7" fontFamily="JetBrains Mono, monospace">
              {label}
            </text>
          );
        })}
      </svg>

      {/* Bottom metrics */}
      <div className="grid grid-cols-4 gap-3 mt-3">
        {[
          ['LATENCY', '14ms'],
          ['LOAD', '42%'],
          ['THERMAL', '31°C'],
          ['UPTIME', '99.9'],
        ].map(([label, value]) => (
          <div key={label} className="text-center">
            <p className="text-[7px] font-mono uppercase" style={{ color: '#3a3a4a' }}>{label}</p>
            <p className="text-lg font-headline font-bold mt-0.5" style={{ color: '#e8e8ef' }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// System module card
const ModuleCard = ({ icon, title, badge, badgeColor, metrics }) => (
  <div className="card p-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.06)', border: '0.5px solid rgba(0,212,255,0.15)' }}>
        <span className="mat-icon" style={{ color: '#00d4ff', fontSize: '16px' }}>{icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="text-[9px] font-headline font-bold uppercase tracking-wider" style={{ color: '#e8e8ef' }}>{title}</h4>
      </div>
      <span className="px-2 py-0.5 text-[7px] font-mono font-bold tracking-wider"
        style={{ background: `${badgeColor}15`, color: badgeColor, border: `0.5px solid ${badgeColor}30` }}>
        {badge}
      </span>
    </div>
    <div className="space-y-1.5">
      {metrics.map(([label, value]) => (
        <div key={label} className="flex justify-between items-center py-1" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.03)' }}>
          <span className="text-[8px] font-mono" style={{ color: '#5a5a6a' }}>{label}</span>
          <span className="text-[9px] font-mono font-semibold" style={{ color: '#e8e8ef' }}>{value}</span>
        </div>
      ))}
    </div>
  </div>
);

// Live log component
const LiveLogs = () => {
  const [logs, setLogs] = useState(SYSTEM_LOGS.slice(0, 8));
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null);
  const indexRef = useRef(8);

  useEffect(() => {
    const t = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, SYSTEM_LOGS[indexRef.current % SYSTEM_LOGS.length]];
        indexRef.current++;
        return next.slice(-20);
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: '#00d68f' }} />
          <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase" style={{ color: '#e8e8ef' }}>
            LIVE_SYSTEM_LOGS
          </h3>
        </div>
        <button
          onClick={() => setAutoScroll(v => !v)}
          className="text-[8px] font-mono tracking-wider px-2 py-0.5"
          style={{ color: autoScroll ? '#00d68f' : '#5a5a6a', background: '#141419', border: '0.5px solid rgba(0,212,255,0.08)' }}
        >
          AUTO_SCROLL: {autoScroll ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ height: '200px', background: '#0c0c12', border: '0.5px solid rgba(0,212,255,0.06)', padding: '0.75rem' }}
      >
        {logs.map((log, i) => (
          <p key={i} className="text-[9px] font-mono leading-relaxed animate-fade-in" style={{
            color: log.includes('ERROR') || log.includes('LOSS') ? '#ffaa00' :
              log.includes('WAITING') || log.includes('>') ? '#3a3a4a' : '#8a8a9a',
          }}>
            {log}
          </p>
        ))}
        <span className="animate-blink text-[9px] font-mono" style={{ color: '#00d4ff' }}>▊</span>
      </div>
    </div>
  );
};

export const Diagnostics = () => {
  return (
    <div className="p-5 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#5a5a6a' }}>DIAGNOSTIC ENVIRONMENT</p>
          <h1 className="text-2xl font-headline font-black tracking-tight" style={{ color: '#e8e8ef' }}>
            SENSOR_HEALTH_REPORT
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-mono" style={{ color: '#3a3a4a' }}>REF_ID: AX.7700.DX</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d68f' }} />
            <span className="text-[8px] font-mono" style={{ color: '#00d68f' }}>SYSTEM_NOMINAL</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Radar chart */}
        <div className="col-span-12 lg:col-span-5">
          <RadarChart />
        </div>

        {/* Right modules */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-3">
          <ModuleCard
            icon="videocam"
            title="OPTICAL_CORE_01"
            badge="ACTIVE"
            badgeColor="#00d68f"
            metrics={[
              ['RESOLUTION', '3840x2160'],
              ['FRAME_RATE', '60.00 FPS'],
              ['THERMAL', '42.4°C'],
              ['FRAME_LOSS', '0.02%'],
            ]}
          />
          <ModuleCard
            icon="memory"
            title="NEURAL_PROCESSING_UNIT"
            badge="OPTIMIZED"
            badgeColor="#00d4ff"
            metrics={[
              ['INFERENCE_LATENCY', '4.2ms'],
              ['MODEL_VERSION', 'v2.4.9-CLIN'],
              ['SYSTEM_LOAD', '64%'],
              ['THREAD_POOL', '12 ACTIVE'],
            ]}
          />
          <ModuleCard
            icon="cell_tower"
            title="TELEMETRY_UPLINK"
            badge="CONNECTED"
            badgeColor="#00d68f"
            metrics={[
              ['SIGNAL_STRENGTH', '-42 dBm'],
              ['THROUGHPUT', '128 MB/s'],
              ['PROTOCOL', 'AEGIS_SECURE_V3'],
              ['ENCRYPTION', 'AES-256-GCM'],
            ]}
          />
          <ModuleCard
            icon="flashlight_on"
            title="IR_ILLUMINATION_ARRAY"
            badge="NOMINAL"
            badgeColor="#00d4ff"
            metrics={[
              ['INTENSITY', '75%'],
              ['PULSE_FREQUENCY', '300 Hz'],
              ['WAVELENGTH', '850nm NIR'],
              ['POWER_DRAW', '2.4W'],
            ]}
          />
        </div>

        {/* Live logs */}
        <div className="col-span-12">
          <LiveLogs />
        </div>
      </div>
    </div>
  );
};
