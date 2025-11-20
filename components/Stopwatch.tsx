import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

export const Stopwatch: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleLap = () => {
    setLaps(prev => [time, ...prev]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="text-6xl md:text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8 tracking-wider drop-shadow-lg">
        {formatTime(time)}
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`p-4 rounded-full transition-all duration-200 ${
            isRunning 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50' 
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50'
          }`}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={handleLap}
          disabled={!isRunning}
          className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 disabled:opacity-50 transition-all duration-200"
        >
          <Flag size={24} />
        </button>

        <button
          onClick={handleReset}
          className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-200"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {laps.length > 0 && (
        <div className="w-full max-h-60 overflow-y-auto glass rounded-xl p-2 space-y-2 custom-scrollbar">
          {laps.map((lapTime, index) => (
            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <span className="text-white/60 text-sm">Lap {laps.length - index}</span>
              <span className="font-mono text-lg text-white">{formatTime(lapTime)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};