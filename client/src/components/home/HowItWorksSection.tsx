import { useLanguage } from "@/contexts/LanguageContext";
import HighlightButton from "@/components/ui/highlight-button";
import BasicButton from "@/components/ui/basic-button";
import { useState, useEffect } from "react";

export default function HowItWorksSection() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-progress through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
      setProgress(0);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Progress bar animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1; // 1% every 40ms = 4 seconds total
      });
    }, 40);

    return () => clearInterval(progressInterval);
  }, [activeStep]);

  const steps = [
    {
      number: 1,
      title: t("home.howItWorks.step1.title"),
      description: t("home.howItWorks.step1.description"),
      color: "purple"
    },
    {
      number: 2,
      title: t("home.howItWorks.step2.title"),
      description: t("home.howItWorks.step2.description"),
      color: "pink"
    },
    {
      number: 3,
      title: t("home.howItWorks.step3.title"),
      description: t("home.howItWorks.step3.description"),
      color: "emerald"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Hero-style Background with Pink Gradient */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(ellipse at center, transparent 15%, rgba(0, 0, 0, 0.7) 85%),
          radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.16) 0%, rgba(0, 0, 0, 0.18) 40%, transparent 70%),
          radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.12) 0%, rgba(0, 0, 0, 0.15) 35%, transparent 65%),
          radial-gradient(ellipse at 50% 20%, rgba(147, 51, 234, 0.12) 0%, rgba(0, 0, 0, 0.12) 45%, transparent 80%),
          radial-gradient(ellipse at 20% 80%, rgba(99, 102, 241, 0.1) 0%, rgba(0, 0, 0, 0.1) 50%, transparent 85%),
          radial-gradient(ellipse at 80% 30%, rgba(124, 58, 237, 0.1) 0%, rgba(0, 0, 0, 0.08) 45%, transparent 75%)
        `
      }}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[var(--dark-purple)] mb-4">
            {t("home.howItWorks.title")}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[var(--muted-foreground)] max-w-3xl sm:max-w-4xl mx-auto leading-relaxed">
            {t("home.howItWorks.subtitle")}
          </p>
        </div>

        {/* Interactive Steps Bar */}
        <div className="max-w-4xl mx-auto mb-16">
          {/* Step Numbers Bar */}
          <div className="flex bg-black/20 rounded-full p-1 sm:p-1 mb-4 backdrop-blur-sm border border-white/10">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex-1 cursor-pointer transition-all duration-500 ${
                  index === activeStep ? 'flex-[2]' : 'flex-1'
                }`}
                onClick={() => {setActiveStep(index); setProgress(0);}}
              >
                <div className={`py-2 px-2 sm:px-3 text-center transition-all duration-500 relative overflow-hidden ${
                  index === 0 ? 'rounded-l-full' : index === steps.length - 1 ? 'rounded-r-full' : ''
                } ${
                  index === activeStep 
                    ? step.color === 'purple' ? 'bg-gradient-to-r from-purple-500/80 to-indigo-500/80' 
                      : step.color === 'pink' ? 'bg-gradient-to-r from-pink-500/80 to-rose-500/80'
                      : 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80'
                    : 'bg-black/20 hover:bg-black/30'
                }`}>
                  {/* Shimmer Effect for Active */}
                  {index === activeStep && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-pulse"></div>
                  )}
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className={`text-lg font-normal transition-all duration-500 ${
                      index === activeStep ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.number}
                    </span>
                    <span className={`font-normal text-xs sm:text-sm transition-all duration-500 ${
                      index === activeStep ? 'text-white' : 'text-gray-300'
                    } hidden sm:block ${index === activeStep ? 'sm:block' : ''}`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Active Step Description */}
          <div className="text-center min-h-[40px] flex items-center justify-center">
            <div className="transition-all duration-500 ease-in-out">
              <p className="text-sm sm:text-base text-white font-light leading-relaxed max-w-2xl">
                {steps[activeStep].description}
              </p>
            </div>
          </div>
        </div>

        {/* Direct CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-3xl sm:text-4xl font-normal text-[var(--dark-purple)] mb-6">
            {t("home.howItWorks.cta.title")}
          </h3>
        
          
                      <div className="flex flex-row gap-4 justify-center">
              <div className="animate-pulse" style={{animationDuration: '5s', animationDelay: '0s'}}>
                <HighlightButton href="/agents" className="transition-all duration-[2000ms] hover:scale-110">
                  {t("home.howItWorks.cta.button")}
                </HighlightButton>
              </div>
              
              <div className="animate-pulse" style={{animationDuration: '5s', animationDelay: '2.5s'}}>
                <BasicButton href="/developer" className="transition-all duration-[2000ms] hover:scale-110">
                  {t("home.hero.learn")}
                </BasicButton>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
} 