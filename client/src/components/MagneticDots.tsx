import { useEffect } from "react";

export default function MagneticDots() {
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Basic magnetic effect for floating dots
      const floatingDots = document.querySelectorAll('.floating-dots .magnetic-dot');
      floatingDots.forEach((dot) => {
        const rect = dot.getBoundingClientRect();
        const dotX = rect.left + rect.width / 2;
        const dotY = rect.top + rect.height / 2;

        const distance = Math.sqrt(Math.pow(mouseX - dotX, 2) + Math.pow(mouseY - dotY, 2));

        if (distance < 150) { // Attraction range
          const force = Math.max(0, (150 - distance) / 150);
          const angle = Math.atan2(mouseY - dotY, mouseX - dotX);
          const moveX = Math.cos(angle) * force * 20;
          const moveY = Math.sin(angle) * force * 20;

          (dot as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + force * 0.5})`;
          (dot as HTMLElement).style.opacity = `${Math.min(1, 0.3 + force * 0.7)}`;
        } else {
          (dot as HTMLElement).style.transform = '';
          (dot as HTMLElement).style.opacity = '';
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden floating-dots">
      <div className="magnetic-dot floating-animation absolute top-20 left-10 w-2 h-2 gradient-main rounded-full opacity-30"></div>
      <div className="magnetic-dot floating-animation absolute top-40 right-20 w-3 h-3 gradient-main rounded-full opacity-20" style={{ animationDelay: '-1s' }}></div>
      <div className="magnetic-dot floating-animation absolute top-60 left-1/4 w-1.5 h-1.5 gradient-main rounded-full opacity-40" style={{ animationDelay: '-2s' }}></div>
      <div className="magnetic-dot floating-animation absolute bottom-40 right-1/3 w-2.5 h-2.5 gradient-main rounded-full opacity-25" style={{ animationDelay: '-3s' }}></div>
      <div className="magnetic-dot floating-animation absolute bottom-20 left-1/2 w-2 h-2 gradient-main rounded-full opacity-35" style={{ animationDelay: '-4s' }}></div>
      <div className="magnetic-dot floating-animation absolute top-1/3 right-10 w-1 h-1 gradient-main rounded-full opacity-50" style={{ animationDelay: '-5s' }}></div>
    </div>
  );
}
