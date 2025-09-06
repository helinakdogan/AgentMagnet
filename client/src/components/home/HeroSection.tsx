import { useLanguage } from "@/contexts/LanguageContext";
import HighlightButton from "@/components/ui/highlight-button";
import BasicButton from "@/components/ui/basic-button";
import MagneticGame from "@/components/MagneticGame";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--dark-purple)] dark:text-white leading-tight">
              {t("home.hero.title")}
              <span className="gradient-text ml-3">{t("home.hero.subtitle")}</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-light leading-relaxed">
              {t("home.hero.description")}
            </p>
            
            {/* Slogan */}
            <p className="mt-4 text-lg text-gray-500 font-light italic">
              "{t("home.hero.slogan")}"
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* Highlight Button */}
              <HighlightButton href="/agents">
                {t("home.hero.cta")}
              </HighlightButton>

              {/* Basic Button */}
              <BasicButton href="/developer">
                {t("home.hero.learn")}
              </BasicButton>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 text-center lg:text-left">
              <div>
                <div className="text-3xl font-light text-[var(--dark-purple)] dark:text-white">{t("home.stats.agents.count")}</div>
                <div className="text-sm text-[var(--muted-foreground)] font-light">{t("home.stats.agents")}</div>
              </div>
              <div>
                <div className="text-3xl font-light text-[var(--dark-purple)] dark:text-white">{t("home.stats.users.count")}</div>
                <div className="text-sm text-[var(--muted-foreground)] font-light">{t("home.stats.users")}</div>
              </div>
              <div>
                <div className="text-3xl font-light text-[var(--dark-purple)] dark:text-white">{t("home.stats.support.count")}</div>
                <div className="text-sm text-[var(--muted-foreground)] font-light">{t("home.stats.support")}</div>
              </div>
            </div>
          </div>

          {/* Hero Game - 3D Transparent Magnet */}
          <MagneticGame />
        </div>
      </div>
    </section>
  );
} 