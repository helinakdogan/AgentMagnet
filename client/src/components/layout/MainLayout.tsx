import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MagneticDots from "../MagneticDots";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen">
      {/* Global gradient background behind header */}
      <div className="hero-magnetic-global-bg"></div>
      <MagneticDots />
      <div className="relative z-10">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
