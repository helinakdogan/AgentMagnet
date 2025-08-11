import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Code, Upload, Users, TrendingUp, Globe, Shield, Zap, Star } from "lucide-react";

export default function Developer() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: <Globe className="w-8 h-8 text-white" />,
      title: t("developer.benefits.global.title"),
      description: t("developer.benefits.global.description"),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: t("developer.benefits.revenue.title"),
      description: t("developer.benefits.revenue.description"),
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: t("developer.benefits.community.title"),
      description: t("developer.benefits.community.description"),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: t("developer.benefits.support.title"),
      description: t("developer.benefits.support.description"),
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const features = [
    {
      icon: <Code className="w-6 h-6 text-blue-500" />,
      title: t("developer.features.sdk.title"),
      description: t("developer.features.sdk.description"),
    },
    {
      icon: <Upload className="w-6 h-6 text-green-500" />,
      title: t("developer.features.easyUpload.title"),
      description: t("developer.features.easyUpload.description"),
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      title: t("developer.features.analytics.title"),
      description: t("developer.features.analytics.description"),
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: t("developer.features.marketing.title"),
      description: t("developer.features.marketing.description"),
    },
  ];

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--dark-purple)] mb-4">
            {t("developer.title")} <span className="gradient-text">{t("developer.titleHighlight")}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-normal max-w-3xl mx-auto">
            {t("developer.subtitle")}
          </p>
        </div>

        {/* Coming Soon Banner */}
        <div className="glassmorphic rounded-2xl p-8 shadow-lg text-center border border-white/20 dark:border-white/10 backdrop-blur-sm mb-16">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 gradient-main rounded-2xl flex items-center justify-center">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-[var(--dark-purple)] dark:text-white mb-4">
                {t("developer.comingSoon.title")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                {t("developer.comingSoon.description")}
              </p>
            </div>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdCdA93GhUgRYcDFYaK8mAdGtZt1sfpRRah4d1HatXDksa59g/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center px-1 py-1 rounded-xl group"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
              <div className="relative rounded-xl bg-muted dark:bg-muted px-6 py-3">
                <span className="text-black dark:text-white font-medium">
                  {t("developer.comingSoon.button")}
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[var(--dark-purple)] dark:text-white mb-4">
              {t("developer.benefits.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("developer.benefits.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                                className="group relative glassmorphic rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${benefit.gradient} opacity-5 rounded-full blur-xl animate-pulse`} style={{animationDuration: '4s'}}></div>
                  <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${benefit.gradient} opacity-5 rounded-full blur-xl animate-pulse`} style={{animationDelay: '2s', animationDuration: '4s'}}></div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${benefit.gradient} bg-opacity-10`}>
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--dark-purple)] dark:text-white mb-3 text-center">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[var(--dark-purple)] dark:text-white mb-4">
              {t("developer.features.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("developer.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group glassmorphic rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--dark-purple)] dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}