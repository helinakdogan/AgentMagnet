import { useState } from "react";
import { Link } from "wouter";
import { Search, Filter, Grid, List } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAgents } from "@/hooks/use-api";
import { LoadingCard } from "@/components/ui/loading";
import { ErrorFallback } from "@/components/ui/error-boundary";
import type { Agent } from "@/lib/api";

export default function AgentStore() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(t("category.all"));
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"popular" | "price" | "name">("popular");

  const categoryParam = selectedCategory === t("category.all") ? undefined : selectedCategory;
  const { data: agents = [], isLoading, error } = useAgents(categoryParam);

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

  const filteredAgents = agents
    .filter((agent: Agent) => 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((agent: Agent) => {
      if (selectedCategory === t("category.all")) return true;
      
      // Map backend category to current language
      const categoryMapping = {
        "Yazım": { tr: t("category.writing"), en: "Writing" },
        "Görsel": { tr: t("category.visual"), en: "Visual" },
        "Ses": { tr: t("category.audio"), en: "Audio" },
        "Analiz": { tr: t("category.analysis"), en: "Analysis" },
        "Sohbet": { tr: t("category.chat"), en: "Chat" },
        "Kod": { tr: t("category.code"), en: "Code" },
        "Dil": { tr: t("category.language"), en: "Language" },
        "Pazarlama": { tr: t("category.marketing"), en: "Marketing" }
      };
      
      const mappedCategory = categoryMapping[agent.category as keyof typeof categoryMapping];
      return mappedCategory && (mappedCategory.tr === selectedCategory || mappedCategory.en === selectedCategory);
    })
    .sort((a: Agent, b: Agent) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "popular":
        default:
          return 0; // Keep original order for popular
      }
    });

  if (error) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorFallback 
            error={error as Error} 
            resetError={() => window.location.reload()} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--dark-purple)] dark:text-white mb-4">
            {t("store.title")} <span className="gradient-text">{t("store.title.highlight")}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-normal max-w-3xl">
            {t("store.description")}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ajan ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glassmorphic rounded-xl border-0 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "popular" | "price" | "name")}
                className="glassmorphic rounded-xl px-4 py-3 border-0 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="popular">Popülerlik</option>
                <option value="price">Fiyat</option>
                <option value="name">İsim</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex glassmorphic rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid" ? "bg-purple-500 text-white" : "text-gray-600"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list" ? "bg-purple-500 text-white" : "text-gray-600"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-colors ${
                selectedCategory === category
                  ? "bg-[var(--dark-purple)] text-white"
                  : "text-gray-600 glassmorphic hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredAgents.length} ajan bulundu
            {selectedCategory !== "Tümü" && ` "${selectedCategory}" kategorisinde`}
          </p>
        </div>

        {/* Agent Grid/List */}
        {isLoading ? (
          <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 gradient-main rounded-2xl flex items-center justify-center">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-2">
              Ajan bulunamadı
            </h3>
            <p className="text-gray-600 mb-6">
              Arama kriterlerinize uygun ajan bulunamadı. Farklı bir kategori seçin veya arama teriminizi değiştirin.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Tümü");
              }}
              className="btn-black px-6 py-3"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredAgents.map((agent: Agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && filteredAgents.length > 0 && filteredAgents.length >= 12 && (
          <div className="text-center mt-12">
            <button className="px-8 py-4 text-lg font-semibold text-[var(--dark-purple)] glassmorphic rounded-xl hover:bg-gray-50 transition-colors shadow-md">
              Daha Fazla Yükle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}