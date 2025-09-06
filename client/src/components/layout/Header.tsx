import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import Logo from "@/assets/agentmagnetlogolight.png";
import { useGoogleLogin } from "@react-oauth/google";
import BasicButton from "../ui/basic-button";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useLanguage();
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

    // Custom event listener for localStorage changes
    window.addEventListener('userDataChanged', handleStorageChange);
    return () => window.removeEventListener('userDataChanged', handleStorageChange);
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Production'da tam backend URL kullan, development'ta proxy kullan
        const apiUrl = import.meta.env.DEV 
          ? '/api/auth/google/token'  // Development: Vite proxy
          : 'https://agent-magnet-backend.onrender.com/api/auth/google/token'; // Production: Backend URL
        
        console.log('Making request to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
            refresh_token: (tokenResponse as any).refresh_token || null, // ✅ Refresh token ekle
            expires_in: (tokenResponse as any).expires_in || 3600,     // ✅ Token süresi ekle
          }),
          credentials: 'include', // Include cookies for CORS
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
          console.error('Login failed:', response.status, response.statusText);
          const errorData = await response.text();
          console.error('Error response:', errorData);
          alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
        }
      } catch (error) {
        console.error('Login error:', error);
        alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      alert("Google girişi başarısız oldu");
    },
  });

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userData');
    
    // Trigger custom event for other components
    window.dispatchEvent(new Event('userDataChanged'));
    console.log('User logged out');
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="sticky top-0 z-50 glassmorphic-menu border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 group cursor-pointer magnet-logo">
              <div className="relative">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src={Logo} alt="Agent Magnet Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <span className="text-xl font-semibold tracking-tight text-[var(--dark-purple)] dark:text-white">Agent Magnet</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Navigation />
          </div>

          <div className="flex items-center space-x-3">
  <LanguageToggle />
  {!user ? (
    <BasicButton
      onClick={() => login()}
      className="text-xs py-1"
      >
      {t("header.login")}
    </BasicButton>
  ) : (
    <div className="flex items-center space-x-2">
      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white shadow" />
      <span className="text-sm font-medium text-purple hidden sm:inline">
        {user.name.split(" ")[0]}
      </span>
      <BasicButton
        onClick={logout}
        className="text-xs py-1"
      >
        {t("header.logout")}
      </BasicButton>
    </div>
  )}
</div>

          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {isMobileMenuOpen && (
          <div className="md:hidden glassmorphic rounded-xl shadow-md mt-2 mb-4">
            <div className="px-4 py-6">
              <div className="flex flex-col space-y-4">
                <Navigation isMobile={true} onItemClick={() => setIsMobileMenuOpen(false)} />
                <div className="pt-4 border-t border-white/10">
  {!user ? (
    <BasicButton
      onClick={() => login()}
      className="w-full text-sm"
    >
      {t("header.login")}
    </BasicButton>
  ) : (
    <BasicButton
      onClick={logout}
      className="w-full text-sm btn-outline"
    >
      {t("header.logout")}
    </BasicButton>
  )}
</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
