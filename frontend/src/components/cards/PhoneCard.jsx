export const PhoneCard = ({ phoneDetected, phoneAlert, phoneDuration, phoneViolations }) => {
  const sec = Math.floor(phoneDuration ?? 0);
  const ms = Math.floor(((phoneDuration ?? 0) % 1) * 100);
  const timerStr = `00:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;

  const isActive = phoneAlert;

  return (
    <div
      className="col-span-12 p-4 relative transition-all duration-500"
      style={{
        background: isActive ? 'rgba(255,59,59,0.04)' : '#0f1015',
        border: `0.5px solid ${isActive ? 'rgba(255,59,59,0.3)' : 'rgba(0,212,255,0.1)'}`,
        boxShadow: isActive ? 'inset 0 0 40px rgba(255,59,59,0.06)' : 'none',
      }}
    >
      {/* Badge */}
      <div className="absolute top-0 right-0">
        <span
          className="px-2.5 py-0.5 text-[8px] font-headline font-bold tracking-wider"
          style={{
            background: isActive ? '#ff3b3b' : '#141419',
            color: isActive ? '#fff' : '#3a3a4a',
          }}
        >
          {isActive ? 'DEVICE DETECTED' : 'NO DEVICE DETECTED'}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 flex items-center justify-center"
            style={{
              background: isActive ? 'rgba(255,59,59,0.08)' : 'rgba(90,90,106,0.05)',
              border: `0.5px solid ${isActive ? 'rgba(255,59,59,0.3)' : 'rgba(90,90,106,0.15)'}`,
            }}
          >
            <span
              className={`mat-icon text-2xl ${isActive ? 'animate-phone-shake' : ''}`}
              style={{ color: isActive ? '#ff6b6b' : '#3a3a4a' }}
            >
              smartphone
            </span>
          </div>
          <div>
            <h4 className="text-sm font-headline font-bold uppercase" style={{ color: isActive ? '#ff6b6b' : '#3a3a4a' }}>
              {isActive ? 'MOBILE_DEVICE_INTERACTION' : 'DEVICE_STATUS: CLEAR'}
            </h4>
            <p className="text-[8px] font-mono tracking-widest uppercase" style={{ color: isActive ? 'rgba(255,107,107,0.6)' : '#2a2a35' }}>
              {isActive ? 'OBJECT CLASSIFICATION: PHONE (CONFIDENCE 0.99)' : 'No mobile device in frame'}
            </p>
          </div>
        </div>

        {/* Right: stats */}
        <div className="flex items-center gap-8" style={{ borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: '2rem' }}>
          <div>
            <p className="text-[7px] font-mono uppercase tracking-widest" style={{ color: '#5a5a6a' }}>ACTIVE TIMER</p>
            <p className="text-xl font-headline font-bold mt-0.5" style={{ color: isActive ? '#ff6b6b' : '#3a3a4a' }}>
              {timerStr}
            </p>
          </div>
          <div>
            <p className="text-[7px] font-mono uppercase tracking-widest" style={{ color: '#5a5a6a' }}>TOTAL VIOLATIONS</p>
            <p className="text-xl font-headline font-bold mt-0.5" style={{ color: isActive ? '#ff6b6b' : '#3a3a4a' }}>
              {String(phoneViolations ?? 0).padStart(2, '0')}
            </p>
          </div>
          <button
            className="px-4 py-1.5 font-headline font-bold uppercase text-[9px] tracking-wider transition-all"
            style={{
              background: isActive ? '#ff3b3b' : '#141419',
              color: isActive ? '#fff' : '#3a3a4a',
              border: `0.5px solid ${isActive ? '#ff3b3b' : 'rgba(90,90,106,0.2)'}`,
            }}
          >
            {isActive ? 'ISSUE INTERVENTION' : 'MONITOR ACTIVE'}
          </button>
        </div>
      </div>
    </div>
  );
};
