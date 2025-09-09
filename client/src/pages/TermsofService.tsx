// pages/TermsOfService.tsx - Tüm textleri font-normal ve white yap
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsOfService() {
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
          <h1 className="text-3xl sm:text-4xl font-normal text-white mb-4">Terms of Service</h1>
          <p className="text-white font-normal">Last updated: August 2025</p>
        </div>

        {/* Content */}
        <div className="glassmorphic rounded-lg shadow-sm p-6 sm:p-8 space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">1. Service Terms</h2>
            <p className="text-white leading-relaxed font-normal">
              By using the Agent Magnet platform, you agree to the following terms. Failure to comply with these terms may result in account suspension or termination.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">2. User Responsibilities</h2>
            <p className="text-white leading-relaxed mb-4 font-normal">
              As users, you must follow these rules:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white ml-4 font-normal">
              <li>Provide accurate and up-to-date information</li>
              <li>Maintain account security</li>
              <li>Create legal content</li>
              <li>Not violate others' rights</li>
              <li>Not share spam or harmful content</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">3. Service Usage</h2>
            <p className="text-white leading-relaxed font-normal">
              You may use our platform for commercial purposes, but you cannot resell or license our services to others.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">4. Payment and Billing</h2>
            <p className="text-white leading-relaxed font-normal">
              You are responsible for payment for our paid services. Prices are announced in advance and changes are notified 30 days prior.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">5. Service Interruptions</h2>
            <p className="text-white leading-relaxed font-normal">
              Temporary service interruptions may occur due to maintenance, updates, or technical issues. We try to provide advance notice for such situations.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">6. Liability Limitations</h2>
            <p className="text-white leading-relaxed font-normal">
              We are not responsible for indirect damages that may arise from the use of our services. Our liability is limited to the amount paid.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">7. Changes</h2>
            <p className="text-white leading-relaxed font-normal">
              We reserve the right to change these terms with prior notice. Continued use of the platform after changes take effect means you accept the new terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-normal mb-4 text-white">8. Contact</h2>
            <p className="text-white leading-relaxed font-normal">
              You can contact us at legal@agentmagnet.com if you have questions about the terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}