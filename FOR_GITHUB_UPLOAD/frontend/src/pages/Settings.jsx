import { useState } from 'react';

const SLIDERS = [
  { key: 'ear',    label: 'EAR THRESHOLD',       min: 0.10, max: 0.40, val: 0.25, step: 0.01 },
  { key: 'mar',    label: 'YAWN SENSITIVITY (MAR)', min: 0.30, max: 0.80, val: 0.55, step: 0.01 },
  { key: 'gaze',   label: 'GAZE TIMEOUT',          min: 1.0,  max: 5.0,  val: 2.5,  step: 0.1, unit: 's' },
  { key: 'phone',  label: 'PHONE ALERT DELAY',     min: 1,    max: 5,    val: 2,    step: 1,   unit: 's' },
  { key: 'perclos',label: 'PERCLOS WINDOW',         min: 30,   max: 120,  val: 60,   step: 5,   unit: 's' },
];

const TOGGLES_ALERT = [
  { label: 'SOUND ALERTS',             on: true },
  { label: 'DESKTOP NOTIFICATIONS',    on: true },
  { label: 'FLASH SCREEN ON CRITICAL', on: true },
  { label: 'VIBRATION FEEDBACK',       on: false },
];

const TOGGLES_APPEARANCE = [
  { label: 'DARK MODE',          on: true },
  { label: 'SCANLINE EFFECT',    on: false },
  { label: 'HUD OVERLAY ON FEED', on: true },
  { label: 'BINARY RAIN BG',     on: false },
];

const RangeSlider = ({ label, min, max, initialVal, step, unit }) => {
  const [v, setV] = useState(initialVal);
  const pct = ((v - min) / (max - min)) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: '#5a5a6a' }}>{label}</span>
        <span className="text-[9px] font-mono font-bold" style={{ color: '#00d4ff' }}>
          {step < 1 ? v.toFixed(2) : v}{unit || ''}
        </span>
      </div>
      <div className="relative h-1" style={{ background: '#1a1a22' }}>
        <div className="absolute h-full" style={{ width: `${pct}%`, background: 'rgba(0,212,255,0.5)' }} />
        <input
          type="range" min={min} max={max} step={step} value={v}
          onChange={e => setV(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

const Toggle = ({ label, initialOn }) => {
  const [on, setOn] = useState(initialOn);
  return (
    <div className="flex justify-between items-center py-2.5" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.03)' }}>
      <span className="text-[9px] font-mono uppercase" style={{ color: '#8a8a9a' }}>{label}</span>
      <button
        onClick={() => setOn(v => !v)}
        className="w-9 h-4 relative transition-colors"
        style={{ background: on ? '#00d4ff' : '#1a1a22', border: `0.5px solid ${on ? '#00d4ff' : '#2a2a35'}` }}
      >
        <span className="absolute top-0.5 h-2.5 w-3 transition-all"
          style={{ background: on ? '#0a0a0f' : '#3a3a4a', left: on ? '18px' : '2px' }} />
      </button>
    </div>
  );
};

export const Settings = () => {
  const [saved, setSaved] = useState(false);
  const [driverName, setDriverName] = useState('Operator_01');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-5 animate-fade-in">
      <h1 className="text-2xl font-headline font-black tracking-tight mb-1" style={{ color: '#e8e8ef' }}>
        SYSTEM_CONFIG
      </h1>
      <p className="text-[9px] font-mono uppercase tracking-widest mb-5" style={{ color: '#3a3a4a' }}>
        DETECTION PARAMETERS AND PREFERENCES
      </p>

      <div className="grid grid-cols-12 gap-3">
        {/* Driver Profile */}
        <div className="col-span-12 md:col-span-4 card p-5">
          <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase mb-4" style={{ color: '#00d4ff' }}>
            DRIVER_PROFILE
          </h3>
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-14 h-14 flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.06)', border: '0.5px solid rgba(0,212,255,0.2)' }}>
              <span className="text-xl font-headline font-black" style={{ color: '#00d4ff' }}>OP</span>
            </div>
            <span className="text-[8px] font-mono" style={{ color: '#3a3a4a' }}>OPERATOR_01</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[8px] font-mono uppercase tracking-widest mb-1 block" style={{ color: '#5a5a6a' }}>DRIVER NAME</label>
              <input type="text" value={driverName} onChange={e => setDriverName(e.target.value)}
                className="w-full px-3 py-2 text-[10px] font-mono outline-none"
                style={{ background: '#0c0c12', border: '0.5px solid rgba(0,212,255,0.1)', color: '#e8e8ef' }} />
            </div>
            <div>
              <label className="text-[8px] font-mono uppercase tracking-widest mb-1 block" style={{ color: '#5a5a6a' }}>SESSION ID</label>
              <input type="text" value="SES_2026_001" readOnly
                className="w-full px-3 py-2 text-[10px] font-mono outline-none"
                style={{ background: '#0c0c12', border: '0.5px solid rgba(0,212,255,0.06)', color: '#3a3a4a' }} />
            </div>
            <button onClick={handleSave}
              className="w-full py-2 font-headline font-bold text-[9px] uppercase tracking-wider transition-all"
              style={{ background: saved ? '#00d68f' : '#00d4ff', color: '#0a0a0f' }}>
              {saved ? '✓ SAVED' : 'SAVE PROFILE'}
            </button>
          </div>
        </div>

        {/* Detection Sensitivity */}
        <div className="col-span-12 md:col-span-8 card p-5">
          <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase mb-4" style={{ color: '#00d4ff' }}>
            DETECTION_SENSITIVITY
          </h3>
          {SLIDERS.map(s => (
            <RangeSlider key={s.key} label={s.label} min={s.min} max={s.max} initialVal={s.val} step={s.step} unit={s.unit} />
          ))}
        </div>

        {/* Alert Preferences */}
        <div className="col-span-12 md:col-span-6 card p-5">
          <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase mb-3" style={{ color: '#00d4ff' }}>
            ALERT_PREFERENCES
          </h3>
          {TOGGLES_ALERT.map(t => (
            <Toggle key={t.label} label={t.label} initialOn={t.on} />
          ))}
        </div>

        {/* Appearance */}
        <div className="col-span-12 md:col-span-6 card p-5">
          <h3 className="text-[10px] font-headline font-bold tracking-widest uppercase mb-3" style={{ color: '#00d4ff' }}>
            APPEARANCE
          </h3>
          {TOGGLES_APPEARANCE.map(t => (
            <Toggle key={t.label} label={t.label} initialOn={t.on} />
          ))}
          <button onClick={handleSave}
            className="w-full mt-3 py-2 font-headline font-bold text-[9px] uppercase tracking-wider transition-all"
            style={{ background: saved ? '#00d68f' : '#141419', color: saved ? '#0a0a0f' : '#e8e8ef', border: '0.5px solid rgba(0,212,255,0.15)' }}>
            {saved ? '✓ CONFIGURATION APPLIED' : 'APPLY ALL SETTINGS'}
          </button>
        </div>
      </div>
    </div>
  );
};
