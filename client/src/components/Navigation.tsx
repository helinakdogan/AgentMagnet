import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavigationItem {
  key: string;
  href: string;
  external?: boolean;
}

interface NavigationProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

const navigationItems: NavigationItem[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.agents", href: "/agents" },
  { key: "nav.myAgents", href: "/my-agents" },
  { key: "nav.pricing", href: "/pricing" },
  { key: "nav.developer", href: "/developer" },
];

export default function Navigation({ isMobile = false, onItemClick }: NavigationProps) {
  const [location] = useLocation();
  const { t } = useLanguage();

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  const getItemClassName = (href: string) => {
    const isActive = location === href;
    const baseClass = `font-medium transition-colors ${
      isMobile ? "block py-2" : ""
    }`;
    
    if (isActive) {
      return `${baseClass} text-[var(--dark-purple)] gradient-text`;
    }
    
    return `${baseClass} text-gray-700 hover:text-[var(--dark-purple)]`;
  };

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-2">
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={getItemClassName(item.href)} onClick={handleItemClick}>
              {t(item.key)}
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-8">
      {navigationItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <div className={getItemClassName(item.href)} onClick={handleItemClick}>
            {t(item.key)}
          </div>
        </Link>
      ))}
    </div>
  );
}

export { navigationItems };
export type { NavigationItem };