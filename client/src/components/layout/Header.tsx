import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleMagnetHover = (isHovering: boolean) => {
    const dots = document.querySelectorAll('.magnet-dots .magnetic-dot');
    dots.forEach((dot, index) => {
      const delay = index * 100;
      setTimeout(() => {
        if (isHovering) {
          (dot as HTMLElement).style.transform = `scale(1.5) translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
          (dot as HTMLElement).style.opacity = '0.8';
        } else {
          (dot as HTMLElement).style.transform = '';
          (dot as HTMLElement).style.opacity = '';
        }
      }, delay);
    });
  };

  return (
    <header className="sticky top-0 z-50 glassmorphic-menu border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo with Interactive Magnet */}
          <Link href="/">
            <div 
              className="flex items-center space-x-3 group cursor-pointer magnet-logo"
              onMouseEnter={() => handleMagnetHover(true)}
              onMouseLeave={() => handleMagnetHover(false)}
            >
              <div className="relative">
                {/* Magnet Icon */}
                <div className="w-8 h-8 gradient-main rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 3v5c0 2.76 2.24 5 5 5s5-2.24 5-5V3h2v5c0 3.87-3.13 7-7 7s-7-3.13-7-7V3h2zm10 0v5c0 1.66-1.34 3-3 3s-3-1.34-3-3V3h6z"/>
                  </svg>
                </div>
                {/* Interactive Dots around Magnet */}
                <div className="magnet-dots">
                  <div className="absolute -top-2 -left-2 w-1 h-1 bg-purple-400 rounded-full magnetic-dot transition-all duration-300"></div>
                  <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-pink-400 rounded-full magnetic-dot transition-all duration-300"></div>
                  <div className="absolute -bottom-2 left-0 w-1 h-1 bg-blue-400 rounded-full magnetic-dot transition-all duration-300"></div>
                  <div className="absolute -bottom-1 -right-2 w-1 h-1 bg-purple-300 rounded-full magnetic-dot transition-all duration-300"></div>
                </div>
              </div>
              <span className="text-xl font-semibold tracking-tight text-[var(--dark-purple)]">Agent Magnet</span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Navigation />
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <button className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-[var(--dark-purple)] transition-colors">
              Giriş Yap
            </button>
            <button className="btn-black text-sm">
              Kayıt Ol
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glassmorphic rounded-xl shadow-md mt-2 mb-4">
            <div className="px-4 py-6">
              <div className="flex flex-col space-y-4">
                <Navigation isMobile={true} onItemClick={() => setIsMobileMenuOpen(false)} />
                <div className="pt-4 border-t border-white/10">
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 mb-2">Giriş Yap</button>
                  <button className="w-full btn-black text-sm">Kayıt Ol</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
