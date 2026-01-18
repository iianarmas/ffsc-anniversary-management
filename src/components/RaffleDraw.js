import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Play, RotateCcw, Users, Sparkles, Maximize, Minimize } from 'lucide-react';
import Header from './Header';

export default function RaffleDraw({ people }) {
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [winner, setWinner] = useState(null);
  const [previousWinners, setPreviousWinners] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Get eligible people (checked in, age filtered)
  const eligiblePeople = people.filter(person => {
    // Must be checked in
    if (!person.registered) return false;
    
    // Age filter
    const age = parseInt(person.age);
    if (isNaN(age)) return false;
    
    const min = minAge === '' ? 0 : parseInt(minAge);
    const max = maxAge === '' ? 999 : parseInt(maxAge);
    
    return age >= min && age <= max;
  });

  // Initialize Audio Context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Sound effect functions
  const playTickSound = () => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Increased from 0.1 to 0.3
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      console.debug('Audio not available');
    }
  };

  const playDrumRoll = () => {
    try {
      const audioContext = getAudioContext();
      const duration = 2.5;
      
      for (let i = 0; i < 25; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 100 + Math.random() * 50;
        oscillator.type = 'sawtooth';
        
        const time = audioContext.currentTime + (i * duration / 25);
        gainNode.gain.setValueAtTime(0.2, time); // Increased from 0.05 to 0.2
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        
        oscillator.start(time);
        oscillator.stop(time + 0.05);
      }
    } catch (error) {
      console.debug('Audio not available');
    }
  };

  const playWinnerSound = () => {
    try {
      const audioContext = getAudioContext();
      
      // HUGE CROWD "HOORAY!" - Initial celebration explosion
      for (let i = 0; i < 200; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Wide range of frequencies for crowd voices
        oscillator.frequency.value = 150 + Math.random() * 900;
        oscillator.type = Math.random() > 0.5 ? 'sawtooth' : 'square';
        
        filter.type = 'bandpass';
        filter.frequency.value = 400 + Math.random() * 1800;
        filter.Q.value = 1.5;
        
        const startTime = audioContext.currentTime + (Math.random() * 0.4);
        const duration = 1.2 + Math.random() * 0.8;
        
        // Loud, happy roar
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.35 + Math.random() * 0.25, startTime + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      }

      

      // CLAPPING - Happy applause throughout
      for (let i = 0; i < 250; i++) {
        const bufferSize = audioContext.sampleRate * 0.04;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let j = 0; j < bufferSize; j++) {
          data[j] = Math.random() * 2 - 1;
        }
        
        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const bandpass = audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1000 + Math.random() * 2000;
        
        const clapGain = audioContext.createGain();
        const startTime = audioContext.currentTime + 0.6 + (i * 0.02) + (Math.random() * 0.12);
        
        clapGain.gain.setValueAtTime(0, startTime);
        clapGain.gain.linearRampToValueAtTime(0.4 + Math.random() * 0.2, startTime + 0.003);
        clapGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.04);
        
        noise.connect(bandpass);
        bandpass.connect(clapGain);
        clapGain.connect(audioContext.destination);
        
        noise.start(startTime);
        noise.stop(startTime + 0.04);
      }

    } catch (error) {
      console.debug('Audio not available');
    }
  };

  const handleDraw = () => {
    if (eligiblePeople.length === 0) {
      alert('No eligible participants found!');
      return;
    }

    setIsDrawing(true);
    setWinner(null);

    // Play drum roll sound at start
    playDrumRoll();

    // Slot machine animation
    let count = 0;
    const maxIterations = 50;
    
    animationRef.current = setInterval(() => {
      const randomPerson = eligiblePeople[Math.floor(Math.random() * eligiblePeople.length)];
      setCurrentName(`${randomPerson.firstName} ${randomPerson.lastName}`);
      
      // Play tick sound every few iterations
      if (count % 3 === 0) {
        playTickSound();
      }
      
      count++;

      if (count >= maxIterations) {
        clearInterval(animationRef.current);
        
        setTimeout(() => {
          const finalWinner = eligiblePeople[Math.floor(Math.random() * eligiblePeople.length)];
          const winnerName = `${finalWinner.firstName} ${finalWinner.lastName}`;
          setWinner(winnerName);
          setCurrentName(winnerName);
          setIsDrawing(false);
          
          // Play winner celebration sound
          playWinnerSound();
          
          setPreviousWinners(prev => [{
            name: winnerName,
            age: finalWinner.age,
            location: finalWinner.location,
            time: new Date()
          }, ...prev].slice(0, 10));
        }, 500);
      }
    }, count < 30 ? 50 : count < 40 ? 100 : 150);
  };

  const handleReset = () => {
    setCurrentName('');
    setWinner(null);
  };

  const handleClearHistory = () => {
    setPreviousWinners([]);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error entering fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error exiting fullscreen:', err);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <Header showSearch={false} showBell={true} />
      
      <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4 md:mb-8">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
              <Trophy size={32} className="text-yellow-400 md:w-12 md:h-12" />
              <h1 className="text-3xl md:text-6xl font-bold text-white" style={{ fontFamily: 'Moderniz, sans-serif' }}>
                RAFFLE DRAW
              </h1>
              <Trophy size={32} className="text-yellow-400 md:w-12 md:h-12" />
            </div>
            <p className="text-sm md:text-xl text-blue-200">FFSC 20th Anniversary Celebration</p>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              <span className="text-sm">{isFullscreen ? 'Exit' : 'Enter'} Fullscreen</span>
            </button>
          </div>

          {/* Main Draw Area */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-8 mb-4 md:mb-6 border-2 md:border-4 border-yellow-400/30">
            {/* Age Filter Controls */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 mb-4 md:mb-8">
              <div className="flex items-center gap-2 md:gap-3 bg-white/20 rounded-xl px-4 md:px-6 py-2 md:py-3 w-full md:w-auto">
                <label className="text-white font-semibold text-sm md:text-lg">Min Age:</label>
                <input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  placeholder="Any"
                  className="w-20 md:w-24 px-2 md:px-4 py-1 md:py-2 rounded-lg text-center text-lg md:text-2xl font-bold bg-white/90 text-gray-900 border-2 border-blue-300 focus:outline-none focus:border-yellow-400"
                  disabled={isDrawing}
                />
              </div>

              <div className="text-white text-xl md:text-2xl font-bold hidden md:block">—</div>

              <div className="flex items-center gap-2 md:gap-3 bg-white/20 rounded-xl px-4 md:px-6 py-2 md:py-3 w-full md:w-auto">
                <label className="text-white font-semibold text-sm md:text-lg">Max Age:</label>
                <input
                  type="number"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  placeholder="Any"
                  className="w-20 md:w-24 px-2 md:px-4 py-1 md:py-2 rounded-lg text-center text-lg md:text-2xl font-bold bg-white/90 text-gray-900 border-2 border-blue-300 focus:outline-none focus:border-yellow-400"
                  disabled={isDrawing}
                />
              </div>

              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 md:px-6 py-2 md:py-3 w-full md:w-auto justify-center">
                <Users size={20} className="text-blue-200 md:w-6 md:h-6" />
                <span className="text-white font-bold text-xl md:text-2xl">{eligiblePeople.length}</span>
                <span className="text-blue-200 text-sm md:text-base">eligible</span>
              </div>
            </div>

            {/* Winner Display */}
            <div className="relative mb-4 md:mb-8">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-500/20 rounded-xl md:rounded-2xl blur-xl animate-pulse"></div>
              
              {/* Winner Card */}
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl md:rounded-2xl p-6 md:p-12 border-4 md:border-8 border-white/50 shadow-2xl min-h-[200px] md:min-h-[300px] flex items-center justify-center">
                {!currentName && !winner && (
                  <div className="text-center">
                    <Sparkles size={48} className="text-white/50 mx-auto mb-4 md:w-16 md:h-16" />
                    <p className="text-white text-xl md:text-4xl font-semibold">Press START to draw a winner!</p>
                  </div>
                )}

                {currentName && (
                  <div className="text-center w-full">
                    <h2 className={`text-4xl md:text-8xl font-black text-white drop-shadow-lg transition-all duration-200 break-words ${
                      isDrawing ? 'animate-bounce scale-110' : 'animate-winner-reveal'
                    }`} style={{ fontFamily: 'Moderniz, sans-serif', letterSpacing: '0.05em' }}>
                      {currentName}
                    </h2>
                    
                    {winner && (
                      <div className="mt-4 md:mt-6 animate-confetti">
                        <div className="flex items-center justify-center gap-2 md:gap-4 mb-2 md:mb-4">
                          <div className="h-1 w-16 md:w-32 bg-white/50 rounded"></div>
                          <Trophy size={32} className="text-white animate-bounce md:w-12 md:h-12" />
                          <div className="h-1 w-16 md:w-32 bg-white/50 rounded"></div>
                        </div>
                        <p className="text-white text-2xl md:text-4xl font-bold animate-pulse">🎉 CONGRATULATIONS! 🎉</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
              <button
                onClick={handleDraw}
                disabled={isDrawing || eligiblePeople.length === 0}
                className="flex items-center justify-center gap-2 md:gap-3 px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl md:rounded-2xl text-xl md:text-3xl font-bold shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 md:border-4 border-white/30"
              >
                <Play size={24} fill="white" className="md:w-9 md:h-9" />
                {isDrawing ? 'DRAWING...' : 'START DRAW'}
              </button>

              <button
                onClick={handleReset}
                disabled={isDrawing}
                className="flex items-center justify-center gap-2 md:gap-3 px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl md:rounded-2xl text-xl md:text-3xl font-bold shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 md:border-4 border-white/30"
              >
                <RotateCcw size={24} className="md:w-9 md:h-9" />
                RESET
              </button>
            </div>
          </div>

          {/* Previous Winners */}
          {previousWinners.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-400 md:w-6 md:h-6" />
                  Recent Winners
                </h3>
                <button
                  onClick={handleClearHistory}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs md:text-sm font-semibold transition"
                >
                  Clear History
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {previousWinners.map((w, idx) => (
                  <div key={idx} className="bg-white/20 rounded-lg p-3 md:p-4 border border-white/30">
                    <p className="text-white font-bold text-base md:text-xl">{idx + 1}. {w.name}</p>
                    <p className="text-blue-200 text-xs md:text-sm mt-1">
                      Age: {w.age} • {w.location} • {w.time.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes winner-reveal {
            0% {
              transform: scale(0.5) rotate(-10deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.2) rotate(5deg);
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }
          .animate-winner-reveal {
            animation: winner-reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          @keyframes confetti {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-confetti {
            animation: confetti 1s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>
  );
}