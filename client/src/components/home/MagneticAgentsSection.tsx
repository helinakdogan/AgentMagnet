import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import MagneticAgentCard from "@/components/MagneticAgentCard";
import ChocolateGrid from "@/components/ChocolateGrid";

export default function MagneticAgentsSection() {
  const { t } = useLanguage();
  const [sliderPosition, setSliderPosition] = useState(0);

  // Slider navigation functions
  const handleSliderPrev = () => {
    setSliderPosition(prev => Math.max(prev - 1, 0));
  };

  const handleSliderNext = () => {
    setSliderPosition(prev => Math.min(prev + 1, 2)); // 3 agents total
  };

  // Auto-rotate slider
  useEffect(() => {
    const interval = setInterval(() => {
      setSliderPosition(prev => (prev + 1) % 3); // Loop back to 0 after 2
    }, 2500); // Change every 2.5 seconds (faster)

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 sm:py-12 lg:py-16 relative bg-transparent">
      {/* Magnetic Field Background */}
      <div className="absolute inset-0 magnetic-field-bg z-0">
        <div className="magnetic-dots"></div>
        <div className="magnetic-dots" style={{animationDelay: '-5s'}}></div>
        <div className="magnetic-dots" style={{animationDelay: '-10s'}}></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[var(--dark-purple)] dark:text-white mb-4 sm:mb-6">
            {t("home.magneticAgents.title")}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[var(--muted-foreground)] max-w-3xl sm:max-w-4xl mx-auto leading-relaxed">
            {t("home.magneticAgents.description")}
          </p>
        </div>

        {/* 3D Rotating Ring */}
        <div className="relative h-[280px] sm:h-[350px] lg:h-[420px] flex items-center justify-center overflow-visible z-50" style={{ position: 'relative', zIndex: 9999, perspective: '800px' }}>
          {/* 3D Ring Container */}
          <div className="relative w-full h-full max-w-6xl z-50" style={{ transformStyle: 'preserve-3d' }}>
            {/* Central White Sun Spotlight - Using 3D positioning */}
          <div 
              className="absolute inset-0 flex items-center justify-center magnetic-spotlight"
            style={{ 
                transform: 'translateZ(250px)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="relative">
                {/* Main White Sun Core */}
                <div className="w-4 h-4 rounded-full shadow-sm relative overflow-hidden">
                  {/* Natural Radial Gradient */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.015) 5%, rgba(255,255,255,0.01) 10%, rgba(255,255,255,0.005) 15%, rgba(255,255,255,0.001) 100%)'
                    }}
                  ></div>
                  

                </div>
                
                {/* Close Glow - Subtle */}
                <div className="absolute inset-0 w-4 h-4 bg-white rounded-full opacity-3 blur-sm"></div>
                
                {/* Medium Glow - Fading */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full opacity-2 blur-md"></div>
                
                {/* Large Glow - Very Subtle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full opacity-1 blur-lg"></div>
              </div>
            </div>

            <div 
              className="absolute inset-0 flex items-center justify-center z-50"
              style={{
                transformStyle: 'preserve-3d',
                animation: 'rotateRing 30s linear infinite'
              }}
            >

              {/* Gmail Agent - Front */}
              <div 
                className="absolute z-[52] magnetic-card-front"
                style={{
                  transform: 'rotateY(0deg) translateZ(300px)',
                  transformOrigin: 'center'
                }}
              >
                <MagneticAgentCard
                  colorScheme="blue"
                  title={t("home.magneticAgents.gmail.title")}
                  description={t("home.magneticAgents.gmail.description")}
                  icon={
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                  }
                  animationDelay="0s"
                />
                  </div>
                  
              {/* WhatsApp Agent - Right */}
              <div 
                className="absolute z-[47] magnetic-card-right"
                style={{
                  transform: 'rotateY(90deg) translateZ(300px)',
                  transformOrigin: 'center'
                }}
              >
                <MagneticAgentCard
                  colorScheme="green"
                  title={t("home.magneticAgents.whatsapp.title")}
                  description={t("home.magneticAgents.whatsapp.description")}
                  icon={
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                  }
                  animationDelay="1s"
                  metallicPattern={{
                    positions: ["25% 25%", "75% 75%", "45% 55%"],
                    sizes: "40px 40px, 60px 60px, 30px 30px"
                  }}
                />
                  </div>
                  
              {/* Instagram Agent - Back */}
              <div 
                className="absolute z-[46] magnetic-card-back"
                style={{
                  transform: 'rotateY(180deg) translateZ(300px)',
                  transformOrigin: 'center'
                }}
              >
                <MagneticAgentCard
                  colorScheme="pink"
                  title={t("home.magneticAgents.instagram.title")}
                  description={t("home.magneticAgents.instagram.description")}
                  icon={
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                  }
                  animationDelay="2s"
                  metallicPattern={{
                    positions: ["35% 35%", "65% 65%", "50% 20%"],
                    sizes: "55px 55px, 25px 25px, 35px 35px"
                  }}
                />
                      </div>

              {/* Try On Agent - Left */}
              <div 
                className="absolute z-[47] magnetic-card-left"
                style={{
                  transform: 'rotateY(270deg) translateZ(300px)',
                  transformOrigin: 'center'
                }}
              >
                <MagneticAgentCard
                  colorScheme="cyan"
                  title={t("home.magneticAgents.tryOn.title")}
                  description={t("home.magneticAgents.tryOn.description")}
                  icon={
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  animationDelay="3s"
                  metallicPattern={{
                    positions: ["30% 30%", "70% 70%", "50% 50%"],
                    sizes: "45px 45px, 35px 35px, 25px 25px"
                  }}
                />
              </div>

            </div>
          </div>
          </div>
        </div>

        {/* More to Come Section */}
        <div className="text-center mt-16">
          {/* Main Message */}
          <div className="mb-8 px-4 sm:px-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-[var(--dark-purple)] dark:text-white mb-4">
              {t("home.magneticAgents.futureTitle")}
            </h3>
            <p className="text-sm sm:text-base text-[var(--muted-foreground)] max-w-3xl mx-auto leading-relaxed mb-6">
              {t("home.magneticAgents.futureDescription")}
            </p>
            
            {/* Customer Vision Slogan */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-lg mb-8 max-w-4xl mx-auto">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-xs sm:text-sm font-medium text-white/90 italic text-center">
                {t("home.magneticAgents.customerVision")}
              </span>
            </div>
          </div>

          {/* Industry Chocolate Grid */}
          <div className="relative mb-12">
            <ChocolateGrid
              items={[
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  title: t("home.magneticAgents.industries.beauty.title"),
                  description: t("home.magneticAgents.industries.beauty.description")
                },
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ),
                  title: t("home.magneticAgents.industries.boutique.title"),
                  description: t("home.magneticAgents.industries.boutique.description")
                },
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  ),
                  title: t("home.magneticAgents.industries.it.title"),
                  description: t("home.magneticAgents.industries.it.description")
                },
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  ),
                  title: t("home.magneticAgents.industries.students.title"),
                  description: t("home.magneticAgents.industries.students.description")
                },
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                  title: t("home.magneticAgents.industries.aiEnthusiasts.title"),
                  description: t("home.magneticAgents.industries.aiEnthusiasts.description")
                },
                {
                  icon: (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: t("home.magneticAgents.industries.automation.title"),
                  description: t("home.magneticAgents.industries.automation.description")
                }
              ]}
            />
          </div>
        </div>
    
    </section>
  );
} 