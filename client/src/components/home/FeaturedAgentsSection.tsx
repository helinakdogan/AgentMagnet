import { useState } from "react";
import { Link } from "wouter";
import AgentCard from "@/components/AgentCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAgents } from "@/hooks/use-api";
import { LoadingCard } from "@/components/ui/loading";
import BasicButton from "@/components/ui/basic-button";
import type { Agent } from "@/lib/api";

export default function FeaturedAgentsSection() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(t("category.all"));

  const categories = [
    t("category.all"), 
    t("category.writing"), 
    t("category.visual"), 
    t("category.audio"), 
    t("category.analysis"), 
    t("category.chat"), 
    t("category.code"), 
    t("category.language"), 
    t("category.marketing")
  ];

  const categoryParam = selectedCategory === t("category.all") ? undefined : selectedCategory;
  const { data: agents = [], isLoading } = useAgents(categoryParam);

  return (
    <section className="py-20 bg-white dark:bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-[var(--dark-purple)] dark:text-white mb-4">
            {t("home.featured.title")}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] font-light max-w-2xl mx-auto">
            En çok tercih edilen yapay zeka ajanlarını keşfedin ve iş akışlarınızı optimize edin.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            selectedCategory === category ? (
              <div key={category} className="inline-block">
                <BasicButton href="#">
                  {category}
                </BasicButton>
              </div>
            ) : (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="text-gray-600 dark:text-gray-600 glassmorphic hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm hover:shadow-md px-6 py-2 font-light rounded-lg transition-all duration-300"
              >
                {category}
              </button>
            )
          ))}
        </div>

        {/* Agent Cards Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-normal text-[var(--dark-purple)] dark:text-white mb-2">
              Bu kategoride ajan bulunamadı
            </h3>
            <p className="text-[var(--muted-foreground)]">
              Lütfen farklı bir kategori seçin veya daha sonra tekrar deneyin.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent: Agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {/* View More Button */}
        {!isLoading && agents.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/agents">
              <button className="text-lg font-normal text-violet-400 hover:text-violet-300 transition-colors duration-300">
                {t("home.view.all")}
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
} 