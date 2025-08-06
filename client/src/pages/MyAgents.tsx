import React, { FC, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Mail, ExternalLink, Calendar, BarChart3 } from "lucide-react";
import { useUserAgents } from '@/hooks/use-api';
import { useLanguage } from '@/contexts/LanguageContext';

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
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-[var(--dark-purple)] mb-4">
              {t("myAgents.noAgentsTitle")}
            </h2>
            <p className="text-gray-600 mb-8">
              {t("myAgents.noAgentsDescription")}
            </p>
            <Button 
              onClick={() => setLocation('/agents')}
              size="lg"
              className="px-8 py-4 text-lg"
            >
              {t("myAgents.goToStore")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--dark-purple)] mb-4">
            {t("myAgents.title")}
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg">
            {t("myAgents.description")}
          </p>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAgents.map((userAgent) => (
            <Card key={userAgent.id} className="glassmorphic rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-[var(--dark-purple)]">
                    {t("myAgents.gmailAgent")}
                  </CardTitle>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Agent Description */}
                <p className="text-[var(--muted-foreground)] text-sm">
                  {t("myAgents.gmailDescription")}
                </p>

             

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLocation(`/agent/${userAgent.agentId}/gmail`)}
                    className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors"
                    size="sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {t("myAgents.useAgent")}
                  </Button>
                  
                 
                </div>

               
              </CardContent>
            </Card>
          ))}
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