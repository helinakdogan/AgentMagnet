import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "tr" ? "en" : "tr");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-lg glassmorphic hover:bg-white/20 dark:hover:bg-black/20 transition-colors flex items-center space-x-1"
      aria-label={`Switch to ${language === "tr" ? "English" : "Turkish"}`}
    >
      <Globe className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
        {language === "tr" ? "EN" : "TR"}
      </span>
    </button>
  );
}