import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, CheckCircle, Zap, Shield, Globe, X, Mail, LogIn, MessageCircle } from "lucide-react";
import { useAgent, useAgentPurchase, useUserAgents } from "@/hooks/use-api";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorFallback } from "@/components/ui/error-boundary";
import type { Agent } from "@/lib/api";
import { useLanguage } from '@/contexts/LanguageContext';
import { useGoogleLogin } from "@react-oauth/google";
import HighlightButton from "@/components/ui/highlight-button";
import BasicButton from "@/components/ui/basic-button";

// Plan Card Component
const PlanCard = ({ 
  plan, 
  isSelected, 
  onClick, 
  billingCycle, 
  isPopular = false 
}: {
  plan: any;
  isSelected: boolean;
  onClick: () => void;
  billingCycle: string;
  isPopular?: boolean;
}) => {
  const { t } = useLanguage();
  
  return (
    <div 
      className={`glassmorphic rounded-xl p-4 md:p-6 cursor-pointer transition-all duration-200 ${
        isSelected ? "!border-2 !border-purple-500" : "hover:bg-white/20 dark:hover:bg-white/10"
      }`}
      onClick={onClick}
    >
      {isPopular && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 popular-tag-gradient text-white text-xs px-2 py-1 rounded-full">
          {t("agentDetail.popular")}
        </div>
      )}
      <div className="text-center mb-4">
        <h4 className="text-xl md:text-2xl font-normal text-[var(--foreground)] dark:text-white mb-2">
          {plan.name}
        </h4>
        <div className="text-2xl md:text-3xl font-normal text-[var(--foreground)] dark:text-white mb-1">
          $0
        </div>
        <div className="text-xs md:text-sm text-[var(--muted-foreground)] dark:text-white">
          {billingCycle === "monthly" ? t("agentDetail.monthlyToggle") : t("agentDetail.yearlyToggle")}
        </div>
      </div>
      <div className="space-y-2">
        {plan.features.map((feature: string, index: number) => (
          <div key={index} className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs font-light md:text-sm text-[var(--foreground)] dark:text-white">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Feature List Component
const FeatureList = ({ 
  title, 
  items, 
  icon: Icon, 
  iconColor = "text-emerald-400" 
}: {
  title: string;
  items: string[];
  icon: any;
  iconColor?: string;
}) => {
  if (items.length === 0) return null;
  
  return (
    <div className="glassmorphic rounded-xl p-6 mb-8">
      <h3 className="text-2xl font-normal text-[var(--foreground)] dark:text-white mb-6">
        {title}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
            <span className="text-sm text-[var(--foreground)] dark:text-white">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Agent Type Configuration
// Agent Type Configuration
const getAgentConfig = (type: string, t: any) => {
  const configs = {
    gmail: {
      icon: Mail,
      iconColor: "from-blue-500 to-purple-600",
      features: [
        t("agentDetail.gmail.features.emailSummary"),
        t("agentDetail.gmail.features.smartCategorization"),
        t("agentDetail.gmail.features.quickReplies"),
        t("agentDetail.gmail.features.priorityDetection"),
        t("agentDetail.gmail.features.scheduleEmails"),
        t("agentDetail.gmail.features.attachmentAnalysis")
      ],
      integrations: [
        t("agentDetail.gmail.integrations.gmailApi"),
        t("agentDetail.gmail.integrations.googleCalendar"),
        t("agentDetail.gmail.integrations.googleDrive"),
        t("agentDetail.gmail.integrations.googleContacts")
      ],
      useCases: [
        t("agentDetail.gmail.useCases.businessEmails"),
        t("agentDetail.gmail.useCases.personalOrganization"),
        t("agentDetail.gmail.useCases.teamCollaboration"),
        t("agentDetail.gmail.useCases.customerSupport")
      ],
      plans: {
        free: [
          "Günlük 10 sorgu",
          "Son 10 e-posta analizi", 
          "Temel kategorilendirme"
        ],
        plus: [
          "Sınırsız sorgu",
          "Gelişmiş kategorilendirme",
          "Akıllı yanıt önerileri",
          "Öncelik tespiti"
        ],
        premium: [
          "Tüm Plus özellikleri",
          "E-posta zamanlama",
          "Ek analizi",
          "Takım işbirliği"
        ]
      }
    },
    whatsapp: {
      icon: Zap,
      iconColor: "from-green-500 to-emerald-600",
      features: [
        t("agentDetail.whatsapp.features.autoReplies"),
        t("agentDetail.whatsapp.features.messageCategorization"),
        t("agentDetail.whatsapp.features.contactManagement"),
        t("agentDetail.whatsapp.features.bulkMessaging"),
        t("agentDetail.whatsapp.features.mediaHandling"),
        t("agentDetail.whatsapp.features.businessHours")
      ],
      integrations: [
        t("agentDetail.whatsapp.integrations.whatsappBusiness"),
        t("agentDetail.whatsapp.integrations.crmSystems"),
        t("agentDetail.whatsapp.integrations.analytics"),
        t("agentDetail.whatsapp.integrations.webhooks")
      ],
      useCases: [
        t("agentDetail.whatsapp.useCases.customerService"),
        t("agentDetail.whatsapp.useCases.marketingCampaigns"),
        t("agentDetail.whatsapp.useCases.orderManagement"),
        t("agentDetail.whatsapp.useCases.appointmentBooking")
      ],
      plans: {
        free: [
          "Temel yanıtlar",
          "Kişi senkronizasyonu",
          "Mesaj geçmişi"
        ],
        plus: [
          "Otomatik yanıtlar",
          "Toplu mesajlaşma",
          "Medya yönetimi",
          "İş saatleri"
        ],
        premium: [
          "Tüm Plus özellikleri",
          "CRM entegrasyonu",
          "Analitik",
          "Webhook'lar"
        ]
      }
    },
    general: {
      icon: Zap,
      iconColor: "from-blue-500 to-purple-600",
      features: [
        t("agentDetail.general.features.automation"),
        t("agentDetail.general.features.integration"),
        t("agentDetail.general.features.analytics")
      ],
      integrations: [],
      useCases: [],
      plans: {
        free: ["Temel özellikler"],
        plus: ["Gelişmiş özellikler"],
        premium: ["Tüm özellikler"]
      }
    }
  };
  
  return configs[type as keyof typeof configs] || configs.general;
};

export default function AgentDetail() {
  const [match, params] = useRoute("/agent/:id");
  const agentId = params?.id;
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "plus" | "premium">("plus");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [user, setUser] = useState<any>(null);

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

    window.addEventListener('userDataChanged', handleStorageChange);
    return () => window.removeEventListener('userDataChanged', handleStorageChange);
  }, []);

  // Google OAuth login
  const websiteLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch('/api/auth/google/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
            refresh_token: (tokenResponse as any).refresh_token || null,
            expires_in: (tokenResponse as any).expires_in || 3600,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const userData = {
            id: data.data.id,
            email: data.data.email,
            name: data.data.name,
            avatar: data.data.avatar
          };
          
          setUser(userData);
          localStorage.setItem('userData', JSON.stringify(userData));
          window.dispatchEvent(new Event('userDataChanged'));
        } else {
          alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
        }
      } catch (error) {
        console.error('Google OAuth error:', error);
        alert("Giriş sırasında hata oluştu.");
      }
    },
    onError: () => {
      alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
    },
  });

  const handleLogin = () => websiteLogin();

  const { data: agent, isLoading, error } = useAgent(agentId || '');
  const { purchaseAgent, isLoading: isPurchasing } = useAgentPurchase();
  const { data: userAgents } = useUserAgents(user?.id);

  const isAgentOwned = userAgents?.some(userAgent => userAgent.agentId === agentId);

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

  // Agent türünü belirle
  const getAgentType = (agent: Agent) => {
    if (agent.name.toLowerCase().includes('gmail') || agent.name.toLowerCase().includes('email')) {
      return 'gmail';
    } else if (agent.name.toLowerCase().includes('whatsapp')) {
      return 'whatsapp';
    }
    return 'general';
  };

  const agentType = getAgentType(agent);
  const agentConfig = getAgentConfig(agentType, t);

  // Plan configurations
  const planConfigs = {
    free: {
      name: t("agentDetail.freePlan"),
      features: agentConfig.plans.free
    },
    plus: {
      name: t("agentDetail.plusPlan"),
      features: agentConfig.plans.plus
    },
    premium: {
      name: t("agentDetail.premiumPlan"),
      features: agentConfig.plans.premium
    }
  };

  const currentPlan = planConfigs[selectedPlan];
  const IconComponent = agentConfig.icon;

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
            {/* Agent Description Card */}
            <div className="rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${agentConfig.iconColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-normal tracking-tight text-[var(--dark-purple)] dark:text-white">
                    {agent.name}
                  </h1>
                  <p className="text-md font-light text-[var(--muted-foreground)] dark:text-gray-300">{agent.category}</p>
                </div>
              </div>
              <p className="text-lg text-[var(--foreground)] dark:text-white font-light leading-relaxed">
                {agent.description}
              </p>
            </div>

            {/* Features Sections 
            <FeatureList 
              title={t("agentDetail.features")} 
              items={agentConfig.features} 
              icon={CheckCircle} 
            />
            
            <FeatureList 
              title={t("agentDetail.integrations")} 
              items={agentConfig.integrations} 
              icon={Globe} 
              iconColor="text-blue-400"
            />
            
            <FeatureList 
              title={t("agentDetail.useCases")} 
              items={agentConfig.useCases} 
              icon={Zap} 
              iconColor="text-yellow-400"
            />
            */}

            {/* Plan Selection */}
            <div className=" rounded-xl p-6 w-full max-w-[90vw] mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-normal text-[var(--foreground)] dark:text-white">
                  {t("agentDetail.planSelectionTitle")}
                </h3>
                
                {/* Billing Cycle Toggle */}
                <div className="flex glassmorphic rounded-xl p-1 text-sm">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      billingCycle === "monthly" 
                        ? "bg-black text-white dark:bg-white dark:text-black" 
                        : "text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {t("agentDetail.monthlyToggle")}
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      billingCycle === "yearly" 
                        ? "bg-black text-white dark:bg-white dark:text-black" 
                        : "text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {t("agentDetail.yearlyToggle")}
                  </button>
                </div>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <PlanCard
                  plan={planConfigs.free}
                  isSelected={selectedPlan === "free"}
                  onClick={() => setSelectedPlan("free")}
                  billingCycle={billingCycle}
                />
                <PlanCard
                  plan={planConfigs.plus}
                  isSelected={selectedPlan === "plus"}
                  onClick={() => setSelectedPlan("plus")}
                  billingCycle={billingCycle}
                  isPopular={true}
                />
                <PlanCard
                  plan={planConfigs.premium}
                  isSelected={selectedPlan === "premium"}
                  onClick={() => setSelectedPlan("premium")}
                  billingCycle={billingCycle}
                />
              </div>
            </div>
          </div>

          {/* Selected Plan Detail Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glassmorphic rounded-2xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${agentConfig.iconColor} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-normal text-[var(--foreground)] dark:text-white mb-2">
                    {currentPlan.name}
                  </div>
                  <div className="text-3xl font-normal text-[var(--foreground)] dark:text-white mb-2">
                    {selectedPlan === "free" ? "" : billingCycle === "monthly" ? "$0" + t("agentDetail.perMonth") : "$0" + t("agentDetail.perYear")}
                  </div>
                  <p className="text-[var(--muted-foreground)] dark:text-gray-400 text-sm">
                    {selectedPlan === "free" 
                      ? "" 
                      : billingCycle === "monthly" ? t("agentDetail.monthlySubscription") : t("agentDetail.yearlySubscription")
                    }
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {currentPlan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-[var(--foreground)] dark:text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                {!user ? (
                  <HighlightButton
                    onClick={handleLogin}
                    className="w-full text-center font-normal text-lg"
                  >
                    {t("agentDetail.loginAndPurchase")}
                  </HighlightButton>
                ) : isAgentOwned ? (
                  <div className="w-full px-2 py-4 text-lg mb-4">
                    <div className="dark: border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                    
                      <h3 className="text-lg font-normal text-green-800 dark:text-green-200 mb-2">
                        {t("agentDetail.alreadyOwned")}
                      </h3>
                      <p className="font-light text-gray-400  text-sm mb-4">
                        {t("agentDetail.alreadyOwnedDescription")}
                      </p>
                      <Link href="/my-agents">
  <BasicButton
    className="w-full text-white font-normal text-m px-4 rounded-lg transition-colors"
  >
    {t("agentDetail.goToMyAgents")}
  </BasicButton>
</Link>
                    </div>
                  </div>
                ) : (
                  <HighlightButton
                    onClick={() => {
                      if (agentId) {
                        purchaseAgent(agentId, '');
                      }
                    }}
                    disabled={isPurchasing}
                    className="w-full text-center font-normal text-lg"
                  >
                    {isPurchasing ? t("agentDetail.purchasing") : t("agentDetail.purchase")}
                  </HighlightButton>
                )}

                <p className="text-xs text-[var(--muted-foreground)] dark:text-gray-400 text-center mt-4">
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
    </div>
  );
}