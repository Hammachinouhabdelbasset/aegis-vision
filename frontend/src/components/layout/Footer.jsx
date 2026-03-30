import { useState, useEffect } from 'react';

export const Footer = ({ uptime, isConnected }) => {
  const [fps, setFps] = useState('60.00');
  const [latency, setLatency] = useState('14');

  useEffect(() => {
    const t = setInterval(() => {
      setFps((58 + Math.random() * 4).toFixed(2));
      setLatency(String(Math.floor(10 + Math.random() * 12)));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const s = Math.floor(uptime);
  const hh = String(Math.floor(s / 3600)).padStart(3, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center px-5"
      style={{
        height: '1.5rem',
        background: '#0a0a0f',
        borderTop: '0.5px solid rgba(0,212,255,0.08)',
      }}
    >
      <div className="flex gap-8">
        <span className="text-[9px] font-mono tracking-widest" style={{ color: '#5a5a6a' }}>
          SYS_UPTIME: {hh}:{mm}:{ss}
        </span>
        <span className="text-[9px] font-mono tracking-widest" style={{ color: '#5a5a6a' }}>
          FPS: {fps}
        </span>
        <span className="text-[9px] font-mono tracking-widest"
          style={{ color: isConnected ? '#00d68f' : '#ff3b3b' }}>
          LATENCY: {latency}MS
        </span>
      </div>
      <span className="text-[9px] font-mono tracking-widest" style={{ color: '#3a3a4a' }}>
        © 2024 AEGIS CLINICAL SOLUTIONS
      </span>
    </footer>
  );
};
