import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, CheckCircle, Zap, Shield, Globe } from "lucide-react";
import type { Agent } from "@shared/schema";

export default function AgentDetail() {
  const [match, params] = useRoute("/agent/:id");
  const agentId = params?.id;

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

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-[var(--dark-purple)] font-medium mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Agent Details */}
          <div>
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

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-4">Özellikler</h3>
              <div className="space-y-3">
                {agent.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrations */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-4">Entegrasyonlar</h3>
              <div className="flex flex-wrap gap-2">
                {agent.integrations.map((integration, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm font-medium text-gray-700 glassmorphic rounded-lg"
                  >
                    {integration}
                  </span>
                ))}
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
                  ₺{agent.price}
                  <span className="text-lg text-gray-600 font-normal">/ay</span>
                </div>
                <p className="text-gray-600">Aylık abonelik</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">7 gün ücretsiz deneme</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Sınırsız kullanım</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">24/7 destek</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">API erişimi</span>
                </div>
              </div>

              <button className="w-full btn-gradient px-8 py-4 text-lg">
                <div className="gradient-border absolute inset-0 p-0.5 rounded-xl">
                  <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                    <span className="gradient-text font-semibold">Hemen Başla</span>
                  </div>
                </div>
              </button>

              <button className="w-full mt-4 btn-black px-8 py-3">
                Demo İzle
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                İstediğiniz zaman iptal edebilirsiniz. Kredi kartı gerekmez.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
