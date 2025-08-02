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
            <Loading size="lg" text="Agentlarınız yükleniyor..." />
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
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Hata Oluştu</h2>
            <p className="text-gray-600 mb-8">Agentlarınız yüklenirken bir hata oluştu.</p>
            <Button onClick={() => window.location.reload()}>
              Tekrar Dene
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
              Henüz Agent Satın Almadınız
            </h2>
            <p className="text-gray-600 mb-8">
              Agent mağazasından agent satın alarak başlayın.
            </p>
            <Button 
              onClick={() => setLocation('/agents')}
              size="lg"
              className="px-8 py-4 text-lg"
            >
              Agent Mağazasına Git
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
          <p className="text-gray-600 text-lg">
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
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Agent Description */}
                <p className="text-gray-600 text-sm">
                  Gmail entegrasyonu ile e-postalarınızı yönetin
                </p>

                {/* Usage Stats */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Kullanım Sayısı:</span>
                    <span className="font-semibold text-[var(--dark-purple)]">
                      {userAgent.usageCount || 0}
                    </span>
                  </div>
                  {userAgent.lastUsed && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Son Kullanım:</span>
                      <span className="text-gray-500">
                        {new Date(userAgent.lastUsed).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setLocation(`/agent/${userAgent.agentId}/gmail`)}
                    className="flex-1"
                    size="sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {t("myAgents.useGmail")}
                  </Button>
                  
                  <Button
                    onClick={() => setLocation(`/agent/${userAgent.agentId}/usage`)}
                    variant="outline"
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Purchase Date */}
                <div className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Satın alınma: {userAgent.createdAt ? new Date(userAgent.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
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
            Daha Fazla Agent Satın Al
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyAgents; 