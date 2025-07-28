import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AgentCard from "@/components/AgentCard";
import type { Agent } from "@shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  const { data: agents = [], isLoading, error } = useQuery<Agent[]>({
    queryKey: ["/api/agents", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "Tümü" 
        ? "/api/agents" 
        : `/api/agents?category=${encodeURIComponent(selectedCategory)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      return response.json();
    },
  });

  const categories = ["Tümü", "Yazım", "Görsel", "Ses", "Analiz", "Sohbet", "Kod", "Dil", "Pazarlama"];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Hata Oluştu</h2>
          <p className="text-gray-600">Ajanlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--dark-purple)] leading-tight">
                AI Ajanlarınızı
                <span className="gradient-text ml-3">Keşfedin</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 font-normal leading-relaxed">
                Yapay zeka ajanlarının büyülü dünyasına hoş geldiniz. Binlerce AI ajana erişin, 
                kendi ajanlarınızı satışa sunun ve dijital dönüşümünüzü hızlandırın.
              </p>
              
              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="btn-gradient px-8 py-4">
                  <div className="gradient-border absolute inset-0 p-0.5 rounded-xl">
                    <div className="bg-[var(--light-gray)] rounded-xl w-full h-full flex items-center justify-center">
                      <span className="gradient-text">Ajanları Keşfet</span>
                    </div>
                  </div>
                </button>
                <button className="btn-black px-8 py-4 text-lg">
                  Ajanınızı Satın
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-semibold text-[var(--dark-purple)]">500+</div>
                  <div className="text-sm text-gray-600 font-normal">AI Ajan</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--dark-purple)]">10K+</div>
                  <div className="text-sm text-gray-600 font-normal">Kullanıcı</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-[var(--dark-purple)]">24/7</div>
                  <div className="text-sm text-gray-600 font-normal">Destek</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="AI technology interface dashboard" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--dark-purple)]/20 to-transparent"></div>
              </div>
              
              {/* Floating Magnet Visual */}
              <div className="absolute -top-4 -right-4 w-16 h-16 gradient-main rounded-2xl shadow-xl flex items-center justify-center floating-animation">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 3v5c0 2.76 2.24 5 5 5s5-2.24 5-5V3h2v5c0 3.87-3.13 7-7 7s-7-3.13-7-7V3h2zm10 0v5c0 1.66-1.34 3-3 3s-3-1.34-3-3V3h6z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--dark-purple)] mb-4">
              Popüler AI Ajanları
            </h2>
            <p className="text-lg text-gray-600 font-normal max-w-2xl mx-auto">
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
                    ? "bg-[var(--dark-purple)] text-white"
                    : "text-gray-600 glassmorphic hover:bg-gray-50"
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
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-2">
                Bu kategoride ajan bulunamadı
              </h3>
              <p className="text-gray-600">
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
              <button className="px-8 py-4 text-lg font-semibold text-[var(--dark-purple)] glassmorphic rounded-xl hover:bg-gray-50 transition-colors shadow-md">
                Tüm Ajanları Görüntüle
              </button>
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
              <button className="btn-gradient px-8 py-4">
                <div className="gradient-border absolute inset-0 p-0.5 rounded-xl">
                  <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                    <span className="gradient-text">Ücretsiz Başlayın</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
