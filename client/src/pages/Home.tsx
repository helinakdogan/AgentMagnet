import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AgentCard from "@/components/AgentCard";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Agent } from "@shared/schema";
import Logo from "@/assets/agentmagnetlogolight.png"; 

export default function Home() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(t("category.all"));

  // Magnetic game effect
  useEffect(() => {
    const gameArea = document.getElementById('magnetic-game-area');
    const magnetCenter = document.getElementById('magnet-center');
    const mouseCursor = document.getElementById('mouse-cursor');
    const particles = document.querySelectorAll('.game-particle');

    if (!gameArea || !magnetCenter || !mouseCursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = gameArea.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Show custom cursor
      mouseCursor.style.opacity = '1';
      mouseCursor.style.left = `${mouseX}px`;
      mouseCursor.style.top = `${mouseY}px`;

      // Get magnet center position
      const magnetRect = magnetCenter.getBoundingClientRect();
      const gameAreaRect = gameArea.getBoundingClientRect();
      const magnetCenterX = magnetRect.left - gameAreaRect.left + magnetRect.width / 2;
      const magnetCenterY = magnetRect.top - gameAreaRect.top + magnetRect.height / 2;

      // Calculate distance from mouse to magnet
      const distanceToMagnet = Math.sqrt(
        Math.pow(mouseX - magnetCenterX, 2) + Math.pow(mouseY - magnetCenterY, 2)
      );

      // Magnetic effect radius
      const magnetRadius = 120;
      const attractionStrength = Math.max(0, (magnetRadius - distanceToMagnet) / magnetRadius);

      // Apply magnetic effect to particles
      particles.forEach((particle, index) => {
        const particleRect = particle.getBoundingClientRect();
        const particleX = particleRect.left - gameAreaRect.left + particleRect.width / 2;
        const particleY = particleRect.top - gameAreaRect.top + particleRect.height / 2;

        if (attractionStrength > 0) {
          // Calculate attraction towards magnet
          const attractionX = (magnetCenterX - particleX) * attractionStrength * 0.3;
          const attractionY = (magnetCenterY - particleY) * attractionStrength * 0.3;

          // Add some randomness for more natural movement
          const randomX = (Math.random() - 0.5) * 20 * attractionStrength;
          const randomY = (Math.random() - 0.5) * 20 * attractionStrength;

          (particle as HTMLElement).style.transform = `translate(${attractionX + randomX}px, ${attractionY + randomY}px) scale(${1 + attractionStrength * 0.5})`;
          (particle as HTMLElement).style.opacity = String(0.4 + attractionStrength * 0.6);
        } else {
          // Reset to original position
          (particle as HTMLElement).style.transform = 'translate(0, 0) scale(1)';
          (particle as HTMLElement).style.opacity = '';
        }
      });

      // Scale magnet based on attraction
      if (attractionStrength > 0.2) {
        magnetCenter.style.transform = `translate(-50%, -50%) scale(${1 + attractionStrength * 0.3})`;
      } else {
        magnetCenter.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    const handleMouseLeave = () => {
      // Hide custom cursor
      mouseCursor.style.opacity = '0';

      // Reset all particles
      particles.forEach((particle) => {
        (particle as HTMLElement).style.transform = 'translate(0, 0) scale(1)';
        (particle as HTMLElement).style.opacity = '';
      });

      // Reset magnet
      magnetCenter.style.transform = 'translate(-50%, -50%) scale(1)';
    };

    gameArea.addEventListener('mousemove', handleMouseMove);
    gameArea.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      gameArea.removeEventListener('mousemove', handleMouseMove);
      gameArea.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const { data: agents = [], isLoading, error } = useQuery<Agent[]>({
    queryKey: ["/api/agents", selectedCategory],
    queryFn: async () => {
      const categoryParam = selectedCategory === t("category.all") 
        ? "Tümü"
        : selectedCategory;
      const url = categoryParam === "Tümü" 
        ? "/api/agents" 
        : `/api/agents?category=${encodeURIComponent(categoryParam)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      return response.json();
    },
  });

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">{t("common.error")}</h2>
          <p className="text-gray-600 dark:text-gray-400">Ajanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
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
                  <div className="text-2xl font-semibold text-[var(--dark-purple)] dark:text-white">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">AI Ajan</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--dark-purple)] dark:text-white">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">Kullanıcı</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--dark-purple)] dark:text-white">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">Destek</div>
                </div>
              </div>
            </div>

            {/* Hero Game */}
            <div className="relative">
              <div className="relative glassmorphic rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-[var(--dark-purple)] dark:text-white mb-2">Mıknatıs Oyunu</h3>
                  <p className="text-gray-600 dark:text-gray-300">Fareyi hareket ettirin ve mıknatısın çekici gücünü hissedin!</p>
                </div>
                
                {/* Game Area */}
                <div 
                  className="relative w-full h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl overflow-hidden cursor-none"
                  id="magnetic-game-area"
                >
                  {/* Central Magnet */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 gradient-main rounded-2xl shadow-xl flex items-center justify-center floating-animation"
                    id="magnet-center"
                  >
                     <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg">
  <img
    src={Logo}
    alt="Agent Magnet Logo"
    className="w-full h-full object-contain"
  />
</div>
                  </div>
                  
                  {/* Game Particles */}
                  <div className="game-particles">
                    <div className="game-particle absolute top-12 left-12 w-3 h-3 bg-purple-400 rounded-full opacity-70 transition-all duration-300 ease-out"></div>
                    <div className="game-particle absolute top-20 right-16 w-2 h-2 bg-pink-400 rounded-full opacity-80 transition-all duration-300 ease-out"></div>
                    <div className="game-particle absolute bottom-16 left-20 w-2.5 h-2.5 bg-blue-400 rounded-full opacity-60 transition-all duration-300 ease-out"></div>
                    <div className="game-particle absolute bottom-12 right-12 w-2 h-2 bg-purple-300 rounded-full opacity-90 transition-all duration-300 ease-out"></div>
                    <div className="game-particle absolute top-1/3 left-8 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-75 transition-all duration-300 ease-out"></div>
                    <div className="game-particle absolute bottom-1/3 right-8 w-2 h-2 bg-cyan-400 rounded-full opacity-65 transition-all duration-300 ease-out"></div>
                    <div className="game-particle absolute top-24 left-1/2 w-2 h-2 bg-yellow-400 rounded-full opacity-80 transition-all duration-300 ease-out"></div>
                    <div className="game-particle absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-green-400 rounded-full opacity-70 transition-all duration-300 ease-out"></div>
                  </div>
                  
                  {/* Mouse Cursor Effect */}
                  <div 
                    id="mouse-cursor" 
                    className="absolute w-2 h-2 bg-white rounded-full shadow-lg pointer-events-none opacity-0 transition-opacity duration-200"
                  ></div>
                  
                  {/* Instructions */}
                  <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                    💡 Fareyi hareket ettirin ve mıknatıs etkisini görün
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
            <p className="text-lg text-gray-600 dark:text-gray-300 font-normal max-w-2xl mx-auto">
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
                    ? "bg-[var(--dark-purple)] text-white dark:bg-white dark:text-[var(--dark-purple)]"
                    : "text-gray-600 dark:text-gray-300 glassmorphic hover:bg-gray-50 dark:hover:bg-gray-800"
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
                <div key={index} className="glassmorphic rounded-xl p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                    <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-4 bg-gray-300 rounded"></div>
                    <div className="w-20 h-6 bg-gray-300 rounded"></div>
                  </div>
                </div>
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
              <p className="text-gray-600 dark:text-gray-300">
                Lütfen farklı bir kategori seçin veya daha sonra tekrar deneyin.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map((agent) => (
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
      <section className="py-20 bg-[var(--light-gray)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--dark-purple)] mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-lg text-gray-600 font-normal max-w-2xl mx-auto">
              Sadece üç adımda AI ajanlarından yararlanmaya başlayın.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 gradient-main rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
              </div>
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-4">Keşfet & Seç</h3>
              <p className="text-gray-600 font-normal leading-relaxed">
                İhtiyacınıza uygun AI ajanını kategoriler arasından kolayca bulun ve özelliklerini inceleyin.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 gradient-main rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
              </div>
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-4">Yapılandır</h3>
              <p className="text-gray-600 font-normal leading-relaxed">
                Seçtiğiniz ajanı kişiselleştirin, API anahtarlarınızı bağlayın ve tercihlerinizi ayarlayın.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 gradient-main rounded-full flex items-center justify-center text-white font-semibold text-sm">3</div>
              </div>
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-4">Otomatikleştir</h3>
              <p className="text-gray-600 font-normal leading-relaxed">
                AI ajanınız devreye girsin ve iş süreçlerinizi otomatik olarak optimize etsin.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="glassmorphic rounded-2xl shadow-md p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-[var(--dark-purple)] mb-4">
                Hemen Başlamaya Hazır mısınız?
              </h3>
              <p className="text-gray-600 font-normal mb-6">
                Binlerce AI ajanı arasından size en uygun olanı bulun ve dijital dönüşümünüzü hızlandırın.
              </p>
          <button className="relative inline-flex items-center justify-center px-1 py-1 rounded-lg group">
  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
  <div className="relative rounded-lg bg-white dark:bg-background px-6 py-2">
    <span className="text-black dark:text-white text-base font-medium leading-none">
      Ücretsiz Başlayın
    </span>
  </div>
</button>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
