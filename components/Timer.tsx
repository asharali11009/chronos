import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const Timer: React.FC = () => {
  const [duration, setDuration] = useState<number>(300000); // Default 5 min
  const [timeLeft, setTimeLeft] = useState<number>(300000);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const intervalRef = useRef<any>(null);

  // Inputs for manual setting
  const [inputMin, setInputMin] = useState(5);
  const [inputSec, setInputSec] = useState(0);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            setIsRunning(false);
            // Vibrate on mobile when done
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetTime = () => {
    const newTime = (inputMin * 60 * 1000) + (inputSec * 1000);
    setDuration(newTime);
    setTimeLeft(newTime);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      {isEditing ? (
        <div className="glass p-6 rounded-2xl flex flex-col items-center gap-4 mb-8 animate-float">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <label className="text-xs text-white/50 mb-1">MIN</label>
              <input 
                type="number" 
                value={inputMin} 
                onChange={(e) => setInputMin(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 h-16 text-3xl text-center bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <span className="text-4xl text-white/50">:</span>
            <div className="flex flex-col items-center">
              <label className="text-xs text-white/50 mb-1">SEC</label>
              <input 
                type="number" 
                value={inputSec} 
                onChange={(e) => setInputSec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-20 h-16 text-3xl text-center bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <button 
            onClick={handleSetTime}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-colors"
          >
            Set Timer
          </button>
        </div>
      ) : (
        <div 
          onClick={() => !isRunning && setIsEditing(true)}
          className={`cursor-pointer text-7xl md:text-8xl font-mono font-bold mb-8 tracking-widest transition-all duration-300 ${timeLeft === 0 ? 'text-red-500 animate-pulse' : 'text-white hover:text-blue-300'}`}
        >
          {formatTime(timeLeft)}
        </div>
      )}

      {/* Circular Progress Indicator */}
      <div className="relative w-64 h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
          style={{ width: `${(timeLeft / duration) * 100}%` }}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={timeLeft === 0 && !isRunning}
          className={`p-5 rounded-full transition-all duration-200 ${
            isRunning 
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50' 
              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50'
          }`}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} />}
        </button>
        
        <button
          onClick={() => { setIsRunning(false); setTimeLeft(duration); }}
          className="p-5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all duration-200"
        >
          <RotateCcw size={28} />
        </button>
      </div>
    </div>
  );
};