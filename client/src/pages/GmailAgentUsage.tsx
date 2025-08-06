import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, Mail, Clock, User, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { Loading } from '@/components/ui/loading';
import { ErrorFallback } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoogleLogin } from "@react-oauth/google";
import { useLanguage } from '@/contexts/LanguageContext';

interface GmailEmail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
    };
    parts?: Array<{
      headers: Array<{
        name: string;
        value: string;
      }>;
      body: {
        data?: string;
      };
    }>;
  };
  sizeEstimate: number;
  summary?: string;
}

export default function GmailAgentUsage() {
  const [match, params] = useRoute("/agent/:id/gmail");
  const agentId = params?.id;
  const { t } = useLanguage();
  const [showSnippets, setShowSnippets] = useState(false);
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  
  // Sayfa yüklendiğinde localStorage'dan Gmail token'ını al
  useEffect(() => {
    const savedToken = localStorage.getItem('gmailAccessToken');
    if (savedToken) {
      setAccessToken(savedToken);
      console.log('Gmail token loaded from localStorage');
    }
  }, []);
  
  // Gmail OAuth login - direkt Gmail API'ye bağlan
  const gmailLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Gmail OAuth success, token:', tokenResponse);
      setAccessToken(tokenResponse.access_token);
      setTokenExpired(false);
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('gmailAccessToken', tokenResponse.access_token);
      
      alert("Gmail bağlantısı başarılı! Artık maillerinizi getirebilirsiniz.");
    },
    onError: () => {
      console.log('Gmail OAuth failed');
      alert("Gmail bağlantısı başarısız oldu. Lütfen tekrar deneyin.");
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
  });

  // Gmail bağlantısını kes
  const disconnectGmail = () => {
    setAccessToken(null);
    setTokenExpired(false);
    localStorage.removeItem('gmailAccessToken');
    setEmails([]);
    alert("Gmail bağlantısı kesildi.");
  };

  // Direkt Gmail API'den mailleri getir
  const fetchEmails = async () => {
    if (!accessToken) {
      alert("Önce Gmail hesabınızı bağlayın!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Gmail API'den son 10 maili getir
      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired
          setTokenExpired(true);
          setAccessToken(null);
          localStorage.removeItem('gmailAccessToken');
          throw new Error('Gmail bağlantısı süresi dolmuş. Lütfen tekrar bağlanın.');
        }
        throw new Error('Gmail API hatası: ' + response.statusText);
      }

      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        // Her mail için detay bilgilerini getir
        const emailPromises = data.messages.map(async (message: any) => {
          const emailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            return emailData;
          }
          return null;
        });

        const emailDetails = await Promise.all(emailPromises);
        const validEmails = emailDetails.filter(email => email !== null);
        
        setEmails(validEmails);
      } else {
        setEmails([]);
      }
    } catch (err) {
      console.error('Gmail API error:', err);
      setError(err instanceof Error ? err.message : 'Gmail API hatası');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const extractEmailFromSender = (sender: string) => {
    const emailMatch = sender.match(/<(.+?)>/);
    return emailMatch ? emailMatch[1] : sender;
  };

  const getHeaderValue = (headers: Array<{ name: string; value: string }>, name: string) => {
    const header = headers.find(h => h.name === name);
    return header ? header.value : '';
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-[var(--light-gray)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/my-agents">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[var(--dark-purple)]">
                  Gmail Agent
                </h1>
                <p className="text-[var(--muted-foreground)] text-xs sm:text-sm">
                  {t("gmail.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Token Expired Warning */}
          {tokenExpired && (
            <div className="glassmorphic rounded-xl p-3 mb-4 border-l-4 border-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">
                    Gmail Bağlantısı Süresi Dolmuş
                  </h3>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Maillerinizi görüntülemek için tekrar bağlanmanız gerekiyor.
                  </p>
                </div>
                <Button 
                  onClick={() => gmailLogin()} 
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Tekrar Bağlan
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {!accessToken ? (
              <Button 
                onClick={() => gmailLogin()} 
                className="relative inline-flex items-center justify-center px-1 py-1 rounded-lg group transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
                <div className="relative rounded-lg bg-white dark:bg-background px-4 py-2">
                  <span className="text-black dark:text-white text-sm font-medium leading-none flex items-center">
                    <Mail className="w-3 h-3 mr-2" />
                    {t("gmail.connectGmail")}
                  </span>
                </div>
              </Button>
            ) : (
              <>
                <Button 
                  onClick={fetchEmails} 
                  disabled={loading} 
                  className="relative inline-flex items-center justify-center px-1 py-1 rounded-lg group transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
                  <div className="relative rounded-lg bg-white dark:bg-background px-4 py-2">
                    <span className="text-black dark:text-white text-sm font-medium leading-none flex items-center">
                      <Mail className="w-3 h-3 mr-2" />
                      {loading ? t("gmail.loading") : t("gmail.getEmails")}
                    </span>
                  </div>
                </Button>
                
                <Button 
                  onClick={disconnectGmail} 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-lg text-sm"
                >
                  {t("gmail.disconnect")}
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowSnippets(!showSnippets)}
              className="px-4 py-2 rounded-lg text-sm"
            >
              {showSnippets ? <EyeOff className="w-3 h-3 mr-2" /> : <Eye className="w-3 h-3 mr-2" />}
              {showSnippets ? t("gmail.hideSnippets") : t("gmail.showSnippets")}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glassmorphic rounded-xl p-4 mb-4 border-l-4 border-red-500 bg-red-50/50 dark:bg-red-950/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200 text-sm mb-1">
                  Hata Oluştu
                </h3>
                <p className="text-red-700 dark:text-red-300 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="glassmorphic rounded-xl p-6 text-center">
            <Loading size="lg" text={t("gmail.loadingEmails")} />
          </div>
        )}

        {/* Compact Emails List */}
        {emails.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--dark-purple)]">
                {t("gmail.recentEmails")} ({emails.length})
              </h2>
            </div>
            
            <div className="grid gap-3">
              {emails.map((email) => (
                <div key={email.id} className="glassmorphic rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group">
                  <div className="flex items-start gap-3">
                    {/* Sender Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[var(--foreground)] text-sm truncate">
                            {getHeaderValue(email.payload.headers, 'From')}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)] truncate">
                            {extractEmailFromSender(getHeaderValue(email.payload.headers, 'From'))}
                          </div>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 ml-2">
                          <Clock className="w-3 h-3" />
                          {formatDate(email.internalDate)}
                        </div>
                      </div>
                      
                      {/* Subject */}
                      <h3 className="font-bold text-[var(--dark-purple)] text-sm mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
                        {getHeaderValue(email.payload.headers, 'Subject')}
                      </h3>
                      
                      {/* Snippet */}
                      {showSnippets && email.snippet && (
                        <div className="mb-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm border border-white/20 dark:border-white/10">
                          <p className="text-[var(--foreground)] text-xs leading-relaxed line-clamp-3">{email.snippet}</p>
                        </div>
                      )}
                      
                      {/* AI Summary */}
                      {email.summary && (
                        <div className="p-3 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-xs">{t("gmail.aiSummary")}</h4>
                          </div>
                          <p className="text-blue-800 dark:text-blue-200 text-xs leading-relaxed line-clamp-2">{email.summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Empty State */}
        {!loading && emails.length === 0 && accessToken && (
          <div className="glassmorphic rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[var(--dark-purple)] mb-2">
              {t("gmail.noEmails")}
            </h3>
            <p className="text-[var(--muted-foreground)] mb-4 text-sm">
              {t("gmail.noEmailsDescription")}
            </p>
            <Button 
              onClick={fetchEmails}
              className="relative inline-flex items-center justify-center px-1 py-1 rounded-lg group transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
              <div className="relative rounded-lg bg-white dark:bg-background px-4 py-2">
                <span className="text-black dark:text-white text-sm font-medium leading-none flex items-center">
                  <RefreshCw className="w-3 h-3 mr-2" />
                  {t("gmail.getEmails")}
                </span>
              </div>
            </Button>
          </div>
        )}

        {/* Compact Connect State */}
        {!accessToken && (
          <div className="glassmorphic rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[var(--dark-purple)] mb-2">
              {t("gmail.connectRequired")}
            </h3>
            <p className="text-[var(--muted-foreground)] mb-4 text-sm">
              {t("gmail.connectDescription")}
            </p>
            <Button 
              onClick={() => gmailLogin()} 
              className="relative inline-flex items-center justify-center px-1 py-1 rounded-lg group transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
              <div className="relative rounded-lg bg-white dark:bg-background px-4 py-2">
                <span className="text-black dark:text-white text-sm font-medium leading-none flex items-center">
                  <Mail className="w-3 h-3 mr-2" />
                  {t("gmail.connectGmail")}
                </span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 