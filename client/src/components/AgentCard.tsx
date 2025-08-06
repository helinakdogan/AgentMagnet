import { Link } from "wouter";
import { Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Agent } from "@/lib/api";

interface AgentCardProps {
  agent: Agent;
}

const getIconColorClasses = (iconColor: string) => {
  switch (iconColor) {
    case "blue-purple":
      return "from-blue-500 to-purple-600";
    case "pink-orange":
      return "from-pink-500 to-orange-500";
    case "green-teal":
      return "from-green-500 to-teal-600";
    case "indigo-purple":
      return "from-indigo-500 to-purple-600";
    case "red-pink":
      return "from-red-500 to-pink-600";
    case "yellow-orange":
      return "from-yellow-500 to-orange-600";
    case "cyan-blue":
      return "from-cyan-500 to-blue-600";
    case "violet-purple":
      return "from-violet-500 to-purple-600";
    default:
      return "from-blue-500 to-purple-600";
  }
};

const getStatusLabel = (status: string, t: any) => {
  switch (status) {
    case "active":
      return { text: t("status.active"), color: "text-green-600 bg-green-100" };
    case "popular":
      return { text: t("status.popular"), color: "text-yellow-600 bg-yellow-100" };
    case "new":
      return { text: t("status.new"), color: "text-green-600 bg-green-100" };
    case "trend":
      return { text: t("status.trend"), color: "text-blue-600 bg-blue-100" };
    case "pro":
      return { text: t("status.pro"), color: "text-purple-600 bg-purple-100" };
    case "automatic":
      return { text: t("status.automatic"), color: "text-orange-600 bg-orange-100" };
    default:
      return { text: t("status.active"), color: "text-green-600 bg-green-100" };
  }
};

const getCategoryIcon = (category: string, agentName: string) => {
  // Gmail agent için özel kontrol - kategoriden bağımsız olarak Mail iconu göster
  if (agentName.toLowerCase().includes('gmail')) {
    return <Mail className="w-6 h-6 text-white" />;
  }

  switch (category.toLowerCase()) {
    case "yazım":
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    case "görsel":
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "ses":
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      );
    case "analiz":
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "sohbet":
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "kod":
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case "dil":
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      );
    case "pazarlama":
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "gmail":
    case "email":
    case "e-posta":
      return <Mail className="w-6 h-6 text-white" />;
    default:
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
};

export default function AgentCard({ agent }: AgentCardProps) {
  const { t, getCategoryMapping } = useLanguage();
  const statusLabel = getStatusLabel(agent.status, t);
  const iconColorClasses = getIconColorClasses(agent.iconColor);

  return (
    <Link href={`/agent/${agent.id}`}>
      <div className="agent-card-hover glassmorphic rounded-xl p-6 group cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${iconColorClasses} rounded-xl flex items-center justify-center shadow-lg`}>
            {getCategoryIcon(agent.category, agent.name)}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusLabel.color}`}>
            {statusLabel.text}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-[var(--dark-purple)] dark:text-white mb-2">{agent.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-normal">{agent.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{getCategoryMapping(agent.category)}</span>
          <span className="text-lg font-semibold text-[var(--dark-purple)] dark:text-white">₺{agent.price}{t("pricing.monthly")}</span>
        </div>
      </div>
    </Link>
  );
}
