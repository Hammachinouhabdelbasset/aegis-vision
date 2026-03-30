import { useState } from 'react';

export const RangeSlider = ({ label, min, max, value: initialValue, step, unit, onChange }) => {
  const [value, setValue] = useState(initialValue);
  const fillPercent = ((value - min) / (max - min)) * 100;

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-mono text-primary">
          {value.toFixed(step < 1 ? 2 : 0)}
          {unit}
        </span>
      </div>
      <div className="relative h-1 bg-surface-highest">
        <div
          className="absolute h-full bg-primary/30 transition-all"
          style={{ width: `${fillPercent}%` }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};
