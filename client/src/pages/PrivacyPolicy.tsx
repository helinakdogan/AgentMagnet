// pages/PrivacyPolicy.tsx - Tüm textleri font-normal ve white yap
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen glassmorphic py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-white hover:text-gray-300 mb-4 font-normal">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-normal text-white mb-4">Privacy Policy</h1>
          <p className="text-white font-normal">Last updated: August 2025</p>
        </div>

        {/* Content */}
        <div className="glassmorphic rounded-lg shadow-sm p-6 sm:p-8 space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">1. Introduction</h2>
            <p className="text-white leading-relaxed font-normal">
              At Agent Magnet, protecting your privacy is of utmost importance to us. This privacy policy explains how we collect, use, and protect your personal information.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">2. Information We Collect</h2>
            <p className="text-white leading-relaxed mb-4 font-normal">
              We may collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white ml-4 font-normal">
              <li>Name, surname, and email address</li>
              <li>User account information</li>
              <li>Platform usage data</li>
              <li>Contact information</li>
              <li>Payment information (through secure payment providers)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">3. How We Use Information</h2>
            <p className="text-white leading-relaxed font-normal">
              We use the information we collect to improve our services, enhance user experience, provide technical support, and fulfill our legal obligations.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">4. Information Security</h2>
            <p className="text-white leading-relaxed font-normal">
              We implement industry-standard security measures to protect your personal information. Your data is encrypted and stored on secure servers.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">5. Cookies</h2>
            <p className="text-white leading-relaxed font-normal">
              We use cookies on our website to improve user experience. You can manage your cookie settings through your browser.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">6. Contact</h2>
            <p className="text-white leading-relaxed font-normal">
              If you have any questions about our privacy policy, please contact us at privacy@agentmagnet.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}