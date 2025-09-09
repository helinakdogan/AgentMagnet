import { useState, useEffect } from "react";
import Logo from "../../public/images/agentmagnetlogolight.png";

export default function MagneticGame() {
  const [areParticlesCollected, setAreParticlesCollected] = useState(false);
  const [isAttracting, setIsAttracting] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Window dimensions effect
  useEffect(() => {
    const updateDimensions = () => {
      const gameArea = document.getElementById('magnetic-game-area');
      if (gameArea) {
        const rect = gameArea.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Magnetic game effect - Click to attract/release
  useEffect(() => {
    const gameArea = document.getElementById('magnetic-game-area');
    const magnetCenter = document.getElementById('magnet-center');
    const particles = document.querySelectorAll('.game-particle');

    if (!gameArea || !magnetCenter) return;

    const handleMagnetClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isAttracting || areParticlesCollected) return; // Prevent clicks during any animation
      
      setIsAttracting(true);
      const magnetElement = magnetCenter as HTMLElement;
      
      // ATTRACT MODE - Pull particles to magnet
      console.log('Attracting particles');
      magnetElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
      magnetElement.style.filter = 'drop-shadow(0 0 40px rgba(147, 51, 234, 0.8))';
      
      // Get magnet center position
      const magnetRect = magnetCenter.getBoundingClientRect();
      const gameAreaRect = gameArea.getBoundingClientRect();
      const magnetCenterX = magnetRect.left - gameAreaRect.left + magnetRect.width / 2;
      const magnetCenterY = magnetRect.top - gameAreaRect.top + magnetRect.height / 2;

      // Animate all particles towards magnet
      particles.forEach((particle, index) => {
        const particleElement = particle as HTMLElement;
        const particleRect = particle.getBoundingClientRect();
        const particleX = particleRect.left - gameAreaRect.left + particleRect.width / 2;
        const particleY = particleRect.top - gameAreaRect.top + particleRect.height / 2;

        // Calculate attraction vector
        const deltaX = magnetCenterX - particleX;
        const deltaY = magnetCenterY - particleY;
        
        // Animate particle movement towards magnet
        particleElement.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        particleElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.4)`;
        particleElement.style.opacity = '0.6';
        particleElement.style.filter = 'drop-shadow(0 0 15px rgba(147, 51, 234, 0.6))';
      });
      
      // After attraction completes, hold for 0.8 seconds, then auto-release
      setTimeout(() => {
        setAreParticlesCollected(true);
        setIsAttracting(false);
        magnetElement.style.transform = 'translate(-50%, -50%) scale(1)';
        magnetElement.style.filter = 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.4))';
        
        // Auto-release after 0.8 seconds of holding
        setTimeout(() => {
          console.log('Auto-releasing particles');
          magnetElement.style.transform = 'translate(-50%, -50%) scale(0.9)';
          magnetElement.style.filter = 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.3))';
          
          // Release particles back to original positions
          particles.forEach((particle, index) => {
            const particleElement = particle as HTMLElement;
            
            // Slow release animation
            particleElement.style.transition = 'all 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
            
            setTimeout(() => {
              particleElement.style.transform = 'translate(0px, 0px) scale(1)';
              particleElement.style.opacity = '1';
              particleElement.style.filter = '';
            }, index * 150); // Stagger the release
          });
          
          setTimeout(() => {
            setAreParticlesCollected(false);
            magnetElement.style.transform = 'translate(-50%, -50%) scale(1)';
            magnetElement.style.filter = '';
          }, 1500);
          
        }, 800); // Wait 0.8 seconds before auto-release
      }, 1000); // Wait for attraction to complete
    };

    const handleMouseEnter = () => {
      if (!isAttracting) {
        const magnetElement = magnetCenter as HTMLElement;
        if (areParticlesCollected) {
          magnetElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
          magnetElement.style.filter = 'drop-shadow(0 0 15px rgba(147, 51, 234, 0.3))';
        } else {
          magnetElement.style.transform = 'translate(-50%, -50%) scale(1.05)';
          magnetElement.style.filter = 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.4))';
        }
      }
    };

    const handleMouseLeave = () => {
      if (!isAttracting) {
        const magnetElement = magnetCenter as HTMLElement;
        if (areParticlesCollected) {
          magnetElement.style.transform = 'translate(-50%, -50%) scale(1)';
          magnetElement.style.filter = 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.4))';
        } else {
          magnetElement.style.transform = 'translate(-50%, -50%) scale(1)';
          magnetElement.style.filter = '';
        }
      }
    };

    // Set initial magnet state
    const magnetElement = magnetCenter as HTMLElement;
    magnetElement.style.cursor = 'pointer';
    magnetElement.style.transition = 'all 0.3s ease';

    magnetCenter.addEventListener('click', handleMagnetClick);
    magnetCenter.addEventListener('mouseenter', handleMouseEnter);
    magnetCenter.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      magnetCenter.removeEventListener('click', handleMagnetClick);
      magnetCenter.removeEventListener('mouseenter', handleMouseEnter);
      magnetCenter.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [areParticlesCollected, isAttracting]);

  return (
    <div className="relative flex items-center justify-center lg:justify-start">
      {/* Glassmorphic Game Card */}
      <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl">
        <div className="relative w-full flex flex-col items-center justify-center">
          {/* Game Area - Full transparent space */}
          <div 
            className="relative w-full h-96 lg:h-[28rem] cursor-none"
            id="magnetic-game-area"
          >
        {/* Ambient Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-16 left-16 w-2 h-2 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-full blur-sm animate-float"></div>
          <div className="absolute top-32 right-20 w-1.5 h-1.5 bg-gradient-to-r from-blue-400/40 to-cyan-400/40 rounded-full blur-sm animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-20 w-3 h-3 bg-gradient-to-r from-green-400/40 to-teal-400/40 rounded-full blur-sm animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-16 right-16 w-1 h-1 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 rounded-full blur-sm animate-float" style={{animationDelay: '3s'}}></div>
        </div>

        {/* Central 3D Transparent Magnet */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 h-24 sm:h-32 cursor-grab active:cursor-grabbing select-none group"
          id="magnet-center"
        >
          {/* 3D Magnet Body */}
          <div className="relative w-full h-full">
            {/* Main magnet shape with glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-white/15 dark:via-white/8 dark:to-white/3 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl">
              {/* 3D effect layers */}
              <div className="absolute inset-1 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-3xl"></div>
              
              {/* Center logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white/20 dark:bg-black/30 rounded-2xl backdrop-blur-sm border border-white/40 dark:border-white/20 flex items-center justify-center shadow-lg">
                  <img
                    src={Logo}
                    alt="Agent Magnet Logo"
                    className="w-8 sm:w-10 h-8 sm:h-10 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Magnetic field rings */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="absolute w-full h-full border border-purple-400/30 rounded-full scale-150 opacity-0 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>
              <div className="absolute w-full h-full border border-pink-400/30 rounded-full scale-200 opacity-0 group-hover:opacity-40 transition-all duration-700 animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="absolute w-full h-full border border-purple-300/20 rounded-full scale-250 opacity-0 group-hover:opacity-20 transition-all duration-900 animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60"></div>
          </div>
        </div>
        
        {/* Game Particles Around Magnet */}
        <div className="game-particles">
          {/* Mid left - 7/24 Destek - Merkeze göre %60 aşağıda */}
          <div className="game-particle absolute top-[60%] left-4 sm:left-8 lg:left-12 min-w-20 sm:min-w-20 lg:min-w-20 h-10 sm:h-10 lg:h-12 bg-pink-500/20 dark:bg-pink-400/30 backdrop-blur-xl rounded-lg border border-pink-300/30 dark:border-pink-200/20 shadow-2xl transition-all duration-500 ease-out flex items-center justify-center px-4 sm:px-4 overflow-hidden">
            {/* Pink Spotlight */}
            <div className="absolute top-0 left-0 w-8 sm:w-8 lg:w-10 h-8 sm:h-8 lg:h-10 bg-gradient-to-br from-pink-400/50 to-red-400/50 rounded-full blur-lg sm:blur-xl"></div>
            <span className="text-sm sm:text-sm lg:text-base font-medium text-white whitespace-nowrap relative z-10">7/24 Destek</span>
          </div>
          
          {/* Mid right - MCP Altyapı - Merkeze göre %60 aşağıda */}
          <div className="game-particle absolute top-[60%] right-4 sm:right-8 lg:right-12 min-w-20 sm:min-w-20 lg:min-w-20 h-10 sm:h-10 lg:h-12 bg-purple-500/20 dark:bg-purple-400/30 backdrop-blur-xl rounded-lg border border-purple-300/30 dark:border-purple-200/20 shadow-2xl transition-all duration-500 ease-out flex items-center justify-center px-4 sm:px-4 overflow-hidden">
            {/* Purple Spotlight */}
            <div className="absolute top-0 right-0 w-8 sm:w-8 lg:w-10 h-8 sm:h-8 lg:h-10 bg-gradient-to-br from-purple-400/50 to-indigo-400/50 rounded-full blur-lg sm:blur-xl"></div>
            <span className="text-sm sm:text-sm lg:text-base font-medium text-white whitespace-nowrap relative z-10">MCP Altyapı</span>
          </div>

          {/* Top far left - AI Entegrasyon */}
          <div className="game-particle absolute top-14 sm:top-16 lg:top-18 left-0 sm:left-2 lg:left-4 min-w-20 sm:min-w-20 lg:min-w-20 h-10 sm:h-10 lg:h-12 bg-blue-500/20 dark:bg-blue-400/30 backdrop-blur-xl rounded-lg border border-blue-300/30 dark:border-blue-200/20 shadow-2xl transition-all duration-500 ease-out flex items-center justify-center px-4 sm:px-4 overflow-hidden">
            {/* Blue Spotlight */}
            <div className="absolute bottom-0 left-0 w-8 sm:w-8 lg:w-10 h-8 sm:h-8 lg:h-10 bg-gradient-to-br from-blue-400/50 to-cyan-400/50 rounded-full blur-lg sm:blur-xl"></div>
            <span className="text-sm sm:text-sm lg:text-base font-medium text-white whitespace-nowrap relative z-10">AI Entegrasyon</span>
          </div>
          
          {/* Top far right - Otomasyon */}
          <div className="game-particle absolute top-14 sm:top-16 lg:top-18 right-0 sm:right-2 lg:right-4 min-w-20 sm:min-w-20 lg:min-w-20 h-10 sm:h-10 lg:h-12 bg-green-500/20 dark:bg-green-400/30 backdrop-blur-xl rounded-lg border border-green-300/30 dark:border-green-200/20 shadow-2xl transition-all duration-500 ease-out flex items-center justify-center px-4 sm:px-4 overflow-hidden">
            {/* Green Spotlight */}
            <div className="absolute top-0 right-0 w-8 sm:w-8 lg:w-10 h-8 sm:h-8 lg:h-10 bg-gradient-to-br from-green-400/50 to-emerald-400/50 rounded-full blur-lg sm:blur-xl"></div>
            <span className="text-sm sm:text-sm lg:text-base font-medium text-white whitespace-nowrap relative z-10">Otomasyon</span>
          </div>

          {/* Top center - Güvenlik */}
          <div className="game-particle absolute top-8 sm:top-10 lg:top-12 left-1/2 transform -translate-x-1/2 min-w-20 sm:min-w-20 lg:min-w-20 h-10 sm:h-10 lg:h-12 bg-orange-500/20 dark:bg-orange-400/30 backdrop-blur-xl rounded-lg border border-orange-300/30 dark:border-orange-200/20 shadow-2xl transition-all duration-500 ease-out flex items-center justify-center px-4 sm:px-4 overflow-hidden">
            {/* Orange Spotlight */}
            <div className="absolute bottom-0 right-0 w-8 sm:w-8 lg:w-10 h-8 sm:h-8 lg:h-10 bg-gradient-to-br from-orange-400/50 to-yellow-400/50 rounded-full blur-lg sm:blur-xl"></div>
            <span className="text-sm sm:text-sm lg:text-base font-medium text-white whitespace-nowrap relative z-10">Güvenlik</span>
          </div>
        </div>
        
        {/* Background magnetic field visualization */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg className="w-full h-full">
            <defs>
              <radialGradient id="magneticField3D" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(147, 51, 234, 0.4)" />
                <stop offset="30%" stopColor="rgba(147, 51, 234, 0.2)" />
                <stop offset="60%" stopColor="rgba(147, 51, 234, 0.1)" />
                <stop offset="100%" stopColor="rgba(147, 51, 234, 0)" />
              </radialGradient>
            </defs>
            <circle cx="50%" cy="50%" r="200" fill="url(#magneticField3D)" className="animate-pulse" />
            <circle cx="50%" cy="50%" r="150" fill="none" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="1" className="animate-pulse" style={{animationDelay: '0.5s'}} />
            <circle cx="50%" cy="50%" r="100" fill="none" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="1" className="animate-pulse" style={{animationDelay: '1s'}} />
          </svg>
        </div>
      </div>
      
      {/* Game Instructions - Below the game */}
      <div className="-mt-8">
        <div className="bg-black/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/90 font-medium">Click magnet to attract bubbles</span>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
} 