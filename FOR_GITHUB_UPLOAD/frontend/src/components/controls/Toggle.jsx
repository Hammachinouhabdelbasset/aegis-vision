import { useState } from 'react';

export const Toggle = ({ label, initialState = false, onChange }) => {
  const [isOn, setIsOn] = useState(initialState);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    onChange?.(newState);
  };

  return (
    <div className="flex justify-between items-center py-1 border-b border-outline-variant/10">
      <span className="text-[10px] font-mono uppercase text-slate-300">{label}</span>
      <button
        onClick={handleToggle}
        className="w-10 h-5 relative transition-colors"
        style={{
          background: isOn ? '#00d4ff' : '#353439',
          borderRadius: '0px',
        }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 bg-background transition-transform"
          style={{
            borderRadius: '0px',
            transform: isOn ? 'translateX(20px)' : 'translateX(2px)',
          }}
        ></span>
      </button>
    </div>
  );
};
