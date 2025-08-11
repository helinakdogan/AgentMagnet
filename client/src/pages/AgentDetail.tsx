import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, CheckCircle, Zap, Shield, Globe, X, Mail, LogIn } from "lucide-react";
import { useAgent, useAgentPurchase, useUserAgents } from "@/hooks/use-api";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorFallback } from "@/components/ui/error-boundary";
import type { Agent } from "@/lib/api";
import { useLanguage } from '@/contexts/LanguageContext';
import { useGoogleLogin } from "@react-oauth/google";

export default function AgentDetail() {
  const [match, params] = useRoute("/agent/:id");
  const agentId = params?.id;
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "plus" | "premium">("plus");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [user, setUser] = useState<any>(null);

  // Cube rotation states
  const [cubeRotations, setCubeRotations] = useState({
    fastSetup: { x: 0, y: 0 },
    secure: { x: 0, y: 0 },
    globalAccess: { x: 0, y: 0 }
  });

  // Sayfa yüklendiğinde localStorage'dan user bilgisini al
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // localStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    // Custom event listener for localStorage changes
    window.addEventListener('userDataChanged', handleStorageChange);
    return () => window.removeEventListener('userDataChanged', handleStorageChange);
  }, []);

  // Google OAuth login for website authentication
  const websiteLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google OAuth success, token:', tokenResponse);
      
      try {
        // Proxy kullandığımız için /api ile başlayan endpoint'i kullan
        const response = await fetch('/api/auth/google/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
                  body: JSON.stringify({
          access_token: tokenResponse.access_token,
          refresh_token: (tokenResponse as any).refresh_token || null,
          expires_in: (tokenResponse as any).expires_in || 3600,
        }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Google OAuth success, data:', data);
              
          // Set user directly (JWT olmadan)
          const userData = {
            id: data.data.id,
            email: data.data.email,
            name: data.data.name,
            avatar: data.data.avatar
            // ❌ token: data.data.token - KALDIR (güvenlik için)
          };
          
          setUser(userData);
          console.log('User set:', userData);
          
          // Store user data in localStorage for other pages (JWT olmadan)
          localStorage.setItem('userData', JSON.stringify(userData));
          
          // Trigger custom event for other components
          window.dispatchEvent(new Event('userDataChanged'));
        } else {
          console.log('Backend response not ok');
          alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
        }
      } catch (error) {
        console.error('Google OAuth error:', error);
        alert("Giriş sırasında hata oluştu.");
      }
    },
    onError: () => {
      console.log('Google OAuth failed');
      alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
    },
  });

  const handleLogin = () => {
    console.log('handleLogin called!');
    websiteLogin();
  };

  const { data: agent, isLoading, error } = useAgent(agentId || '');
  const { purchaseAgent, isLoading: isPurchasing } = useAgentPurchase();
  const { data: userAgents } = useUserAgents(user?.id);

  // Kullanıcının bu agent'ı zaten alıp almadığını kontrol et
  const isAgentOwned = userAgents?.some(userAgent => userAgent.agentId === agentId);

  // Cube rotation handlers
  const handleCubeMouseMove = (cubeType: keyof typeof cubeRotations, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Slower rotation for better control
    const rotateX = (mouseY / (rect.height / 2)) * 180; // Reduced to 180 degrees for slower rotation
    const rotateY = (mouseX / (rect.width / 2)) * 180; // Reduced to 180 degrees for slower rotation
    
    setCubeRotations(prev => ({
      ...prev,
      [cubeType]: { x: rotateX, y: rotateY }
    }));
  };

  const handleCubeMouseLeave = (cubeType: keyof typeof cubeRotations) => {
    setCubeRotations(prev => ({
      ...prev,
      [cubeType]: { x: 0, y: 0 }
    }));
  };

  if (!match || !agentId) {
    return <div>Agent ID gerekli</div>;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorFallback 
            error={error as Error || new Error('Agent not found')} 
            resetError={() => window.location.reload()} 
          />
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
    // Gmail agent için özel kontrol - kategoriden bağımsız olarak Mail iconu göster
    if (agent.name.toLowerCase().includes('gmail')) {
      return <Mail className="w-8 h-8 text-white" />;
    }

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
      case "analiz":
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "gmail":
      case "email":
      case "e-posta":
        return <Mail className="w-8 h-8 text-white" />;
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
        "Günlük 5 sorgu",
        "Son 10 mailinizin özetleri",
        "example@gmail.com uzantılı mail adresleri ile çalışır",
      ],
      limitations: [
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
        "Bu plan henüz demo sürümümüzde yer almamaktadır. Üzerine çalışılmaktadır.",
      ],
      limitations: [
        "Bu plan henüz demo sürümümüzde yer almamaktadır. Üzerine çalışılmaktadır.",
      ],
      integrations: agent.integrations.slice(0, 4),
    },
    premium: {
      name: "Premium",
      price: Math.round(agent.price * 2.5),
      monthlyPrice: Math.round(agent.price * 2.5),
      yearlyPrice: Math.round(agent.price * 2.5 * 12 * 0.75), // 25% indirim
      features: [
        "Bu plan henüz demo sürümümüzde yer almamaktadır. Üzerine çalışılmaktadır.",
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
          <button className="flex items-center space-x-2 text-[var(--muted-foreground)] hover:text-[var(--dark-purple)] dark:hover:text-white font-medium mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{t("agentDetail.backToAgents")}</span>
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
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--dark-purple)] dark:text-white">
                  {agent.name}
                </h1>
                <p className="text-lg text-[var(--muted-foreground)]">{agent.category}</p>
              </div>
            </div>

            <p className="text-lg text-[var(--foreground)] font-normal leading-relaxed mb-8">
              {agent.description}
            </p>

            {/* Plan Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] dark:text-white mb-4">{t("agentDetail.planSelection")}</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {(["free", "plus", "premium"] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      selectedPlan === plan
                        ? "bg-[var(--dark-purple)] dark:bg-white text-white dark:text-black shadow-lg"
                        : "glassmorphic text-[var(--foreground)] hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-md"
                    }`}
                  >
                    {planConfigs[plan].name}
                  </button>
                ))}
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[var(--muted-foreground)]">{t("agentDetail.billing")}</span>
                <div className="flex glassmorphic rounded-xl p-1">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      billingCycle === "monthly" 
                        ? "bg-[var(--dark-purple)] dark:bg-white text-white dark:text-black" 
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {t("agentDetail.monthly")}
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      billingCycle === "yearly" 
                        ? "bg-[var(--dark-purple)] dark:bg-white text-white dark:text-black" 
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {t("agentDetail.yearly")}
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] dark:text-white mb-4">
                {currentPlan.name} {t("agentDetail.planFeatures")}
              </h3>
              <div className="space-y-3">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-[var(--foreground)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Integrations */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[var(--dark-purple)] dark:text-white mb-4">
                {currentPlan.name} {t("agentDetail.planIntegrations")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentPlan.integrations.map((integration: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm font-medium text-[var(--foreground)] glassmorphic rounded-lg"
                  >
                    {integration}
                  </span>
                ))}
                {currentPlan.integrations.length < agent.integrations.length && (
                  <span className="px-3 py-1 text-sm font-medium text-[var(--muted-foreground)] glassmorphic rounded-lg">
                    +{agent.integrations.length - currentPlan.integrations.length} {t("agentDetail.moreInPremium")}
                  </span>
                )}
              </div>
            </div>

            {/* Benefits - 3D Cube Cards */}
            <div className="grid sm:grid-cols-3 gap-6">
              {/* Fast Setup Cube */}
              <div 
                className="relative w-32 h-32 cursor-pointer perspective-1000 mx-auto"
                onMouseMove={(e) => handleCubeMouseMove('fastSetup', e)}
                onMouseLeave={() => handleCubeMouseLeave('fastSetup')}
              >
                <div 
                  className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out preserve-3d"
                  style={{
                    transform: `rotateX(${cubeRotations.fastSetup.x}deg) rotateY(${cubeRotations.fastSetup.y}deg)`
                  }}
                >
                  {/* Front Face */}
                  <div className="cube-face cube-front glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light yellow"></div>
                    <Zap className="w-8 h-8 text-yellow-500 mb-2 relative z-10" />
                    <div className="text-sm font-medium text-[var(--foreground)] text-center relative z-10">
                      {t("agentDetail.fastSetup")}
                    </div>
                  </div>
                  
                  {/* Back Face */}
                  <div className="cube-face cube-back glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light yellow"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Saniyeler içinde kurulum
                    </div>
                  </div>
                  
                  {/* Right Face */}
                  <div className="cube-face cube-right glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light yellow"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Hızlı entegrasyon
                    </div>
                  </div>
                  
                  {/* Left Face */}
                  <div className="cube-face cube-left glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light yellow"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Kolay kullanım
                    </div>
                  </div>
                  
                  {/* Top Face */}
                  <div className="cube-face cube-top glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light yellow"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Anında erişim
                    </div>
                  </div>
                  
                  {/* Bottom Face */}
                  <div className="cube-face cube-bottom glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light yellow"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Otomatik kurulum
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Cube */}
              <div 
                className="relative w-32 h-32 cursor-pointer perspective-1000 mx-auto"
                onMouseMove={(e) => handleCubeMouseMove('secure', e)}
                onMouseLeave={() => handleCubeMouseLeave('secure')}
              >
                <div 
                  className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out preserve-3d"
                  style={{
                    transform: `rotateX(${cubeRotations.secure.x}deg) rotateY(${cubeRotations.secure.y}deg)`
                  }}
                >
                  {/* Front Face */}
                  <div className="cube-face cube-front glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light green"></div>
                    <Shield className="w-8 h-8 text-green-500 mb-2 relative z-10" />
                    <div className="text-sm font-medium text-[var(--foreground)] text-center relative z-10">
                      {t("agentDetail.secure")}
                    </div>
                  </div>
                  
                  {/* Back Face */}
                  <div className="cube-face cube-back glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light green"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      End-to-end şifreleme
                    </div>
                  </div>
                  
                  {/* Right Face */}
                  <div className="cube-face cube-right glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light green"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Güvenli API
                    </div>
                  </div>
                  
                  {/* Left Face */}
                  <div className="cube-face cube-left glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light green"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Veri koruması
                    </div>
                  </div>
                  
                  {/* Top Face */}
                  <div className="cube-face cube-top glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light green"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      SSL sertifikası
                    </div>
                  </div>
                  
                  {/* Bottom Face */}
                  <div className="cube-face cube-bottom glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light green"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Güvenlik standartları
                    </div>
                  </div>
                </div>
              </div>

              {/* Global Access Cube */}
              <div 
                className="relative w-32 h-32 cursor-pointer perspective-1000 mx-auto"
                onMouseMove={(e) => handleCubeMouseMove('globalAccess', e)}
                onMouseLeave={() => handleCubeMouseLeave('globalAccess')}
              >
                <div 
                  className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out preserve-3d"
                  style={{
                    transform: `rotateX(${cubeRotations.globalAccess.x}deg) rotateY(${cubeRotations.globalAccess.y}deg)`
                  }}
                >
                  {/* Front Face */}
                  <div className="cube-face cube-front glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light blue"></div>
                    <Globe className="w-8 h-8 text-blue-500 mb-2 relative z-10" />
                    <div className="text-sm font-medium text-[var(--foreground)] text-center relative z-10">
                      {t("agentDetail.globalAccess")}
                    </div>
                  </div>
                  
                  {/* Back Face */}
                  <div className="cube-face cube-back glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light blue"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Dünya çapında erişim
                    </div>
                  </div>
                  
                  {/* Right Face */}
                  <div className="cube-face cube-right glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light blue"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      24/7 kullanılabilirlik
                    </div>
                  </div>
                  
                  {/* Left Face */}
                  <div className="cube-face cube-left glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light blue"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Çoklu dil desteği
                    </div>
                  </div>
                  
                  {/* Top Face */}
                  <div className="cube-face cube-top glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light blue"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Bulut tabanlı
                    </div>
                  </div>
                  
                  {/* Bottom Face */}
                  <div className="cube-face cube-bottom glass-cube rounded-xl flex flex-col items-center justify-center backface-hidden relative">
                    <div className="cube-inner-light blue"></div>
                    <div className="text-xs text-[var(--muted-foreground)] text-center px-2 relative z-10">
                      Her cihazdan erişim
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glassmorphic rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-4xl font-semibold text-[var(--dark-purple)] dark:text-white mb-2">
                  {selectedPlan === "free" ? (
                    <span>{t("agentDetail.free")}</span>
                  ) : (
                    <>
                      ₺{displayPrice}
                      <span className="text-lg text-[var(--muted-foreground)] font-normal">{t("agentDetail.perMonth")}</span>
                    </>
                  )}
                </div>
                <p className="text-[var(--muted-foreground)]">
                  {selectedPlan === "free" 
                    ? t("agentDetail.freeDescription") 
                    : billingCycle === "yearly" 
                      ? `₺${currentPlan.yearlyPrice} ${t("agentDetail.yearlyPayment")}`
                      : t("agentDetail.monthlySubscription")
                  }
                </p>
                {billingCycle === "yearly" && selectedPlan !== "free" && (
                  <p className="text-green-600 text-sm font-medium">
                    {t("agentDetail.yearlySavings")}
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {currentPlan.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-[var(--foreground)]">{feature}</span>
                  </div>
                ))}
              </div>

              {!user ? (
                <button 
                  onClick={handleLogin}
                  className="w-full btn-gradient px-8 py-4 text-lg mb-4 relative overflow-hidden"
                >
                  <div className="gradient-border absolute inset-0 p-0.5 rounded-xl">
                    <div className="bg-white dark:bg-[var(--dark-purple)] rounded-xl w-full h-full flex items-center justify-center">
                      <span className="gradient-text font-semibold flex items-center justify-center">
                        <LogIn className="w-5 h-5 mr-2" />
                        {t("agentDetail.loginAndPurchase")}
                      </span>
                    </div>
                  </div>
                </button>
              ) : isAgentOwned ? (
                <div className="w-full px-8 py-4 text-lg mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      {t("agentDetail.alreadyOwned")}
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-sm mb-4">
                      {t("agentDetail.alreadyOwnedDescription")}
                    </p>
                    <Link href="/my-agents">
                      <button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        {t("agentDetail.goToMyAgents")}
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    if (agentId) {
                      purchaseAgent(agentId, ''); // userId artık hook içinde localStorage'dan alınıyor
                    }
                  }}
                  disabled={isPurchasing}
                  className="w-full btn-gradient px-8 py-4 text-lg mb-4 relative overflow-hidden"
                >
                  <div className="gradient-border absolute inset-0 p-0.5 rounded-xl">
                    <div className="bg-white dark:bg-[var(--dark-purple)] rounded-xl w-full h-full flex items-center justify-center">
                      <span className="gradient-text font-semibold">
                        {isPurchasing ? t("agentDetail.purchasing") : t("agentDetail.purchase")}
                      </span>
                    </div>
                  </div>
                </button>
              )}

              <p className="text-xs text-[var(--muted-foreground)] text-center mt-4">
                {selectedPlan === "free" 
                  ? t("agentDetail.freeCreditCard")
                  : t("agentDetail.cancelAnytime")
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
