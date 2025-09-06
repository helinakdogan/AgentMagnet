import { useLanguage } from "@/contexts/LanguageContext";
import { ErrorFallback } from "@/components/ui/error-boundary";
import HeroSection from "@/components/home/HeroSection";
import MagneticAgentsSection from "@/components/home/MagneticAgentsSection";
import FeaturedAgentsSection from "@/components/home/FeaturedAgentsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import { useEffect } from "react";

export default function Home() {
  const { t } = useLanguage();

  // Add home-page class to body when component mounts
  useEffect(() => {
    document.body.classList.add('home-page');
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  return (
    <>
      {/* Hero + Magnetic sections with shared dark gradient background (now global) */}
      <div className="n8n-depth-content relative z-10">
        <HeroSection />
        <MagneticAgentsSection />
      </div>

      <FeaturedAgentsSection />
      <HowItWorksSection />
    </>
  );
}
