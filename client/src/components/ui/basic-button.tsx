import { Link } from "wouter";
import { ReactNode } from "react";

interface BasicButtonProps {
  href?: string;
  children: ReactNode;
  className?: string;
  external?: boolean; // External link için
  target?: string;
  rel?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function BasicButton({ 
  href, 
  children, 
  className = "", 
  external = false,
  target,
  rel,
  onClick,
  disabled = false
}: BasicButtonProps) {
  // External link kontrolü - http/https ile başlıyorsa external
  const isExternal = external || (href && href.startsWith('http://')) || (href && href.startsWith('https://'));
  
  // If onClick is provided, render as button
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        disabled={disabled}
        className={`btn-black px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {children}
      </button>
    );
  }
  
  // If href is provided, render as link
  if (href) {
    if (isExternal) {
      return (
        <a
          href={href}
          target={target || "_blank"}
          rel={rel || "noopener noreferrer"}
          className={`btn-black px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href}>
        <button className={`btn-black px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}>
          {children}
        </button>
      </Link>
    );
  }

  // Fallback: render as button without href
  return (
    <button 
      className={`btn-black px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}
    >
      {children}
    </button>
  );
}