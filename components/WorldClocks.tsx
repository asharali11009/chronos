import React, { useState, useEffect } from 'react';
import { WorldCity } from '../types';

const CITIES: WorldCity[] = [
  { name: 'New York', timezone: 'America/New_York', flag: '🇺🇸' },
  { name: 'London', timezone: 'Europe/London', flag: '🇬🇧' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: 'Sydney', timezone: 'Australia/Sydney', flag: '🇦🇺' },
  { name: 'Dubai', timezone: 'Asia/Dubai', flag: '🇦🇪' },
];

export const WorldClocks: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl mt-8 px-4">
      {CITIES.map((city) => {
        const cityTime = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          timeZone: city.timezone,
        }).format(time);
        
        const dayPart = new Intl.DateTimeFormat('en-US', {
            timeZone: city.timezone,
            hour12: false,
            hour: 'numeric'
        }).format(time);
        
        const isNight = parseInt(dayPart) < 6 || parseInt(dayPart) > 18;

        return (
          <div 
            key={city.name} 
            className="glass p-4 rounded-xl flex flex-col items-center justify-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
          >
            <div className="text-2xl mb-1">{city.flag}</div>
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">{city.name}</h3>
            <p className={`text-xl md:text-2xl font-mono font-bold ${isNight ? 'text-indigo-300' : 'text-amber-300'}`}>
              {cityTime}
            </p>
          </div>
        );
      })}
    </div>
  );
};