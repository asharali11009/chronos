import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sun, Moon, Music, User, Cloud, Calendar, LayoutGrid, Watch, Timer as TimerIcon, Palette, X, Check } from 'lucide-react';
import { AnalogClock } from './components/AnalogClock';
import { WorldClocks } from './components/WorldClocks';
import { Stopwatch } from './components/Stopwatch';
import { Timer } from './components/Timer';
import { fetchWeather, getWeatherDescription } from './services/weatherService';
import { generateDailyQuote } from './services/geminiService';
import { toggleAmbientSound, initAudioContext } from './services/audioService';
import { ClockMode, Tab, WeatherData, QuoteData, ThemeOption } from './types';

const THEMES: ThemeOption[] = [
  { id: 'auto', name: 'Automatic (Time-based)', gradientClass: '' },
  { id: 'ocean', name: 'Deep Ocean', gradientClass: 'from-blue-900 via-cyan-900 to-blue-950' },
  { id: 'sunset', name: 'Sunset Drive', gradientClass: 'from-orange-500 via-purple-600 to-indigo-900' },
  { id: 'forest', name: 'Mystic Forest', gradientClass: 'from-emerald-900 via-teal-900 to-slate-900' },
  { id: 'cyber', name: 'Cyberpunk', gradientClass: 'from-pink-700 via-purple-800 to-indigo-900' },
  { id: 'midnight', name: 'Midnight', gradientClass: 'from-slate-900 via-gray-900 to-black' },
  { id: 'berry', name: 'Berry Smoothie', gradientClass: 'from-rose-800 via-fuchsia-800 to-purple-900' },
  { id: 'aurora', name: 'Aurora', gradientClass: 'from-green-400 via-cyan-600 to-blue-800' },
];

export default function App() {
  // State
  const [time, setTime] = useState(new Date());
  const [isDark, setIsDark] = useState(true);
  const [clockMode, setClockMode] = useState<ClockMode>(ClockMode.DIGITAL);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CLOCK);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [quote, setQuote] = useState<QuoteData>({ text: "Loading inspiration...", author: "" });
  const [visitorCount, setVisitorCount] = useState(1240); // Mock initial
  
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<string>('auto');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Touch State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Configuration
  const TARGET_TIMEZONE = 'Asia/Karachi';

  // Effects
  useEffect(() => {
    // Clock Tick
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Visitor Counter Simulation
    const visitorTimer = setInterval(() => {
      setVisitorCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(visitorTimer);
    };
  }, []);

  // Click outside theme menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeMenuOpen]);

  // Init Data (Weather + Quote)
  useEffect(() => {
    const loadData = async () => {
      // 1. Get location
      let lat = 51.5074; // Default London
      let lon = -0.1278;

      if (navigator.geolocation) {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            lat = position.coords.latitude;
            lon = position.coords.longitude;
        } catch (e) {
            console.warn("Geolocation denied, using default.");
        }
      }

      // 2. Fetch Weather
      const wData = await fetchWeather(lat, lon);
      setWeather(wData);

      // 3. Generate Quote based on context
      const hours = new Date().getHours();
      const timeOfDay = hours < 12 ? "Morning" : hours < 18 ? "Afternoon" : "Night";
      const wDesc = getWeatherDescription(wData.conditionCode);
      
      const qData = await generateDailyQuote(timeOfDay, wDesc);
      setQuote(qData);
    };

    loadData();
  }, []);

  // Handlers
  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleMusicToggle = () => {
    initAudioContext();
    const nextState = !isMusicPlaying;
    setIsMusicPlaying(nextState);
    toggleAmbientSound(nextState);
  };

  // Touch Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    const tabs = [Tab.CLOCK, Tab.STOPWATCH, Tab.TIMER];
    const currentIndex = tabs.indexOf(activeTab);

    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Helper to get visual date for specific timezone (for AnalogClock)
  const getTargetDate = (baseTime: Date) => {
    // Creates a date object where getters return values matching the timezone
    // This allows the AnalogClock component to use .getHours() naturally
    return new Date(baseTime.toLocaleString('en-US', { timeZone: TARGET_TIMEZONE }));
  };

  // Dynamic Background Classes
  const getBgGradient = () => {
    // Manual Override
    if (currentTheme !== 'auto') {
      const theme = THEMES.find(t => t.id === currentTheme);
      return theme ? theme.gradientClass : '';
    }

    // Auto Logic
    const h = time.getHours();
    if (isDark) {
        // Night / Midnight / Early Morning
        if (h < 6) return 'from-slate-900 via-purple-900 to-slate-900';
        if (h > 20) return 'from-indigo-950 via-slate-900 to-black';
        return 'from-blue-900 via-slate-800 to-indigo-900';
    } else {
        // Day / Sunset
        if (h < 12) return 'from-blue-400 via-blue-200 to-white';
        if (h >= 16 && h <= 19) return 'from-orange-300 via-red-300 to-purple-300'; // Sunset
        return 'from-sky-400 via-blue-300 to-indigo-200';
    }
  };

  return (
    <div 
      className={`min-h-screen w-full transition-all duration-1000 bg-gradient-to-br ${getBgGradient()} animate-gradient-x text-white overflow-hidden relative touch-pan-y`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      
      {/* Floating Background Shapes (Pure CSS + Tailwind) */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }} />
      
      {/* Main Layout */}
      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 glass-panel p-4 rounded-2xl relative z-50">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="font-bold text-xl">C</span>
             </div>
             <h1 className="text-2xl font-bold tracking-tight hidden md:block">Chronos</h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-sm text-white/70 bg-white/5 px-3 py-1 rounded-full">
                <User size={14} />
                <span className="font-mono">{visitorCount.toLocaleString()} live</span>
             </div>
             
             {/* Theme Selector Button */}
             <button 
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className={`p-2 rounded-full transition-all ${isThemeMenuOpen ? 'bg-white/20 text-white' : 'bg-white/10 hover:bg-white/20'}`}
             >
                <Palette size={20} />
             </button>

             <button onClick={handleMusicToggle} className={`p-2 rounded-full transition-all ${isMusicPlaying ? 'bg-green-400/20 text-green-300' : 'bg-white/10 hover:bg-white/20'}`}>
                <Music size={20} className={isMusicPlaying ? 'animate-pulse' : ''} />
             </button>
             <button onClick={handleThemeToggle} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>

          {/* Theme Dropdown Menu */}
          {isThemeMenuOpen && (
            <div 
              ref={themeMenuRef}
              className="absolute top-20 right-0 w-64 glass-panel rounded-xl p-2 flex flex-col gap-1 shadow-2xl animate-float"
              style={{ animation: 'none' }}
            >
              <div className="flex justify-between items-center p-2 border-b border-white/10 mb-1">
                <span className="text-sm font-semibold text-white/80">Select Theme</span>
                <button onClick={() => setIsThemeMenuOpen(false)} className="text-white/50 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setCurrentTheme(theme.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                      currentTheme === theme.id 
                        ? 'bg-white/20 text-white font-medium' 
                        : 'hover:bg-white/10 text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                       {/* Color Preview Dot */}
                       <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${theme.id === 'auto' ? 'from-gray-400 to-gray-600' : theme.gradientClass} border border-white/20`} />
                       {theme.name}
                    </div>
                    {currentTheme === theme.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col items-center justify-start pt-4 md:pt-12">
          
          {/* Info Bar: Date & Weather */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-white/80">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                <Calendar size={16} />
                <span className="font-medium">
                    {/* Use local date for calendar info as user is physically there, but time is Pakistan */}
                    {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                <Cloud size={16} />
                <span className="font-medium">
                    {weather ? `${Math.round(weather.temperature)}°C • ${getWeatherDescription(weather.conditionCode)}` : 'Loading Weather...'}
                </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-12 bg-black/20 p-1 rounded-full backdrop-blur-md">
             {[
               { id: Tab.CLOCK, icon: LayoutGrid, label: 'World' },
               { id: Tab.STOPWATCH, icon: Watch, label: 'Stopwatch' },
               { id: Tab.TIMER, icon: TimerIcon, label: 'Timer' },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${activeTab === tab.id ? 'bg-white/20 shadow-lg text-white' : 'text-white/50 hover:text-white'}`}
               >
                 <tab.icon size={18} />
                 <span className="hidden md:inline">{tab.label}</span>
               </button>
             ))}
          </div>

          {/* Dynamic View Render */}
          <div className="w-full flex flex-col items-center min-h-[400px] transition-all duration-500">
            
            {activeTab === Tab.CLOCK && (
               <div className="flex flex-col items-center w-full animate-float">
                  {/* Clock Toggle */}
                  <div 
                    className="cursor-pointer mb-8 transition-transform hover:scale-105 active:scale-95" 
                    onClick={() => setClockMode(clockMode === ClockMode.DIGITAL ? ClockMode.ANALOG : ClockMode.DIGITAL)}
                  >
                     {clockMode === ClockMode.DIGITAL ? (
                         <div className="text-center">
                             <h1 className="text-5xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-2xl whitespace-nowrap">
                                {time.toLocaleTimeString('en-US', { hour12: true, timeZone: TARGET_TIMEZONE })}
                             </h1>
                             <p className="text-xl text-white/50 font-light tracking-[0.5em] uppercase mt-2">Pakistan Time (PKT)</p>
                         </div>
                     ) : (
                         <AnalogClock date={getTargetDate(time)} />
                     )}
                  </div>
                  <WorldClocks />
               </div>
            )}

            {activeTab === Tab.STOPWATCH && <Stopwatch />}
            
            {activeTab === Tab.TIMER && <Timer />}

          </div>
        </main>

        {/* Footer / Quote */}
        <footer className="mt-auto pt-12 pb-6 text-center w-full max-w-2xl mx-auto">
           <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500" />
              <p className="text-lg md:text-xl font-light italic leading-relaxed text-white/90">
                "{quote.text}"
              </p>
              <p className="mt-3 text-sm font-bold text-white/50 uppercase tracking-widest">
                — {quote.author}
              </p>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
           </div>
        </footer>

      </div>
    </div>
  );
}