import { useState, useEffect, useRef } from 'react';

const STEPS = [
  { label: 'FACE DETECTED' },
  { label: 'MEASURING EAR' },
  { label: 'NEURAL MAPPING' },
  { label: 'COMPLETE' },
];

export const Calibration = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepsDone, setStepsDone] = useState([false, false, false, false]);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  const circumference = 502.65;

  const completeStep = (i) => {
    setStepsDone(prev => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  };

  const startCalibration = () => {
    setStarted(true);
    setProgress(0);
    setStepsDone([false, false, false, false]);
    setDone(false);

    const total = 4000;
    let elapsed = 0;

    intervalRef.current = setInterval(() => {
      elapsed += 50;
      setProgress(Math.min(1, elapsed / total));

      if (elapsed >= 400)  completeStep(0);
      if (elapsed >= 1200) completeStep(1);
      if (elapsed >= 2400) completeStep(2);

      if (elapsed >= total) {
        clearInterval(intervalRef.current);
        completeStep(3);
        setDone(true);
        setTimeout(() => onComplete?.(), 3000);
      }
    }, 50);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const pct = (progress * 100).toFixed(1);

  return (
    <div className="p-5 h-full flex flex-col items-center justify-center animate-fade-in">
      {/* Status line */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[9px] font-mono tracking-widest" style={{ color: '#5a5a6a' }}>
          SEC_LAYER_01 // {done ? 'CALIBRATION_COMPLETE' : started ? 'CALIBRATING' : 'READY'}
        </span>
        <div className="w-1 h-1 rounded-full animate-pulse-slow" style={{ background: done ? '#00d68f' : '#00d4ff' }} />
      </div>

      {/* Face wireframe with scanning rings */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-6">
        {/* Scanning rings */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 260" style={{ opacity: 0.12 }}>
          <circle cx="130" cy="130" r="60"  fill="none" stroke="#00d4ff" strokeWidth="0.5" />
          <circle cx="130" cy="130" r="90"  fill="none" stroke="#00d4ff" strokeWidth="0.5" />
          <circle cx="130" cy="130" r="120" fill="none" stroke="#00d4ff" strokeWidth="0.3" />
          <line x1="130" y1="10" x2="130" y2="250" stroke="#00d4ff" strokeWidth="0.3" />
          <line x1="10" y1="130" x2="250" y2="130" stroke="#00d4ff" strokeWidth="0.3" />
        </svg>

        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="80" fill="none" stroke="#1a1a22" strokeWidth="3" />
          <circle
            cx="130" cy="130" r="80"
            fill="none"
            stroke={done ? '#00d68f' : '#00d4ff'}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s' }}
          />
        </svg>

        {/* Face wireframe */}
        <svg width="120" height="150" viewBox="0 0 120 150" style={{ opacity: done ? 0.15 : 0.4 }}>
          <ellipse cx="60" cy="70" rx="40" ry="50" fill="none" stroke="#00d4ff" strokeWidth="0.6" strokeDasharray="3 2" />
          <ellipse cx="43" cy="58" rx="10" ry="6" fill="none" stroke="#00d4ff" strokeWidth="0.6" />
          <ellipse cx="77" cy="58" rx="10" ry="6" fill="none" stroke="#00d4ff" strokeWidth="0.6" />
          <circle cx="43" cy="58" r="3" fill="#00d4ff" opacity="0.5" />
          <circle cx="77" cy="58" r="3" fill="#00d4ff" opacity="0.5" />
          <path d="M50 90 Q60 96 70 90" fill="none" stroke="#00d4ff" strokeWidth="0.6" />
          <line x1="60" y1="20" x2="60" y2="120" stroke="#00d4ff" strokeWidth="0.2" opacity="0.3" strokeDasharray="2 3" />
        </svg>

        {/* Completion check */}
        {done && (
          <span className="absolute mat-icon text-4xl" style={{ color: '#00d68f' }}>check_circle</span>
        )}
      </div>

      {/* Instruction */}
      <h2 className="text-lg font-headline font-black uppercase tracking-tight mb-1" style={{ color: done ? '#00d68f' : '#e8e8ef' }}>
        {done ? 'CALIBRATION COMPLETE' : 'LOOK STRAIGHT AT CAMERA'}
      </h2>
      <p className="text-[10px] font-mono uppercase tracking-widest mb-6" style={{ color: '#5a5a6a' }}>
        {done ? 'Returning to dashboard in 3 seconds...' : 'MAINTAIN NEUTRAL EXPRESSION FOR BASELINE CAPTURE'}
      </p>

      {/* Neural mapping progress */}
      <div className="w-80 mb-5">
        <div className="flex justify-between items-center mb-1.5" style={{ background: '#0f1015', border: '0.5px solid rgba(0,212,255,0.1)', padding: '8px 12px' }}>
          <span className="text-[9px] font-headline font-bold uppercase" style={{ color: '#00d4ff' }}>NEURAL MAPPING</span>
          <span className="text-[10px] font-mono font-bold" style={{ color: '#e8e8ef' }}>{pct}%</span>
        </div>
        <div className="h-1" style={{ background: '#1a1a22' }}>
          <div className="h-full transition-all" style={{ width: `${pct}%`, background: done ? '#00d68f' : '#00d4ff' }} />
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-3 mb-6">
        {[
          { label: 'SYNAPSE', value: stepsDone[0] ? 'SYNCED' : 'PENDING', active: stepsDone[0] },
          { label: 'OPTIC',   value: stepsDone[1] ? 'VALID'  : 'PENDING', active: stepsDone[1] },
          { label: 'DMS',     value: stepsDone[2] ? 'ACTIVE' : 'PENDING', active: stepsDone[2] },
        ].map(b => (
          <div key={b.label} className="text-center px-4 py-2"
            style={{ background: '#0f1015', border: `0.5px solid ${b.active ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.04)'}` }}>
            <p className="text-[7px] font-mono uppercase" style={{ color: '#5a5a6a' }}>{b.label}</p>
            <p className="text-[10px] font-headline font-bold uppercase mt-0.5"
              style={{ color: b.active ? '#e8e8ef' : '#3a3a4a' }}>{b.value}</p>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="flex gap-5 mb-5">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 flex items-center justify-center"
              style={{ border: `0.5px solid ${stepsDone[i] ? '#00d68f' : '#2a2a35'}` }}>
              {stepsDone[i]
                ? <span className="mat-icon" style={{ color: '#00d68f', fontSize: '10px' }}>check</span>
                : <span className="text-[7px]" style={{ color: '#3a3a4a' }}>{i + 1}</span>
              }
            </div>
            <span className="text-[8px] font-mono uppercase" style={{ color: stepsDone[i] ? '#00d68f' : '#3a3a4a' }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      {!started && (
        <button
          onClick={startCalibration}
          className="px-8 py-2.5 font-headline font-bold uppercase text-[10px] tracking-wider mb-3"
          style={{ background: '#00d4ff', color: '#0a0a0f' }}
        >
          BEGIN CALIBRATION
        </button>
      )}
      <button
        onClick={() => onComplete?.()}
        className="text-[8px] font-mono uppercase tracking-widest transition-colors"
        style={{ color: '#3a3a4a' }}
        onMouseEnter={e => e.currentTarget.style.color = '#8a8a9a'}
        onMouseLeave={e => e.currentTarget.style.color = '#3a3a4a'}
      >
        SKIP CALIBRATION
      </button>

      {/* Environment info panel (like reference image) */}
      <div className="absolute top-16 right-8">
        <div className="card p-3" style={{ width: '200px' }}>
          <div className="flex justify-between items-center mb-2 pb-1" style={{ borderBottom: '0.5px solid rgba(0,212,255,0.08)' }}>
            <span className="text-[8px] font-headline font-bold uppercase" style={{ color: '#e8e8ef' }}>ENVIRONMENT</span>
            <span className="text-[7px] font-mono" style={{ color: '#3a3a4a' }}>REF_ID: 9942</span>
          </div>
          {[
            ['ILLUMINATION', 'OPTIMAL', '#00d68f'],
            ['GAZE LOCK', 'LOCKED', '#00d4ff'],
            ['SYSTEM LOAD', 'NORMAL', '#e8e8ef'],
          ].map(([label, value, color]) => (
            <div key={label} className="flex justify-between py-1" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.03)' }}>
              <span className="text-[8px] font-mono" style={{ color: '#5a5a6a' }}>{label}</span>
              <span className="text-[8px] font-headline font-bold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
