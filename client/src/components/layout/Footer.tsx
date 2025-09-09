// Footer.tsx - Optimized with English content, no code repetition, responsive
import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Logo from "../../../public/images/agentmagnetlogolight.png";

// Modal content data
const modalContent = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        title: "1. Introduction",
        content: "At Agent Magnet, protecting your privacy is of utmost importance to us. This privacy policy explains how we collect, use, and protect your personal information."
      },
      {
        title: "2. Information We Collect",
        content: "We may collect the following information:",
        list: [
          "Name, surname, and email address",
          "User account information",
          "Platform usage data",
          "Contact information",
          "Payment information (through secure payment providers)"
        ]
      },
      {
        title: "3. How We Use Information",
        content: "We use the information we collect to improve our services, enhance user experience, provide technical support, and fulfill our legal obligations."
      },
      {
        title: "4. Information Security",
        content: "We implement industry-standard security measures to protect your personal information. Your data is encrypted and stored on secure servers."
      },
      {
        title: "5. Cookies",
        content: "We use cookies on our website to improve user experience. You can manage your cookie settings through your browser."
      },
      {
        title: "6. Contact",
        content: "If you have any questions about our privacy policy, please contact us."
      }
    ]
  },
  terms: {
    title: "Terms of Service",
    sections: [
      {
        title: "1. Service Terms",
        content: "By using the Agent Magnet platform, you agree to the following terms. Failure to comply with these terms may result in account suspension or termination."
      },
      {
        title: "2. User Responsibilities",
        content: "As users, you must follow these rules:",
        list: [
          "Provide accurate and up-to-date information",
          "Maintain account security",
          "Create legal content",
          "Not violate others' rights",
          "Not share spam or harmful content"
        ]
      },
      {
        title: "3. Service Usage",
        content: "You may use our platform for commercial purposes, but you cannot resell or license our services to others."
      },
      {
        title: "4. Payment and Billing",
        content: "You are responsible for payment for our paid services. Prices are announced in advance and changes are notified 30 days prior."
      },
      {
        title: "5. Service Interruptions",
        content: "Temporary service interruptions may occur due to maintenance, updates, or technical issues. We try to provide advance notice for such situations."
      },
      {
        title: "6. Liability Limitations",
        content: "We are not responsible for indirect damages that may arise from the use of our services. Our liability is limited to the amount paid."
      },
      {
        title: "7. Changes",
        content: "We reserve the right to change these terms with prior notice. Continued use of the platform after changes take effect means you accept the new terms."
      },
      {
        title: "8. Contact",
        content: "You can contact us if you have questions about the terms of service."
      }
    ]
  }
};

// Reusable Modal Component
const LegalModal = ({ isOpen, onClose, content }: {
  isOpen: boolean;
  onClose: () => void;
  content: typeof modalContent.privacy;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="w-[95vw] glassmorphic backdrop-blur-sm border-white/20 max-w-md rounded-2xl sm:max-w-2xl lg:max-w-4xl max-h-[85vh] overflow-y-auto mx-2 sm:mx-4">
    <DialogHeader>
        <DialogTitle className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          {content.title}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 sm:space-y-6 text-gray-700 dark:text-gray-300">
        {content.sections.map((section, index) => (
          <div key={index}>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
              {section.title}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed mb-2">
              {section.content}
            </p>
            {section.list && (
              <ul className="text-xs sm:text-sm leading-relaxed list-disc list-inside space-y-1 ml-2 sm:ml-4">
                {section.list.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

// Footer.tsx - Privacy Policy link ekle
export default function Footer() {
  const { t } = useLanguage();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-black text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="relative">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                    <img src={Logo} alt="Agent Magnet Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
                <span className="text-lg sm:text-xl font-semibold">Agent Magnet</span>
              </div>
              <p className="text-gray-300 font-normal mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
                Discover the power of AI agents. Automate your business processes, 
                increase your efficiency, and accelerate your digital transformation.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <a href="https://www.instagram.com/agentmagnetai/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-.88a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Platform</h4>
              <div className="space-y-3 sm:space-y-4">
                <Link href="/" className="block text-gray-300 hover:text-white font-normal transition-colors text-sm sm:text-base">{t("nav.home")}</Link>
                <Link href="/agents" className="block text-gray-300 hover:text-white font-normal transition-colors text-sm sm:text-base">{t("nav.agents")}</Link>
                <Link href="/pricing" className="block text-gray-300 hover:text-white font-normal transition-colors text-sm sm:text-base">{t("nav.pricing")}</Link>
                <Link href="/developer" className="block text-gray-300 hover:text-white font-normal transition-colors text-sm sm:text-base">{t("nav.developer")}</Link>
              </div>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Support</h4>
              <div className="space-y-3 sm:space-y-4">
                <button className="block text-gray-300 hover:text-white font-normal transition-colors text-left text-sm sm:text-base">{t("footer.help")}</button>
                <button className="block text-gray-300 hover:text-white font-normal transition-colors text-left text-sm sm:text-base">{t("footer.docs")}</button>
                <button className="block text-gray-300 hover:text-white font-normal transition-colors text-left text-sm sm:text-base">{t("footer.contact")}</button>
                <button className="block text-gray-300 hover:text-white font-normal transition-colors text-left text-sm sm:text-base">{t("footer.community")}</button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <p className="text-gray-400 font-normal text-xs sm:text-sm text-center sm:text-left">
                © 2024 Agent Magnet. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
                <button 
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-gray-400 hover:text-white text-xs sm:text-sm font-normal transition-colors"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-gray-400 hover:text-white text-xs sm:text-sm font-normal transition-colors"
                >
                  Terms of Service
                </button>
                <button className="text-gray-400 hover:text-white text-xs sm:text-sm font-normal transition-colors">{t("footer.cookies")}</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LegalModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
        content={modalContent.privacy} 
      />
      <LegalModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
        content={modalContent.terms} 
      />
    </>
  );
}