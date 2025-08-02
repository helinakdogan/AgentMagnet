import { createContext, useContext, useState, ReactNode } from "react";

type Language = "tr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getCategoryMapping: (category: string) => string;
}

const translations = {
  tr: {
    // Header
    "header.login": "Giriş Yap",
    "header.signup": "Kayıt Ol",
    "header.logout": "Çıkış",
    
    // Navigation
    "nav.home": "Ana Sayfa",
    "nav.agents": "Ajanlar",
    "nav.myAgents": "Ajanlarım",
    "nav.pricing": "Fiyatlandırma",
    "nav.developer": "Geliştirici",
    
    // Home Page
    "home.hero.title": "Yapay Zeka Ajanlarının",
    "home.hero.subtitle": "Büyülü Dünyası",
    "home.hero.description": "Binlerce YZ ajanına erişin, kendi ajanlarınızı satışa sunun ve dijital dönüşümünüzü hızlandırın.",
    "home.hero.cta": "Ajanları Keşfet",
    "home.hero.learn": "Geliştirici Ol",
    "home.categories.title": "Kategoriler",
    "home.featured.title": "Öne Çıkan Ajanlar",
    "home.view.all": "Tümünü Görüntüle",
    
    // Agent Store
    "store.title": "YZ Ajan",
    "store.title.highlight": "Mağazası",
    "store.description": "Binlerce yapay zeka ajanı arasından ihtiyacınıza en uygun olanları keşfedin. Her kategoriden profesyonel çözümler burada.",
    "store.search.placeholder": "Ajan ara...",
    "store.sort.popular": "Popüler",
    "store.sort.price": "Fiyat",
    "store.sort.name": "İsim",
    "store.view.grid": "Izgara",
    "store.view.list": "Liste",
    
    // Categories
    "category.all": "Tümü",
    "category.writing": "Yazım",
    "category.visual": "Görsel",
    "category.audio": "Ses",
    "category.analysis": "Analiz",
    "category.chat": "Sohbet",
    "category.code": "Kod",
    "category.language": "Dil",
    "category.marketing": "Pazarlama",
    
    // Agent Status
    "status.active": "Aktif",
    "status.popular": "Popüler",
    "status.new": "Yeni",
    "status.trend": "Trend",
    "status.pro": "Pro",
    "status.automatic": "Otomatik",
    
    // Pricing
    "pricing.monthly": "/ay",
    "pricing.yearly": "/yıl",
    "pricing.free": "Ücretsiz",
    "pricing.plus": "Plus",
    "pricing.premium": "Premium",
    
    // My Agents Page
    "myAgents.title": "Ajanlarım",
    "myAgents.description": "Satın aldığınız ajanları yönetin ve kullanın",
    "myAgents.gmailAgent": "Gmail Ajan",
    "myAgents.useGmail": "Gmail Kullan",
    
    // Agent Detail Page
    "agentDetail.purchase": "Ajan'ı Al",
    "agentDetail.purchasing": "Satın Alınıyor...",
    "agentDetail.loginAndPurchase": "Giriş Yap ve Ajan'ı Al",
    "agentDetail.alreadyOwned": "Bu ajana sahipsiniz",
    "agentDetail.alreadyOwnedDescription": "Ajanlarım bölümünden kullanmaya devam edin.",
    "agentDetail.goToMyAgents": "Ajanlarım'a Git",
    
    // Agent Start Page
    "agentStart.title": "Giriş Yapın",
    "agentStart.description": "ajan'ını kullanabilmek için önce giriş yapmanız gerekiyor.",
    "agentStart.whyLogin": "Neden giriş yapmalıyım?",
    "agentStart.loginReason1": "Ajan kullanımınızı takip edebiliriz",
    "agentStart.loginReason2": "Güvenli ve kişiselleştirilmiş deneyim",
    "agentStart.loginReason3": "Kullanım geçmişinizi görebilirsiniz",
    "agentStart.googleLogin": "Google ile Giriş Yap",
    
    // Gmail Agent Usage
    "gmail.title": "Gmail Agent Kullanımı",
    "gmail.description": "Gmail hesabınızdan son maillerinizi görüntüleyin ve AI ile özetleyin",
    "gmail.backToAgent": "Ajan'a Dön",
    "gmail.connectGmail": "Gmail Hesabımı Bağla",
    "gmail.getEmails": "Mailleri Getir",
    "gmail.loading": "Yükleniyor...",
    "gmail.loadingEmails": "Mailler yükleniyor...",
    "gmail.showSnippets": "Snippet'leri Göster",
    "gmail.hideSnippets": "Snippet'leri Gizle",
    "gmail.recentEmails": "Son Mailler",
    "gmail.aiSummary": "Kısa Özet",
    "gmail.noEmails": "Mail Bulunamadı",
    "gmail.noEmailsDescription": "Gmail hesabınızda mail bulunamadı veya henüz mailleri getirmediniz.",
    "gmail.connectRequired": "Gmail Bağlantısı Gerekli",
    "gmail.connectDescription": "Gmail hesabınızı bağlayarak maillerinizi görüntüleyebilir ve AI ile özetleyebilirsiniz.",
    "gmail.aiFeature": "AI Özetleme Özelliği",
    "gmail.aiFeature1": "Her e-posta için AI özeti oluşturulur",
    "gmail.aiFeature2": "Rate limit nedeniyle kademeli işlenir (2 saniye aralıklarla)",
    "gmail.aiFeature3": "Türkçe, kısa ve öz özetler",
    "gmail.aiFeature4": "Google Gemini 2.0 Flash modeli kullanılır",
    
    // Common
    "common.loading": "Yükleniyor...",
    "common.error": "Hata Oluştu",
    "common.try_again": "Tekrar Dene",
    "common.back_home": "Ana Sayfaya Dön",
    
    // Footer
    "footer.platform": "Platform",
    "footer.support": "Destek",
    "footer.help": "Yardım Merkezi",
    "footer.docs": "Dokümantasyon",
    "footer.contact": "İletişim",
    "footer.community": "Topluluk",
    "footer.privacy": "Gizlilik Politikası",
    "footer.terms": "Kullanım Şartları",
    "footer.cookies": "Çerezler",
    "footer.rights": "© 2025 Agent Magnet. Tüm hakları saklıdır."
  },
  en: {
    // Header
    "header.login": "Sign In",
    "header.signup": "Sign Up",
    "header.logout": "Logout",
    
    // Navigation
    "nav.home": "Home",
    "nav.agents": "Agents",
    "nav.myAgents": "My Agents",
    "nav.pricing": "Pricing",
    "nav.developer": "Developer",
    
    // Home Page
    "home.hero.title": "The Magical World of",
    "home.hero.subtitle": "AI Agents",
    "home.hero.description": "Access thousands of AI agents, sell your own agents, and accelerate your digital transformation.",
    "home.hero.cta": "Explore Agents",
    "home.hero.learn": "Become Developer",
    "home.categories.title": "Categories",
    "home.featured.title": "Featured Agents",
    "home.view.all": "View All",
    
    // Agent Store
    "store.title": "AI Agent",
    "store.title.highlight": "Store",
    "store.description": "Discover the most suitable AI agents for your needs from thousands of options. Professional solutions from every category are here.",
    "store.search.placeholder": "Search agents...",
    "store.sort.popular": "Popular",
    "store.sort.price": "Price",
    "store.sort.name": "Name",
    "store.view.grid": "Grid",
    "store.view.list": "List",
    
    // Categories
    "category.all": "All",
    "category.writing": "Writing",
    "category.visual": "Visual",
    "category.audio": "Audio",
    "category.analysis": "Analysis",
    "category.chat": "Chat",
    "category.code": "Code",
    "category.language": "Language",
    "category.marketing": "Marketing",
    
    // Agent Status
    "status.active": "Active",
    "status.popular": "Popular",
    "status.new": "New",
    "status.trend": "Trending",
    "status.pro": "Pro",
    "status.automatic": "Automatic",
    
    // Pricing
    "pricing.monthly": "/month",
    "pricing.yearly": "/year",
    "pricing.free": "Free",
    "pricing.plus": "Plus",
    "pricing.premium": "Premium",
    
    // My Agents Page
    "myAgents.title": "My Agents",
    "myAgents.description": "Manage and use your purchased agents",
    "myAgents.gmailAgent": "Gmail Agent",
    "myAgents.useGmail": "Use Gmail",
    
    // Agent Detail Page
    "agentDetail.purchase": "Buy Agent",
    "agentDetail.purchasing": "Purchasing...",
    "agentDetail.loginAndPurchase": "Login and Buy Agent",
    "agentDetail.alreadyOwned": "You already own this agent",
    "agentDetail.alreadyOwnedDescription": "Continue using it from My Agents section.",
    "agentDetail.goToMyAgents": "Go to My Agents",
    
    // Agent Start Page
    "agentStart.title": "Login",
    "agentStart.description": "agent to use it, you need to login first.",
    "agentStart.whyLogin": "Why should I login?",
    "agentStart.loginReason1": "We can track your agent usage",
    "agentStart.loginReason2": "Secure and personalized experience",
    "agentStart.loginReason3": "You can see your usage history",
    "agentStart.googleLogin": "Login with Google",
    
    // Gmail Agent Usage
    "gmail.title": "Gmail Agent Usage",
    "gmail.loginRequired": "You need to login to use this feature.",
    "gmail.connectAccount": "Connect My Gmail Account",
    "gmail.getEmails": "Get Last 10 Emails and Summarize",
    "gmail.loading": "Loading Emails and AI Summarizing...",
    "gmail.aiFeature": "AI Summarization Feature",
    "gmail.aiFeature1": "AI summary is created for each email",
    "gmail.aiFeature2": "Processed gradually due to rate limits (2 second intervals)",
    "gmail.aiFeature3": "Turkish, short and concise summaries",
    "gmail.aiFeature4": "Google Gemini 2.0 Flash model is used",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error Occurred",
    "common.try_again": "Try Again",
    "common.back_home": "Back to Home",
    
    // Footer
    "footer.platform": "Platform",
    "footer.support": "Support",
    "footer.help": "Help Center",
    "footer.docs": "Documentation",
    "footer.contact": "Contact",
    "footer.community": "Community",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.cookies": "Cookies",
    "footer.rights": "© 2025 Agent Magnet. All rights reserved."
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      return (saved as Language) || "tr";
    }
    return "tr";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
  };

  const getCategoryMapping = (category: string) => {
    const mapping = {
      "Yazım": { tr: "Yazım", en: "Writing" },
      "Görsel": { tr: "Görsel", en: "Visual" },
      "Ses": { tr: "Ses", en: "Audio" },
      "Analiz": { tr: "Analiz", en: "Analysis" },
      "Sohbet": { tr: "Sohbet", en: "Chat" },
      "Kod": { tr: "Kod", en: "Code" },
      "Dil": { tr: "Dil", en: "Language" },
      "Pazarlama": { tr: "Pazarlama", en: "Marketing" }
    };
    
    // Find the category by checking both tr and en values
    const entry = Object.entries(mapping).find(([key, value]) => 
      value.tr === category || value.en === category || key === category
    );
    
    return entry ? entry[1][language] : category;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, getCategoryMapping }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}