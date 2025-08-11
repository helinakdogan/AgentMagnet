import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, Mail, Clock, User, Eye, EyeOff, RefreshCw, AlertCircle, X } from 'lucide-react';
import { Link } from 'wouter';
import { Loading } from '@/components/ui/loading';
import { useLanguage } from '@/contexts/LanguageContext';
import { ErrorFallback } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoogleLogin } from "@react-oauth/google";

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
  // Backend'den gelen ek alanlar
  sender?: string;
  from?: string;
  subject?: string;
  content?: string;
  date?: string;
  isUrgent?: boolean;
  isRead?: boolean;
}

interface DailyUsageInfo {
  currentCount: number;
  maxLimit: number;
  remainingCount: number;
  resetDate: string;
}

export default function GmailAgentUsage() {
  const [match, params] = useRoute("/agent/:id/gmail");
  const agentId = params?.id;
  const { t } = useLanguage();
  const [showSnippets, setShowSnippets] = useState(false);
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // 🆕 İlk yükleme için
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  
  // 🆕 Günlük kullanım bilgisi için state'ler
  const [dailyUsage, setDailyUsage] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [resetDate, setResetDate] = useState<string>('');
  const [limitReached, setLimitReached] = useState(false);
  
  // Sayfa yüklendiğinde localStorage'dan Gmail token'ını al
  useEffect(() => {
    const savedToken = localStorage.getItem('gmailAccessToken');
    if (savedToken) {
      setAccessToken(savedToken);
      console.log('Gmail token loaded from localStorage');
    }
  }, []);

  // 🆕 Sayfa yüklendiğinde günlük kullanım bilgisini getir
  useEffect(() => {
    const fetchInitialUsage = async () => {
      try {
        setInitialLoading(true);
        const userId = localStorage.getItem("userId") || "b682763a-1412-4463-8be5-e01d3a7cb265";
        const response = await fetch('/api/gmail/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            agentId: 'f9774f7a-5267-4154-b3ae-550f04e4572e',
            checkOnly: true // Sadece kullanım bilgisini al
          }),
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data?.dailyUsage) {
            setDailyUsage(data.data.dailyUsage.currentCount);
            setDailyLimit(data.data.dailyUsage.maxLimit);
            setResetDate(data.data.dailyUsage.resetDate);
          }
        }
      } catch (error) {
        console.error('Initial usage fetch failed:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    // Sayfa yüklendiğinde çalıştır
    fetchInitialUsage();
  }, []); // Boş dependency array - sadece bir kez çalışır

  // 🆕 Limit dolunca alert göster
  useEffect(() => {
    if (dailyUsage >= dailyLimit && dailyLimit > 0) {
      // Custom alert
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      alertDiv.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 text-center">
          <div class="text-red-500 text-4xl mb-4">🚫</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Günlük Limit Doldu!</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Bugün maksimum ${dailyLimit} özetleme yapabilirsiniz.<br>
            Yarın tekrar deneyin!
          </p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
            Tamam
          </button>
        </div>
      `;
      document.body.appendChild(alertDiv);
      
      // 5 saniye sonra otomatik kaldır
      setTimeout(() => {
        if (alertDiv.parentElement) {
          alertDiv.remove();
        }
      }, 5000);
    }
  }, [dailyUsage, dailyLimit]);
  
  // 🆕 Token durumunu kontrol et
  useEffect(() => {
    const checkTokenStatus = async () => {
      if (accessToken) {
        try {
          const userId = localStorage.getItem("userId") || "b682763a-1412-4463-8be5-e01d3a7cb265";
          const response = await fetch('/api/gmail/summary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              agentId: 'f9774f7a-5267-4154-b3ae-550f04e4572e', // Database'deki gerçek agent ID
              checkOnly: true // Sadece token durumunu kontrol et
            }),
            credentials: 'include'
          });

          if (response.status === 401) {
            console.log('Token expired detected in status check');
            setTokenExpired(true);
            setAccessToken(null);
            localStorage.removeItem('gmailAccessToken');
          } else if (response.ok) {
            // Token geçerli, expired state'i temizle
            setTokenExpired(false);
          }
        } catch (error) {
          console.error('Token status check failed:', error);
        }
      }
    };

    // Sayfa yüklendiğinde ve accessToken değiştiğinde kontrol et
    checkTokenStatus();
  }, [accessToken]);

  // 🆕 Gmail OAuth login - direkt Gmail API'ye bağlan
  const gmailLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Gmail OAuth success, token:', tokenResponse);
      setAccessToken(tokenResponse.access_token);
      setTokenExpired(false); // Expired state'i temizle
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('gmailAccessToken', tokenResponse.access_token);
      
      // 🆕 Token'ı backend'e kaydet
      try {
        const userId = localStorage.getItem("userId") || "b682763a-1412-4463-8be5-e01d3a7cb265";
        const response = await fetch('/api/gmail/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            agentId: 'f9774f7a-5267-4154-b3ae-550f04e4572e', // Database'deki gerçek agent ID
            accessToken: tokenResponse.access_token,
            refreshToken: (tokenResponse as any).refresh_token || '' // Gmail OAuth'da refresh_token genelde verilmez
          }),
          credentials: 'include'
        });

        if (response.ok) {
          console.log('Gmail token backend\'e kaydedildi');
        } else {
          console.log('Gmail token backend\'e kaydedilemedi');
        }
      } catch (error) {
        console.log('Gmail token kaydetme hatası:', error);
      }
      
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

  // 🆕 Backend API'den mailleri getir ve özetle
  const fetchEmails = async () => {
    if (!accessToken) {
      alert("Önce Gmail hesabınızı bağlayın!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem("userId") || "b682763a-1412-4463-8be5-e01d3a7cb265";
      
      // Backend'deki özetleme API'sini kullan
      const response = await fetch('/api/gmail/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          agentId: 'f9774f7a-5267-4154-b3ae-550f04e4572e', // Database'deki gerçek agent ID
          accessToken // Gmail token'ını backend'e gönder
        }),
        credentials: 'include' // JWT cookie'yi otomatik gönder
      });

      if (!response.ok) {
        if (response.status === 401) {
          setTokenExpired(true);
          setAccessToken(null);
          localStorage.removeItem('gmailAccessToken');
          throw new Error('Gmail bağlantısı süresi dolmuş. Lütfen tekrar bağlanın.');
        } else if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Günlük limit doldu!');
        }
        throw new Error('Backend API hatası: ' + response.statusText);
      }

      const data = await response.json();
      
      if (data.data?.summary && data.data.summary.length > 0) {
        // Backend'den gelen özetlenmiş mailleri kullan
        setEmails(data.data.summary);
        
        // 🆕 Güncel kullanım bilgisini güncelle
        if (data.data.dailyUsage) {
          setDailyUsage(data.data.dailyUsage.currentCount);
          setDailyLimit(data.data.dailyUsage.maxLimit);
          setResetDate(data.data.dailyUsage.resetDate);
        }
      } else {
        setEmails([]);
      }
    } catch (err) {
      console.error('Backend API error:', err);
      setError(err instanceof Error ? err.message : 'Backend API hatası');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Gmail'den gelen tarih formatını parse et
      let date: Date;
      
      if (dateString.includes('GMT') || dateString.includes('UTC')) {
        // RFC 2822 format: "Wed, 11 Aug 2025 10:30:00 +0000 (UTC)"
        date = new Date(dateString);
      } else if (dateString.includes('T')) {
        // ISO format: "2025-08-11T10:30:00.000Z"
        date = new Date(dateString);
      } else {
        // Unix timestamp veya diğer formatlar
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        } else {
          date = new Date(dateString);
        }
      }
      
      // Tarih geçerli mi kontrol et
      if (isNaN(date.getTime())) {
        return 'Tarih bilgisi yok';
      }
      
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Tarih bilgisi yok';
    }
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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[var(--dark-purple)]">
                  {t("gmail.title")}
                </h1>
                <p className="text-[var(--muted-foreground)] text-xs sm:text-sm">
                  {t("gmail.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Token Expired Warning */}
          {tokenExpired && (
            <div className="glassmorphic rounded-xl p-4 mb-4 border-l-4 border-red-500 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 text-sm mb-1">
                    🔐 {t("gmail.connectionExpired")}
                  </h3>
                  <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                    {t("gmail.connectionExpiredDesc")}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {t("gmail.connectionExpiredReason")}
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setTokenExpired(false);
                    gmailLogin();
                  }} 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("gmail.reconnect")}
                </Button>
              </div>
            </div>
          )}


        </div>

        {/* Buttons and Progress Bar - Same Line */}
        <div className="glassmorphic rounded-xl p-4 mb-4 border border-white/10">
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4">
            {/* Sol taraf - Butonlar */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full xl:w-auto">
              {!accessToken ? (
                <div className="relative inline-flex items-center justify-center px-1 py-1 rounded-lg group transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
                  <button
                    onClick={() => gmailLogin()}
                    className="relative rounded-lg bg-[var(--soft-muted)]  px-4 py-2 w-full sm:w-auto"
                  >
                    <span className="text-foreground text-sm font-medium leading-none flex items-center justify-center sm:justify-start">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      {t("gmail.connectGmail")}
                    </span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative inline-flex items-center justify-center px-1 py-1 rounded-lg group transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
                    <button
                      onClick={fetchEmails}
                      disabled={!accessToken || dailyUsage >= dailyLimit}
                      className="relative rounded-lg bg-[var(--soft-muted)]  px-4 py-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-foreground text-sm font-medium leading-none flex items-center justify-center sm:justify-start">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        {t("gmail.getLast10Emails")}
                      </span>
                    </button>
                  </div>
                  
                  <button
                    onClick={disconnectGmail}
                    className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-lg text-sm border w-full sm:w-auto transition-all duration-200"
                  >
                    <span className="flex items-center justify-center sm:justify-start">
                      <X className="w-4 h-4 mr-2 flex-shrink-0" />
                      {t("gmail.disconnect")}
                    </span>
                  </button>
                </>
              )}
              
              <button
                onClick={() => setShowSnippets(!showSnippets)}
                className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 w-full sm:w-auto"
              >
                <span className="flex items-center justify-center sm:justify-start">
                  {showSnippets ? <EyeOff className="w-4 h-4 mr-2 flex-shrink-0" /> : <Eye className="w-4 h-4 mr-2 flex-shrink-0" />}
                  {showSnippets ? t("gmail.hideSnippets") : t("gmail.showSnippets")}
                </span>
              </button>
            </div>

            {/* Sağ taraf - Progress Bar ve Bilgiler */}
            <div className="flex-1 min-w-0 w-full xl:w-auto">
              {initialLoading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">{t("common.loading")}</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Progress Bar ve Metin */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <span className="text-sm text-[var(--foreground)]">
                        {t("gmail.dailyUsageText").replace('{used}', dailyUsage.toString()).replace('{total}', dailyLimit.toString())}
                      </span>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        • {t("gmail.reset")}: {resetDate ? new Date(resetDate).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit'
                        }) : '--'}
                        {resetDate && (
                          <span className="ml-1 text-blue-400">
                            ({(() => {
                              const now = new Date();
                              const reset = new Date(resetDate);
                              const diffTime = reset.getTime() - now.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              if (diffDays === 1) return t("common.tomorrow");
                              if (diffDays === 0) return t("common.today");
                              return `${diffDays}${t("common.days")}`;
                            })()})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(dailyUsage / dailyLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Kalan hak */}
                  <div className="text-center sm:text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {dailyLimit - dailyUsage}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {t("gmail.remaining")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Uyarı mesajları - Alt kısımda */}
          {dailyLimit - dailyUsage <= 1 && dailyLimit - dailyUsage > 0 && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t("gmail.lastRightsRemaining").replace('{count}', (dailyLimit - dailyUsage).toString())}
                </span>
              </div>
            </div>
          )}

          {dailyUsage >= dailyLimit && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t("gmail.dailyLimitReached")}
                </span>
              </div>
            </div>
          )}
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
            {emails.map((email, index) => (
              <div key={index} className="glassmorphic rounded-xl p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[var(--foreground)] text-sm truncate">
                      {email.sender || email.from || 'Bilinmeyen Gönderen'}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] truncate">
                      {email.subject || 'Konu Yok'}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      {email.snippet || email.content || 'İçerik yok'}
                    </div>
                    {email.date && (
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">
                        {formatDate(email.date)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {email.isUrgent && (
                      <div className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full">
                        ⚠️ Acil
                      </div>
                    )}
                    {email.isRead === false && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
              <div className="relative rounded-lg bg-white dark:bg-[var(--soft-muted)]  px-4 py-2">
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
              <div className="relative rounded-lg bg-white dark:bg-[var(--soft-muted)] px-4 py-2">
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