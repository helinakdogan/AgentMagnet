import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, Mail, Clock, User, Eye, EyeOff } from 'lucide-react';
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
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gmail API error: ' + response.statusText);
      }

      const data = await response.json();
      const messageIds = data.messages || [];

      // Her mail için detayları getir
      const emailPromises = messageIds.map(async (msg: { id: string }) => {
        const emailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (emailResponse.ok) {
          return await emailResponse.json();
        }
        return null;
      });

      const emailDetails = await Promise.all(emailPromises);
      const validEmails = emailDetails.filter(email => email !== null);

            // E-postaları basit özetle
      const emailsWithSummaries = validEmails.map((email: GmailEmail) => {
        const snippet = email.snippet || '';
        const subject = getHeaderValue(email.payload.headers, 'Subject') || '';
        
        // Basit özet oluştur
        let summary = '';
        if (snippet.length > 0) {
          // İlk 100 karakteri al ve cümle sonunda kes
          const shortSnippet = snippet.substring(0, 100);
          const lastPeriod = shortSnippet.lastIndexOf('.');
          const lastExclamation = shortSnippet.lastIndexOf('!');
          const lastQuestion = shortSnippet.lastIndexOf('?');
          
          const lastEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
          
          if (lastEnd > 50) {
            summary = shortSnippet.substring(0, lastEnd + 1);
          } else {
            summary = shortSnippet + '...';
          }
        } else if (subject.length > 0) {
          summary = `Konu: ${subject}`;
        } else {
          summary = 'Mail içeriği bulunamadı';
        }
        
        return {
          ...email,
          summary: summary
        };
      });

      setEmails(emailsWithSummaries);
      console.log('Emails fetched:', emailsWithSummaries);
    } catch (error) {
      console.error('Fetch emails error:', error);
      setError('Mailler getirilirken hata oluştu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!match || !agentId) {
    return <div>Agent ID gerekli</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleString('tr-TR');
  };

  const extractEmailFromSender = (sender: string) => {
    const emailMatch = sender.match(/<(.+?)>/);
    return emailMatch ? emailMatch[1] : sender;
  };

  const getHeaderValue = (headers: Array<{ name: string; value: string }>, name: string) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  };

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/agent/${agentId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("gmail.backToAgent")}
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--dark-purple)] mb-2">
                {t("gmail.title")}
              </h1>
                             <p className="text-gray-600">
                 {t("gmail.description")}
               </p>
               {accessToken && (
                 <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                   <p className="text-sm text-green-700">
                     ✅ Gmail hesabınız bağlı - Maillerinizi getirebilirsiniz
                   </p>
                 </div>
               )}
            </div>
            
                         <div className="flex gap-4">
               {!accessToken ? (
                 <Button onClick={() => gmailLogin()} className="bg-blue-600 hover:bg-blue-700">
                   <Mail className="w-4 h-4 mr-2" />
                   {t("gmail.connectGmail")}
                 </Button>
               ) : (
                 <>
                   <Button onClick={fetchEmails} disabled={loading} className="bg-green-600 hover:bg-green-700">
                     <Mail className="w-4 h-4 mr-2" />
                     {loading ? t("gmail.loading") : t("gmail.getEmails")}
                   </Button>
                   
                   <Button 
                     onClick={disconnectGmail} 
                     variant="outline" 
                     className="text-red-600 border-red-600 hover:bg-red-50"
                   >
                     Bağlantıyı Kes
                   </Button>
                 </>
               )}
               
               <Button
                 variant="outline"
                 onClick={() => setShowSnippets(!showSnippets)}
               >
                 {showSnippets ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                 {showSnippets ? t("gmail.hideSnippets") : t("gmail.showSnippets")}
               </Button>
             </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Loading size="lg" text={t("gmail.loadingEmails")} />
            </CardContent>
          </Card>
        )}

        {/* Emails List */}
        {emails.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--dark-purple)]">
                {t("gmail.recentEmails")} ({emails.length})
              </h2>
            </div>
            
            {emails.map((email) => (
              <Card key={email.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {getHeaderValue(email.payload.headers, 'From')}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({extractEmailFromSender(getHeaderValue(email.payload.headers, 'From'))})
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-[var(--dark-purple)] mb-2">
                        {getHeaderValue(email.payload.headers, 'Subject')}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(email.internalDate)}
                        </div>
                      </div>
                      
                      {showSnippets && email.snippet && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700">{email.snippet}</p>
                        </div>
                      )}
                      
                      {email.summary && (
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <h4 className="font-medium text-blue-900 mb-1">{t("gmail.aiSummary")}</h4>
                          <p className="text-blue-800">{email.summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && emails.length === 0 && accessToken && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("gmail.noEmails")}
              </h3>
              <p className="text-gray-500 mb-4">
                {t("gmail.noEmailsDescription")}
              </p>
              <Button onClick={fetchEmails}>
                {t("gmail.getEmails")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Connect Gmail State */}
        {!accessToken && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("gmail.connectRequired")}
              </h3>
              <p className="text-gray-500 mb-4">
                {t("gmail.connectDescription")}
              </p>
              <Button onClick={() => gmailLogin()} className="bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4 mr-2" />
                {t("gmail.connectGmail")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 