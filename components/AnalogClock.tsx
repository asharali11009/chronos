import React, { useEffect, useState } from 'react';

interface AnalogClockProps {
  date: Date;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ date }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours();

  const secondDegrees = ((seconds / 60) * 360);
  const minuteDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6);
  const hourDegrees = ((hours % 12) / 12) * 360 + ((minutes / 60) * 30);

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center rounded-full border-4 border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)] glass-panel">
      {/* Clock Face Markers */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-4 bg-white/60 ${i % 3 === 0 ? 'h-6 bg-white/90 w-1.5' : ''}`}
          style={{
            transform: `rotate(${i * 30}deg) translateY(-110px)`, // Adjust radius
            transformOrigin: 'center 110px + 50%' // Center pivot trick
          }}
        />
      ))}

      {/* Center Dot */}
      <div className="absolute w-4 h-4 bg-indigo-500 rounded-full z-20 shadow-glow" />

      {/* Hour Hand */}
      <div
        className="absolute w-2 h-20 bg-white/90 rounded-full origin-bottom z-10 shadow-lg"
        style={{
          transform: `translateY(-50%) rotate(${hourDegrees}deg)`,
          transition: mounted ? 'transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44)' : 'none'
        }}
      />

      {/* Minute Hand */}
      <div
        className="absolute w-1.5 h-28 bg-blue-300/90 rounded-full origin-bottom z-10 shadow-lg"
        style={{
          transform: `translateY(-50%) rotate(${minuteDegrees}deg)`,
          transition: mounted ? 'transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44)' : 'none'
        }}
      />

      {/* Second Hand */}
      <div
        className="absolute w-0.5 h-32 bg-red-400/90 rounded-full origin-bottom z-10 shadow-sm"
        style={{
          transform: `translateY(-50%) rotate(${secondDegrees}deg)`,
          transition: 'none' // Seconds should be instantaneous or linear, no bounce usually
        }}
      />
      
      {/* Inner Glow decoration */}
      <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
    </div>
  );
};