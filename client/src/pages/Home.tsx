import { useState, useEffect } from "react";
import { Link } from "wouter";
import AgentCard from "@/components/AgentCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAgents } from "@/hooks/use-api";
import { Loading, LoadingCard } from "@/components/ui/loading";
import { ErrorFallback } from "@/components/ui/error-boundary";
import type { Agent } from "@/lib/api";
import Logo from "@/assets/agentmagnetlogolight.png"; 

export default function Home() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(t("category.all"));
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [collectedParticles, setCollectedParticles] = useState(0);
  const [totalParticles] = useState(10);

  // Magnetic game effect
  useEffect(() => {
    const gameArea = document.getElementById('magnetic-game-area');
    const magnetCenter = document.getElementById('magnet-center');
    const particles = document.querySelectorAll('.game-particle');

    if (!gameArea || !magnetCenter || gameState === 'won') return;

    let isDragging = false;
    let magnetX = 50; // Start at center (percentage)
    let magnetY = 50; // Start at center (percentage)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = gameArea.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Update magnet position if dragging
      if (isDragging) {
        const newX = (mouseX / rect.width) * 100;
        const newY = (mouseY / rect.height) * 100;
        
        // Keep magnet within bounds
        magnetX = Math.max(10, Math.min(90, newX));
        magnetY = Math.max(10, Math.min(90, newY));
        
        const magnetElement = magnetCenter as HTMLElement;
        magnetElement.style.left = `${magnetX}%`;
        magnetElement.style.top = `${magnetY}%`;
        magnetElement.style.transform = 'translate(-50%, -50%)';
      }

      // Get magnet center position
      const magnetRect = magnetCenter.getBoundingClientRect();
      const gameAreaRect = gameArea.getBoundingClientRect();
      const magnetCenterX = magnetRect.left - gameAreaRect.left + magnetRect.width / 2;
      const magnetCenterY = magnetRect.top - gameAreaRect.top + magnetRect.height / 2;

      // Calculate distance from mouse to magnet
      const distanceToMagnet = Math.sqrt(
        Math.pow(mouseX - magnetCenterX, 2) + Math.pow(mouseY - magnetCenterY, 2)
      );

      // Enhanced magnetic effect radius and strength
      const magnetRadius = 150;
      const attractionStrength = Math.max(0, (magnetRadius - distanceToMagnet) / magnetRadius);

      // Apply enhanced magnetic effect to particles and check collection
      let newCollectedCount = 0;
      particles.forEach((particle, index) => {
        const particleRect = particle.getBoundingClientRect();
        const particleX = particleRect.left - gameAreaRect.left + particleRect.width / 2;
        const particleY = particleRect.top - gameAreaRect.top + particleRect.height / 2;

        // Calculate distance from magnet to particle
        const distanceToParticle = Math.sqrt(
          Math.pow(magnetCenterX - particleX, 2) + Math.pow(magnetCenterY - particleY, 2)
        );

        // Check if particle is collected (magnet touches particle)
        if (distanceToParticle < 30 && !particle.classList.contains('collected')) {
          particle.classList.add('collected');
          const particleElement = particle as HTMLElement;
          particleElement.style.transform = 'scale(0)';
          particleElement.style.opacity = '0';
          particleElement.style.transition = 'all 0.3s ease-out';
          newCollectedCount++;
        }

        if (attractionStrength > 0 && !particle.classList.contains('collected')) {
          // Calculate attraction towards magnet with enhanced physics
          const attractionX = (magnetCenterX - particleX) * attractionStrength * 0.4;
          const attractionY = (magnetCenterY - particleY) * attractionStrength * 0.4;

          // Add more natural movement with enhanced randomness
          const randomX = (Math.random() - 0.5) * 30 * attractionStrength;
          const randomY = (Math.random() - 0.5) * 30 * attractionStrength;

          // Enhanced scaling and opacity effects
          const scale = 1 + attractionStrength * 0.8;
          const opacity = 0.4 + attractionStrength * 0.6;

          (particle as HTMLElement).style.transform = `translate(${attractionX + randomX}px, ${attractionY + randomY}px) scale(${scale})`;
          (particle as HTMLElement).style.opacity = String(opacity);
          
          // Add glow effect to particles when attracted
          if (attractionStrength > 0.5) {
            (particle as HTMLElement).style.filter = `drop-shadow(0 0 15px rgba(147, 51, 234, ${attractionStrength * 0.6}))`;
          } else {
            (particle as HTMLElement).style.filter = '';
          }
        } else if (!particle.classList.contains('collected')) {
          // Reset to original position with smooth transition
          (particle as HTMLElement).style.transform = 'translate(0, 0) scale(1)';
          (particle as HTMLElement).style.opacity = '';
          (particle as HTMLElement).style.filter = '';
        }
      });

      // Update collected count
      if (newCollectedCount > 0) {
        setCollectedParticles(prev => {
          const newCount = prev + newCollectedCount;
          if (newCount >= totalParticles) {
            setGameState('won');
          }
          return newCount;
        });
      }

      // Enhanced magnet scaling and glow effects
      if (attractionStrength > 0.2) {
        const scale = 1 + attractionStrength * 0.4;
        const magnetElement = magnetCenter as HTMLElement;
        magnetElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        // Add glow effect to magnet
        const glowIntensity = attractionStrength * 0.8;
        magnetElement.style.filter = `drop-shadow(0 0 30px rgba(147, 51, 234, ${glowIntensity}))`;
      } else {
        const magnetElement = magnetCenter as HTMLElement;
        magnetElement.style.transform = 'translate(-50%, -50%) scale(1)';
        magnetElement.style.filter = '';
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = gameArea.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Check if click is on magnet
      const magnetRect = magnetCenter.getBoundingClientRect();
      const gameAreaRect = gameArea.getBoundingClientRect();
      const magnetCenterX = magnetRect.left - gameAreaRect.left + magnetRect.width / 2;
      const magnetCenterY = magnetRect.top - gameAreaRect.top + magnetRect.height / 2;

      const distanceToMagnet = Math.sqrt(
        Math.pow(mouseX - magnetCenterX, 2) + Math.pow(mouseY - magnetCenterY, 2)
      );

      if (distanceToMagnet < 40) { // Click within magnet area
        isDragging = true;
        const gameAreaElement = gameArea as HTMLElement;
        const magnetElement = magnetCenter as HTMLElement;
        gameAreaElement.style.cursor = 'grabbing';
        magnetElement.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      const gameAreaElement = gameArea as HTMLElement;
      const magnetElement = magnetCenter as HTMLElement;
      gameAreaElement.style.cursor = 'none';
      magnetElement.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
      // Stop dragging
      isDragging = false;
      const gameAreaElement = gameArea as HTMLElement;
      const magnetElement = magnetCenter as HTMLElement;
      gameAreaElement.style.cursor = 'none';
      magnetElement.style.cursor = 'grab';

      // Reset all particles with smooth transition (only non-collected ones)
      particles.forEach((particle) => {
        if (!particle.classList.contains('collected')) {
          (particle as HTMLElement).style.transform = 'translate(0, 0) scale(1)';
          (particle as HTMLElement).style.opacity = '';
          (particle as HTMLElement).style.filter = '';
        }
      });

      // Reset magnet
      magnetElement.style.transform = 'translate(-50%, -50%) scale(1)';
      magnetElement.style.filter = '';
    };

    const handleMouseEnter = () => {
      // Add subtle hover effect to game area
      const gameAreaElement = gameArea as HTMLElement;
      gameAreaElement.style.transform = 'scale(1.01)';
    };

    // Set initial magnet position
    const magnetElement = magnetCenter as HTMLElement;
    magnetElement.style.left = '50%';
    magnetElement.style.top = '50%';
    magnetElement.style.transform = 'translate(-50%, -50%)';
    magnetElement.style.cursor = 'grab';

    gameArea.addEventListener('mousemove', handleMouseMove);
    gameArea.addEventListener('mousedown', handleMouseDown);
    gameArea.addEventListener('mouseup', handleMouseUp);
    gameArea.addEventListener('mouseleave', handleMouseLeave);
    gameArea.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      gameArea.removeEventListener('mousemove', handleMouseMove);
      gameArea.removeEventListener('mousedown', handleMouseDown);
      gameArea.removeEventListener('mouseup', handleMouseUp);
      gameArea.removeEventListener('mouseleave', handleMouseLeave);
      gameArea.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [gameState, totalParticles]);

  // Reset game function
  const resetGame = () => {
    setGameState('playing');
    setCollectedParticles(0);
    
    // Reset all particles
    const particles = document.querySelectorAll('.game-particle');
    particles.forEach((particle) => {
      particle.classList.remove('collected');
      const particleElement = particle as HTMLElement;
      particleElement.style.transform = '';
      particleElement.style.opacity = '';
      particleElement.style.filter = '';
      particleElement.style.transition = '';
    });

    // Reset magnet position to center
    const magnetCenter = document.getElementById('magnet-center');
    if (magnetCenter) {
      const magnetElement = magnetCenter as HTMLElement;
      magnetElement.style.left = '50%';
      magnetElement.style.top = '50%';
      magnetElement.style.transform = 'translate(-50%, -50%)';
      magnetElement.style.filter = '';
    }
  };

  const categoryParam = selectedCategory === t("category.all") ? undefined : selectedCategory;
  const { data: agents = [], isLoading, error } = useAgents(categoryParam);

  const categories = [
    t("category.all"), 
    t("category.writing"), 
    t("category.visual"), 
    t("category.audio"), 
    t("category.analysis"), 
    t("category.chat"), 
    t("category.code"), 
    t("category.language"), 
    t("category.marketing")
  ];

  if (error) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorFallback 
            error={error as Error} 
            resetError={() => window.location.reload()} 
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--dark-purple)] dark:text-white leading-tight">
                {t("home.hero.title")}
                <span className="gradient-text ml-3">{t("home.hero.subtitle")}</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                {t("home.hero.description")}
              </p>
              
              {/* Slogan */}
              <p className="mt-4 text-lg text-gray-500 italic">
                "Herkesin akıllı bir asistana ihtiyacı vardır."
              </p>

              {/* CTA Buttons */}
         <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
  {/* Gradient Border Button */}
<Link href="/agents">
  <div className="relative inline-flex items-center justify-center px-1 py-1 rounded-xl group">
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
    <div className="relative rounded-xl bg-muted dark:bg-muted px-4 py-1">
      <span className="text-black dark:text-white font-medium">
        {t("home.hero.cta")}
      </span>
    </div>
  </div>
</Link>




  {/* Solid Black Button */}
  <Link href="/developer">
    <button className="btn-black px-6 py-3 text-base rounded-lg font-medium">
      {t("home.hero.learn")}
    </button>
  </Link>
</div>


              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-semibold text-[var(--dark-purple)] dark:text-white">{t("home.stats.agents.count")}</div>
                  <div className="text-sm text-[var(--muted-foreground)] font-normal">{t("home.stats.agents")}</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--dark-purple)] dark:text-white">{t("home.stats.users.count")}</div>
                  <div className="text-sm text-[var(--muted-foreground)] font-normal">{t("home.stats.users")}</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--dark-purple)] dark:text-white">{t("home.stats.support.count")}</div>
                  <div className="text-sm text-[var(--muted-foreground)] font-normal">{t("home.stats.support")}</div>
                </div>
              </div>
            </div>

            {/* Hero Game */}
            <div className="relative">
              <div className="relative glassmorphic rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/2 left-1/4 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>

                <div className="relative z-10">
                  <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 glassmorphic rounded-full mb-3 sm:mb-4">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)]">Interactive Experience</span>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[var(--dark-purple)] dark:text-white mb-2 sm:mb-3">{t("home.game.title")}</h3>
                    <p className="text-sm sm:text-base text-[var(--muted-foreground)] font-normal">{t("home.game.description")}</p>
                    
                    {/* Game Progress */}
                    {gameState === 'playing' && (
                      <div className="mt-3 sm:mt-4">
                        <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                          <span className="text-[var(--muted-foreground)]">Collected:</span>
                          <span className="font-semibold text-[var(--dark-purple)] dark:text-white">{collectedParticles}/{totalParticles}</span>
                        </div>
                        <div className="w-32 sm:w-40 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                            style={{ width: `${(collectedParticles / totalParticles) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Game Area */}
                  <div 
                    className="relative w-full h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-pink-50/50 dark:from-purple-950/30 dark:via-blue-950/20 dark:to-pink-950/30 rounded-xl sm:rounded-2xl overflow-hidden cursor-none border border-white/20 dark:border-white/10 backdrop-blur-sm"
                    id="magnetic-game-area"
                  >
                    {/* Floating Orbs Background */}
                    <div className="absolute inset-0">
                      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-sm animate-float"></div>
                      <div className="absolute top-8 sm:top-16 right-6 sm:right-12 w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-sm animate-float" style={{animationDelay: '1s'}}></div>
                      <div className="absolute bottom-6 sm:bottom-12 left-8 sm:left-16 w-3 sm:w-5 h-3 sm:h-5 bg-gradient-to-r from-green-400/30 to-teal-400/30 rounded-full blur-sm animate-float" style={{animationDelay: '2s'}}></div>
                      <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-sm animate-float" style={{animationDelay: '3s'}}></div>
                    </div>

                    {/* Central Magnet with Enhanced Effects */}
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 sm:w-20 h-16 sm:h-20 gradient-main rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center floating-animation group cursor-grab active:cursor-grabbing select-none"
                      id="magnet-center"
                    >
                      {/* Magnet Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      
                      {/* Logo Container */}
                      <div className="relative w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg  dark:bg-black/20 backdrop-blur-sm border border-white/50 dark:border-white/20 pointer-events-none">
                        <img
                          src={Logo}
                          alt="Agent Magnet Logo"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>

                      {/* Magnetic Field Indicator */}
                      <div className="absolute inset-0 border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl scale-150 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none"></div>
                    </div>
                    
                    {/* Enhanced Game Particles */}
                    <div className="game-particles">
                      <div className="game-particle absolute top-1/3 left-1/3 w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-80 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                      <div className="game-particle absolute top-1/3 right-1/3 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-90 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                      <div className="game-particle absolute bottom-1/3 left-1/3 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-70 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                      <div className="game-particle absolute bottom-1/3 right-1/3 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-full opacity-95 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                      <div className="game-particle absolute top-1/2 left-1/4 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-85 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                      <div className="game-particle absolute top-1/2 right-1/4 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-75 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                      <div className="game-particle absolute top-2/3 left-1/2 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-90 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                      <div className="game-particle absolute bottom-1/2 left-1/4 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-80 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                      <div className="game-particle absolute bottom-1/2 right-1/4 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-70 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                      <div className="game-particle absolute bottom-2/3 right-1/2 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-85 transition-all duration-500 ease-out shadow-lg backdrop-blur-sm"></div>
                    </div>
                    
                    {/* Magnetic Field Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="w-full h-full opacity-20">
                        <defs>
                          <radialGradient id="magneticField" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(147, 51, 234, 0.3)" />
                            <stop offset="70%" stopColor="rgba(147, 51, 234, 0.1)" />
                            <stop offset="100%" stopColor="rgba(147, 51, 234, 0)" />
                          </radialGradient>
                        </defs>
                        <circle cx="50%" cy="50%" r="120" fill="url(#magneticField)" className="animate-pulse" />
                      </svg>
                    </div>
                    
                    {/* Win Screen */}
                    {gameState === 'won' && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="glassmorphic rounded-2xl p-6 sm:p-8 text-center max-w-sm mx-4">
                          <div className="w-16 h-16 mx-auto mb-4 gradient-main rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-[var(--dark-purple)] dark:text-white mb-2">Congratulations!</h3>
                          <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-4">You collected all the particles!</p>
                          <button 
                            onClick={resetGame}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:scale-105 transition-all duration-300"
                          >
                            Play Again
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Instructions */}
                    {gameState === 'playing' && (
                      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                        <div className="glassmorphic rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center">
                          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                            <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-[var(--muted-foreground)]">Drag the magnet to collect particles</span>
                            <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)] opacity-70">
                            Click and drag the magnet to move it around
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Grid Section */}
      <section className="py-20 bg-white dark:bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--dark-purple)] dark:text-white mb-4">
              {t("home.featured.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] font-normal max-w-2xl mx-auto">
              En çok tercih edilen yapay zeka ajanlarını keşfedin ve iş akışlarınızı optimize edin.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 text-sm font-medium rounded-xl transition-colors ${
                  selectedCategory === category
                    ? "bg-[var(--dark-purple)] text-white dark:bg-white dark:text-[var(--border)]"
                    : "text-[var(--muted-foreground)] glassmorphic hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Agent Cards Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 gradient-main rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] dark:text-white mb-2">
                Bu kategoride ajan bulunamadı
              </h3>
              <p className="text-[var(--muted-foreground)]">
                Lütfen farklı bir kategori seçin veya daha sonra tekrar deneyin.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map((agent: Agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}

          {/* View More Button */}
          {!isLoading && agents.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/agents">
                <button className="px-8 py-4 text-lg font-semibold text-[var(--dark-purple)] dark:text-white glassmorphic rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-md">
                  {t("home.view.all")}
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[var(--light-gray)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 glassmorphic rounded-full mb-6">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[var(--muted-foreground)]">AI Platform</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--dark-purple)] mb-4">
              {t("home.howItWorks.title")}
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] font-normal max-w-2xl mx-auto">
              {t("home.howItWorks.subtitle")}
            </p>
          </div>

          {/* Modern Steps Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="group relative">
              <div className="glassmorphic rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl relative overflow-hidden">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl shadow-xl flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    1
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                  {t("home.howItWorks.step1.title")}
                </h3>
                <p className="text-[var(--muted-foreground)] font-normal leading-relaxed">
                  {t("home.howItWorks.step1.description")}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="glassmorphic rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl relative overflow-hidden">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-red-600 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    2
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-red-600 group-hover:bg-clip-text transition-all duration-300">
                  {t("home.howItWorks.step2.title")}
                </h3>
                <p className="text-[var(--muted-foreground)] font-normal leading-relaxed">
                  {t("home.howItWorks.step2.description")}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="glassmorphic rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl relative overflow-hidden">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-teal-600 to-emerald-700 rounded-2xl shadow-xl flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-teal-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    3
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-teal-600 group-hover:bg-clip-text transition-all duration-300">
                  {t("home.howItWorks.step3.title")}
                </h3>
                <p className="text-[var(--muted-foreground)] font-normal leading-relaxed">
                  {t("home.howItWorks.step3.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="text-center">
            <div className="glassmorphic rounded-3xl shadow-2xl p-8 max-w-3xl mx-auto relative overflow-hidden">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 glassmorphic rounded-full mb-6">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">Ready to Start?</span>
                </div>
                
                <h3 className="text-2xl font-semibold text-[var(--dark-purple)] mb-4">
                  {t("home.howItWorks.cta.title")}
                </h3>
                <p className="text-[var(--muted-foreground)] font-normal mb-8 max-w-2xl mx-auto">
                  {t("home.howItWorks.cta.description")}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/agents">
                    <button className="relative inline-flex items-center justify-center px-1 py-1 rounded-lg group transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
                      <div className="relative rounded-lg bg-white dark:bg-[var(--light-gray)] px-6 py-1">
                        <span className="text-black dark:text-white text-base font-medium leading-none">
                          {t("home.howItWorks.cta.button")}
                        </span>
                      </div>
                    </button>
                  </Link>
                  
                  <Link href="/developer">
                    <button className="btn-black px-6 py-3 text-base rounded-lg font-medium hover:scale-105 transition-all duration-300">
                      {t("home.hero.learn")}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
