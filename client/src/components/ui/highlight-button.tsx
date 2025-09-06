import { Link } from "wouter";
import { ReactNode } from "react";

interface HighlightButtonProps {
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function HighlightButton({ 
  href, 
  children, 
  className = "", 
  onClick,
  disabled = false 
}: HighlightButtonProps) {
  const buttonContent = (
    <div 
      className={`relative inline-block rounded-xl px-6 py-2 hover:opacity-80 transition-opacity cursor-pointer text-[var(--dark-purple)] dark:text-white font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{
        background: 'transparent'
      }}
      onClick={disabled ? undefined : onClick}
    >
      {/* Gradient border as pseudo element */}
      <div 
        className="absolute inset-0 rounded-lg -z-10"
        style={{
          background: 'linear-gradient(to right, #ec4899, #a855f7, #3b82f6)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMaskComposite: 'xor',
          padding: '2px'
        }}
      />
      {children}
    </div>
  );

  // If href is provided, wrap with Link, otherwise return button directly
  if (href) {
    return (
      <Link href={href}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}