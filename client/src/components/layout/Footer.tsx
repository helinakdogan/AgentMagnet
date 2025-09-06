import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Logo from "@/assets/agentmagnetlogolight.png";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[var(--purplish-black)] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src={Logo} alt="Agent Magnet Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <span className="text-xl font-semibold">Agent Magnet</span>
            </div>
            <p className="text-gray-300 font-normal mb-6 max-w-md">
              Yapay zeka ajanlarının gücünü keşfedin. İş süreçlerinizi otomatikleştirin, 
              verimliliğinizi artırın ve dijital dönüşümünüzü hızlandırın.
            </p>
            <div className="flex space-x-4">
             <a href="https://www.instagram.com/agentmagnetai/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-.88a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76Z" />
  </svg>
</a>

             
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t("footer.platform")}</h4>
            <div className="space-y-4">
              <Link href="/" className="block text-gray-300 hover:text-white font-normal transition-colors">{t("nav.home")}</Link>
              <Link href="/agents" className="block text-gray-300 hover:text-white font-normal transition-colors">{t("nav.agents")}</Link>
              <Link href="/pricing" className="block text-gray-300 hover:text-white font-normal transition-colors">{t("nav.pricing")}</Link>
              <Link href="/developer" className="block text-gray-300 hover:text-white font-normal transition-colors">{t("nav.developer")}</Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">{t("footer.support")}</h4>
            <div className="space-y-4">
              <button className="block text-gray-300 hover:text-white font-normal transition-colors text-left">{t("footer.help")}</button>
              <button className="block text-gray-300 hover:text-white font-normal transition-colors text-left">{t("footer.docs")}</button>
              <button className="block text-gray-300 hover:text-white font-normal transition-colors text-left">{t("footer.contact")}</button>
              <button className="block text-gray-300 hover:text-white font-normal transition-colors text-left">{t("footer.community")}</button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 font-normal text-sm">
              {t("footer.rights")}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button className="text-gray-400 hover:text-white text-sm font-normal transition-colors">{t("footer.privacy")}</button>
              <button className="text-gray-400 hover:text-white text-sm font-normal transition-colors">{t("footer.terms")}</button>
              <button className="text-gray-400 hover:text-white text-sm font-normal transition-colors">{t("footer.cookies")}</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
