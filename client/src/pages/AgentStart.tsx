import { useParams, useLocation } from "wouter";
import { LogIn } from "lucide-react";
import { FC, useState, useEffect } from "react";
import { useAgent } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useGoogleLogin } from "@react-oauth/google";
import { useLanguage } from '@/contexts/LanguageContext';

const AgentStart: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const { t } = useLanguage();
  
  const { data: agent, isLoading: agentLoading } = useAgent(id || '');
  
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

  // Check if user is authenticated and update step accordingly
  useEffect(() => {
    if (user) {
      // Kullanıcı giriş yaptıysa, AgentDetail sayfasına yönlendir
      setLocation(`/agent/${id}`);
    }
  }, [user, id, setLocation]);

  // Google OAuth login for website authentication
  const websiteLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google OAuth success, token:', tokenResponse);
      
      try {
        // Proxy kullandığımız için /api ile başlayan endpoint'i kullan
        const response = await fetch('/api/auth/google/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Google OAuth success, data:', data);
              
          // Set user directly
          setUser(data.data);
          console.log('User set:', data.data);
          
          // Store user data in localStorage for other pages
          localStorage.setItem('userData', JSON.stringify(data.data));
          
          // Trigger custom event for other components
          window.dispatchEvent(new Event('userDataChanged'));
        } else {
          console.log('Backend response not ok');
          alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
        }
      } catch (error) {
        console.error('Google OAuth error:', error);
        alert("Giriş sırasında hata oluştu.");
      }
    },
    onError: () => {
      console.log('Google OAuth failed');
      alert("Giriş başarısız oldu. Lütfen tekrar deneyin.");
    },
  });

  const handleLogin = () => {
    console.log('handleLogin called!');
    websiteLogin();
  };

  if (agentLoading) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loading size="lg" />
            <p className="mt-4 text-gray-600">Agent bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Agent Bulunamadı</h2>
            <p className="text-gray-600 mb-8">İstediğiniz agent mevcut değil.</p>
            <Button onClick={() => setLocation('/agents')}>
              Agent Mağazasına Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glassmorphic rounded-2xl p-8 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-semibold text-[var(--dark-purple)] mb-4">
                     {t("agentStart.title")}
              </CardTitle>
              <p className="text-gray-600">
                     {agent?.name} {t("agentStart.description")}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                     <h3 className="font-semibold text-blue-900 mb-2">{t("agentStart.whyLogin")}</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                       <li>• {t("agentStart.loginReason1")}</li>
                       <li>• {t("agentStart.loginReason2")}</li>
                       <li>• {t("agentStart.loginReason3")}</li>
                </ul>
              </div>

              <Button
                onClick={handleLogin}
                size="lg"
                className="w-full px-8 py-4 text-lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
              {t("agentStart.googleLogin")}
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default AgentStart;