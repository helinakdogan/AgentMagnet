import React, { FC, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Mail, ExternalLink, Calendar, BarChart3, MessageCircle, Zap } from "lucide-react";
import { useUserAgents } from '@/hooks/use-api';
import { useLanguage } from '@/contexts/LanguageContext';
import HighlightButton from '@/components/ui/highlight-button';
import BasicButton from '@/components/ui/basic-button';

const MyAgents: FC = () => {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  // Sayfa yüklendiğinde localStorage'dan user bilgisini al
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

    // Add myagents-page class to body when component mounts
    useEffect(() => {
      document.body.classList.add('myagents-page');
      return () => {
        document.body.classList.remove('myagents-page');
      };
    }, []);

  // localStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    // Custom event listener for localStorage changes
    window.addEventListener('userDataChanged', handleStorageChange);
    return () => window.removeEventListener('userDataChanged', handleStorageChange);
  }, []);

  const { data: userAgents, isLoading, error } = useUserAgents(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loading size="lg" text={t("myAgents.loading")} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">{t("myAgents.errorTitle")}</h2>
            <p className="text-gray-600 mb-8">{t("myAgents.errorDescription")}</p>
            <Button onClick={() => window.location.reload()}>
              {t("myAgents.tryAgain")}
            </Button>
          </div>
        </div>
      </div>
      
    );
  }

  if (!userAgents || userAgents.length === 0) {
    return (
      <>
        {/* 3D Background */}
        <div className="myagents-3d-bg fixed inset-0 pointer-events-none z-0"></div>
        
        <div className="relative z-10 min-h-screen flex pt-48 justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h2 className="text-4xl font-normal text-[var(--dark-purple)] mb-2">
              {t("myAgents.noAgentsTitle")}
            </h2>
            <p className="text-gray-400 mb-8 font-light text-lg">
              {t("myAgents.noAgentsDescription")}
            </p>
            <BasicButton
              onClick={() => setLocation('/agents')}
              className="px-6 py-2 text-lg"
            >
              {t("myAgents.goToStore")}
            </BasicButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
       
                {/* Header */}
                <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[var(--dark-purple)] dark:text-white mb-4">
          <span className="gradient-text">{t("myAgents.title")} </span> 
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-light max-w-3xl">
          {t("myAgents.description")}
          </p>
        </div>

        

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAgents.map((userAgent) => {
            // Agent tipine göre render et
            const getAgentConfig = (userAgent: any) => {
              const agentId = userAgent.agentId;
              const agentName = userAgent.agentName;
            
              // Agent name'e göre kontrol et
              if (agentName && agentName.toLowerCase().includes('whatsapp')) {
                return {
                  title: agentName || t("myAgents.whatsappAgent"),
                  description: userAgent.agentDescription || t("myAgents.whatsappDescription"),
                  icon: <Zap className="w-6 h-6 text-white" />,
                  iconBg: "from-green-500 to-emerald-600",
                  route: `/agent/${userAgent.agentId}/whatsapp`
                };
              } else if (agentName && agentName.toLowerCase().includes('gmail')) {
                return {
                  title: agentName || t("myAgents.gmailAgent"),
                  description: userAgent.agentDescription || t("myAgents.gmailDescription"),
                  icon: <Mail className="w-6 h-6 text-white" />,
                  iconBg: "from-blue-500 to-purple-600",
                  route: `/agent/${userAgent.agentId}/gmail`
                };
              } else {
                // Default Gmail agent
                return {
                  title: agentName || t("myAgents.gmailAgent"),
                  description: userAgent.agentDescription || t("myAgents.gmailDescription"),
                  icon: <Mail className="w-6 h-6 text-white" />,
                  iconBg: "from-blue-500 to-purple-600",
                  route: `/agent/${userAgent.agentId}/gmail`
                };
              }
            };

            const agentConfig = getAgentConfig(userAgent);

            return (
              <Card key={userAgent.id} className="glassmorphic rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${agentConfig.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                      {agentConfig.icon}
                    </div>
                    <CardTitle className="text-xl font-normal text-[var(--dark-purple)]">
                      {agentConfig.title}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Agent Description */}
                  <p className="text-[var(--muted-foreground)] font-light text-sm">
                    {agentConfig.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setLocation(agentConfig.route)}
                      className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors"
                      size="sm"
                    >
                     
                      {t("myAgents.useAgent")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back to Store */}
        <div className="text-center mt-12">
          <Button
            onClick={() => setLocation('/agents')}
            variant="outline"
            size="lg"
            className="px-8 py-4"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            {t("myAgents.buyMoreAgents")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyAgents;