import { useState, useEffect } from 'react';

export const LiveFeed = ({ pitch, yaw, roll }) => {
  const [ts, setTs] = useState('');

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setTs(now.toTimeString().slice(0, 8));
    }, 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="col-span-12 lg:col-span-7 relative overflow-hidden card"
      style={{ height: '280px', background: '#0c0c12' }}
    >
      {/* Subtle radial grid */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="320" height="320" viewBox="0 0 320 320" style={{ opacity: 0.08 }}>
          <circle cx="160" cy="160" r="40"  fill="none" stroke="#00d4ff" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="80"  fill="none" stroke="#00d4ff" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="120" fill="none" stroke="#00d4ff" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="155" fill="none" stroke="#00d4ff" strokeWidth="0.3" />
          <line x1="160" y1="5"  x2="160" y2="315" stroke="#00d4ff" strokeWidth="0.3" />
          <line x1="5"  y1="160" x2="315" y2="160" stroke="#00d4ff" strokeWidth="0.3" />
        </svg>
      </div>

      {/* Face wireframe */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="180" height="220" viewBox="0 0 180 220"
          style={{
            transform: `rotateX(${(pitch * 0.3).toFixed(1)}deg) rotateY(${(yaw * 0.3).toFixed(1)}deg)`,
            transition: 'transform 0.5s ease',
            opacity: 0.55,
          }}
        >
          {/* Head outline */}
          <ellipse cx="90" cy="100" rx="60" ry="75" fill="none" stroke="#00d4ff" strokeWidth="0.8" />
          {/* Jaw */}
          <path d="M30 100 Q50 175 90 185 Q130 175 150 100" fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeDasharray="3 2" />
          {/* Eyes */}
          <ellipse cx="65" cy="85" rx="15" ry="8" fill="none" stroke="#00d4ff" strokeWidth="0.7" />
          <ellipse cx="115" cy="85" rx="15" ry="8" fill="none" stroke="#00d4ff" strokeWidth="0.7" />
          {/* Irises */}
          <circle cx="65" cy="85" r="5" fill="rgba(0,212,255,0.3)" stroke="#00d4ff" strokeWidth="0.5" />
          <circle cx="115" cy="85" r="5" fill="rgba(0,212,255,0.3)" stroke="#00d4ff" strokeWidth="0.5" />
          {/* Pupils */}
          <circle cx="65" cy="85" r="2" fill="#00d4ff" opacity="0.8" />
          <circle cx="115" cy="85" r="2" fill="#00d4ff" opacity="0.8" />
          {/* Eyebrows */}
          <path d="M48 72 Q65 65 82 72" fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.6" />
          <path d="M98 72 Q115 65 132 72" fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.6" />
          {/* Nose */}
          <path d="M90 90 L85 115 Q90 118 95 115 Z" fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.5" />
          {/* Mouth */}
          <path d="M70 135 Q90 142 110 135" fill="none" stroke="#00d4ff" strokeWidth="0.6" />
          {/* Contour mesh lines */}
          <path d="M30 85 Q60 60 90 58 Q120 60 150 85" fill="none" stroke="#00d4ff" strokeWidth="0.2" opacity="0.3" />
          <path d="M35 115 Q60 100 90 98 Q120 100 145 115" fill="none" stroke="#00d4ff" strokeWidth="0.2" opacity="0.3" />
          {/* Tracking labels */}
          <text x="42" y="78" fill="#00d4ff" fontSize="6" fontFamily="JetBrains Mono, monospace" opacity="0.5">L_OCULAR_TRACK</text>
          <text x="95" y="78" fill="#00d4ff" fontSize="6" fontFamily="JetBrains Mono, monospace" opacity="0.5">R_OCULAR_TRACK</text>
        </svg>
      </div>

      {/* Binary rain background (decorative) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/4 overflow-hidden opacity-[0.03]">
        <pre className="text-[8px] font-mono leading-tight" style={{ color: '#00d4ff' }}>
          {Array(40).fill(null).map((_, i) =>
            Array(20).fill(null).map(() => Math.random() > 0.5 ? '1' : '0').join('') + '\n'
          ).join('')}
        </pre>
      </div>

      {/* Top-left: REC badge */}
      <div className="absolute top-3 left-3 px-2.5 py-1" style={{ background: '#0f1015', border: '0.5px solid rgba(0,212,255,0.2)' }}>
        <span className="text-[9px] font-mono tracking-widest" style={{ color: '#e8e8ef' }}>
          <span className="animate-blink" style={{ color: '#ff3b3b' }}>●</span>
          {' '}REC · CAM_01_NIR
        </span>
      </div>

      {/* Top-right: Camera info */}
      <div className="absolute top-3 right-3 text-right space-y-0.5">
        <p className="text-[9px] font-mono" style={{ color: '#5a5a6a' }}>ISO 1200 | F2.8</p>
        <p className="text-[9px] font-mono" style={{ color: '#5a5a6a' }}>LAT: 51.5074 N</p>
      </div>

      {/* Bottom-left: Signal */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1.5" style={{ background: '#0f1015', border: '0.5px solid rgba(0,212,255,0.15)' }}>
        <div className="flex justify-between text-[8px] font-mono mb-0.5" style={{ color: '#8a8a9a' }}>
          <span>SIGNAL STRENGTH</span>
          <span style={{ color: '#00d4ff' }}>98%</span>
        </div>
        <div className="w-32 h-0.5" style={{ background: '#1a1a22' }}>
          <div className="h-full" style={{ width: '98%', background: '#00d4ff' }} />
        </div>
      </div>
    </div>
  );
};
