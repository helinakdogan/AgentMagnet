import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, CheckCircle, Zap, Shield, Globe, X } from "lucide-react";
import type { Agent } from "@shared/schema";

export default function AgentDetail() {
  const [match, params] = useRoute("/agent/:id");
  const agentId = params?.id;
  const [selectedPlan, setSelectedPlan] = useState<"free" | "plus" | "premium">("plus");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const { data: agent, isLoading, error } = useQuery<Agent>({
    queryKey: ["/api/agents", agentId],
    enabled: !!agentId,
  });

  if (!match || !agentId) {
    return <div>Agent ID gerekli</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-8"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <div className="h-12 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
              <div className="glassmorphic rounded-2xl p-8">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-8 bg-gray-300 rounded mb-6"></div>
                <div className="h-12 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Agent Bulunamadı</h2>
            <p className="text-gray-600 mb-8">İstediğiniz agent mevcut değil veya kaldırılmış olabilir.</p>
            <Link href="/">
              <button className="btn-black px-6 py-3">Ana Sayfaya Dön</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getIconColorClasses = (iconColor: string) => {
    switch (iconColor) {
      case "blue-purple":
        return "from-blue-500 to-purple-600";
      case "pink-orange":
        return "from-pink-500 to-orange-500";
      case "green-teal":
        return "from-green-500 to-teal-600";
      case "indigo-purple":
        return "from-indigo-500 to-purple-600";
      case "red-pink":
        return "from-red-500 to-pink-600";
      case "yellow-orange":
        return "from-yellow-500 to-orange-600";
      case "cyan-blue":
        return "from-cyan-500 to-blue-600";
      case "violet-purple":
        return "from-violet-500 to-purple-600";
      default:
        return "from-blue-500 to-purple-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "yazım":
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case "görsel":
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "ses":
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const iconColorClasses = getIconColorClasses(agent.iconColor);

  // Plan configurations
  const planConfigs = {
    free: {
      name: "Ücretsiz",
      price: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Günlük 10 sorgu",
        "Temel özellikler",
        "E-posta desteği",
        "Topluluk forumu"
      ],
      limitations: [
        "API erişimi yok",
        "Öncelikli destek yok",
        "Gelişmiş özellikler yok",
        "Entegrasyonlar sınırlı"
      ],
      integrations: agent.integrations.slice(0, 2),
    },
    plus: {
      name: "Plus",
      price: agent.price,
      monthlyPrice: agent.price,
      yearlyPrice: Math.round(agent.price * 12 * 0.8), // 20% indirim
      features: [
        "Günlük 1000 sorgu",
        "Tüm temel özellikler",
        "API erişimi",
        "Öncelikli e-posta desteği",
        "Gelişmiş entegrasyonlar",
        "Analitik dashboard"
      ],
      limitations: [
        "Premium özellikler yok",
        "Özel model eğitimi yok"
      ],
      integrations: agent.integrations.slice(0, 4),
    },
    premium: {
      name: "Premium",
      price: Math.round(agent.price * 2.5),
      monthlyPrice: Math.round(agent.price * 2.5),
      yearlyPrice: Math.round(agent.price * 2.5 * 12 * 0.75), // 25% indirim
      features: [
        "Sınırsız sorgu",
        "Tüm özellikler",
        "API erişimi + webhooks",
        "7/24 canlı destek",
        "Özel entegrasyonlar",
        "Gelişmiş analitik",
        "Özel model eğitimi",
        "Beyaz etiket çözümü",
        "SLA garantisi"
      ],
      limitations: [],
      integrations: agent.integrations,
    }
  };

  const currentPlan = planConfigs[selectedPlan];
  const displayPrice = billingCycle === "yearly" 
    ? Math.round(currentPlan.yearlyPrice / 12) 
    : currentPlan.monthlyPrice;

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/agents">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-[var(--dark-purple)] font-medium mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Ajanlar Mağazasına Dön</span>
          </button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Agent Details */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${iconColorClasses} rounded-2xl flex items-center justify-center shadow-lg`}>
                {getCategoryIcon(agent.category)}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--dark-purple)]">
                  {agent.name}
                </h1>
                <p className="text-lg text-gray-600">{agent.category}</p>
              </div>
            </div>

            <p className="text-lg text-gray-700 font-normal leading-relaxed mb-8">
              {agent.description}
            </p>

            {/* Plan Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-4">Plan Seçimi</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {(["free", "plus", "premium"] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                      selectedPlan === plan
                        ? "bg-[var(--dark-purple)] text-white"
                        : "glassmorphic text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {planConfigs[plan].name}
                  </button>
                ))}
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700">Faturalama:</span>
                <div className="flex glassmorphic rounded-xl p-1">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      billingCycle === "monthly" ? "bg-purple-500 text-white" : "text-gray-600"
                    }`}
                  >
                    Aylık
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      billingCycle === "yearly" ? "bg-purple-500 text-white" : "text-gray-600"
                    }`}
                  >
                    Yıllık
                    <span className="ml-1 text-xs bg-green-500 text-white px-1 rounded">
                      {selectedPlan === "premium" ? "%25" : "%20"} indirim
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-4">
                {currentPlan.name} Planı Özellikleri
              </h3>
              <div className="space-y-3">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {currentPlan.limitations.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Kısıtlamalar</h4>
                  <div className="space-y-2">
                    {currentPlan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center space-x-3 opacity-70">
                        <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Plan Integrations */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-4">
                {currentPlan.name} Planında Kullanılabilir Entegrasyonlar
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentPlan.integrations.map((integration, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm font-medium text-gray-700 glassmorphic rounded-lg"
                  >
                    {integration}
                  </span>
                ))}
                {currentPlan.integrations.length < agent.integrations.length && (
                  <span className="px-3 py-1 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg">
                    +{agent.integrations.length - currentPlan.integrations.length} daha fazla Premium'da
                  </span>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 glassmorphic rounded-xl">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700">Hızlı Kurulum</div>
              </div>
              <div className="text-center p-4 glassmorphic rounded-xl">
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700">Güvenli</div>
              </div>
              <div className="text-center p-4 glassmorphic rounded-xl">
                <Globe className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-700">Global Erişim</div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glassmorphic rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-4xl font-semibold text-[var(--dark-purple)] mb-2">
                  {selectedPlan === "free" ? (
                    <span>Ücretsiz</span>
                  ) : (
                    <>
                      ₺{displayPrice}
                      <span className="text-lg text-gray-600 font-normal">/ay</span>
                    </>
                  )}
                </div>
                <p className="text-gray-600">
                  {selectedPlan === "free" 
                    ? "Süresiz ücretsiz" 
                    : billingCycle === "yearly" 
                      ? `₺${currentPlan.yearlyPrice} yıllık ödeme`
                      : "Aylık abonelik"
                  }
                </p>
                {billingCycle === "yearly" && selectedPlan !== "free" && (
                  <p className="text-green-600 text-sm font-medium">
                    Yıllık ödemeyle {selectedPlan === "premium" ? "%25" : "%20"} tasarruf edin!
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {currentPlan.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
                {selectedPlan !== "free" && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      {selectedPlan === "plus" ? "7" : "14"} gün ücretsiz deneme
                    </span>
                  </div>
                )}
              </div>

              <button className="w-full btn-gradient px-8 py-4 text-lg mb-4">
                <div className="gradient-border absolute inset-0 p-0.5 rounded-xl">
                  <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                    <span className="gradient-text font-semibold">
                      {selectedPlan === "free" ? "Ücretsiz Başla" : "Denemeyi Başlat"}
                    </span>
                  </div>
                </div>
              </button>

              <button className="w-full btn-black px-8 py-3">
                Demo İzle
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {selectedPlan === "free" 
                  ? "Kredi kartı gerektirmez. İstediğiniz zaman yükseltebilirsiniz."
                  : "İstediğiniz zaman iptal edebilirsiniz. Kredi kartı gerekmez."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
