import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import Logo from "@/assets/agentmagnetlogolight.png";
import { useGoogleLogin } from "@react-oauth/google";

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
        const response = await fetch('/api/auth/google/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Google OAuth success, data:', data);
              
          // Set user directly
          setUser(data.data);
          console.log('User set:', data.data);
          
          // Store user data in localStorage for other pages
          localStorage.setItem('userData', JSON.stringify(data.data));
          
          // Trigger custom event for other components
          window.dispatchEvent(new Event('userDataChanged'));
        } else {
          alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
        }
      } catch (error) {
        console.error('Login error:', error);
        alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
      }
    },
    onError: () => alert("Google girişi başarısız oldu"),
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

  const handleMagnetHover = (isHovering: boolean) => {
    const dots = document.querySelectorAll('.magnet-dots .magnetic-dot');
    dots.forEach((dot, index) => {
      const delay = index * 100;
      setTimeout(() => {
        (dot as HTMLElement).style.transform = isHovering
          ? `scale(1.5) translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`
          : '';
        (dot as HTMLElement).style.opacity = isHovering ? '0.8' : '';
      }, delay);
    });
  };

  return (
    <header className="sticky top-0 z-50 glassmorphic-menu border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link href="/">
            <div
              className="flex items-center space-x-3 group cursor-pointer magnet-logo"
              onMouseEnter={() => handleMagnetHover(true)}
              onMouseLeave={() => handleMagnetHover(false)}
            >
              <div className="relative">
                <div className="w-10 h-10 gradient-main rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-7 h-7 rounded-lg overflow-hidden shadow-lg">
                    <img src={Logo} alt="Agent Magnet Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="magnet-dots">
                  <div className="absolute -top-2 -left-2 w-1 h-1 bg-purple-400 rounded-full magnetic-dot" />
                  <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-pink-400 rounded-full magnetic-dot" />
                  <div className="absolute -bottom-2 left-0 w-1 h-1 bg-blue-400 rounded-full magnetic-dot" />
                  <div className="absolute -bottom-1 -right-2 w-1 h-1 bg-purple-300 rounded-full magnetic-dot" />
                </div>
              </div>
              <span className="text-xl font-semibold tracking-tight text-[var(--dark-purple)] dark:text-white">Agent Magnet</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Navigation />
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <LanguageToggle />
            {!user ? (
              <button onClick={() => login()} className="btn-black text-sm">
                {t("header.login")}
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white shadow" />
                <span className="text-sm font-medium text-purple hidden sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                <button onClick={logout} className="btn-black text-sm">{t("header.logout")}</button>
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
                    <button onClick={() => login()} className="w-full btn-black text-sm">
                      {t("header.login")}
                    </button>
                  ) : (
                    <button onClick={logout} className="w-full btn-outline text-sm">{t("header.logout")}</button>
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
