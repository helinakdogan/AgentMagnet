import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, RefreshCw, AlertCircle, AlertTriangle, Calendar, DollarSign, MessageCircle, Eye, X } from 'lucide-react';

interface EmailData {
  id: string;
  subject: string;
  sender: string;
  date: string;
  snippet: string;
  isUrgent?: boolean;
}

export default function GmailOrganizerAgent() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Sayfa yüklendiğinde localStorage'dan Gmail token'ını al
  useEffect(() => {
    const savedToken = localStorage.getItem('gmailAccessToken');
    if (savedToken) {
      setAccessToken(savedToken);
      console.log('Gmail token loaded from localStorage');
    }
  }, []);

  // Google OAuth ile Gmail bağlantısı
  const gmailLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Gmail OAuth successful:', tokenResponse);
      
      // Token'ı state'e ve localStorage'a kaydet
      setAccessToken(tokenResponse.access_token);
      localStorage.setItem('gmailAccessToken', tokenResponse.access_token);
      
      // Token'ı backend'e kaydet
      try {
        const userId = localStorage.getItem("userId") || "b682763a-1412-4463-8be5-e01d3a7cb265";
        const response = await fetch('/api/gmail/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            agentId: 'gmail-organizer-agent',
            accessToken: tokenResponse.access_token,
            refreshToken: (tokenResponse as any).refresh_token || ''
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
      
      alert("Gmail bağlantısı başarılı! Artık N8N workflow'unu çalıştırabilirsiniz.");
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
    setResult(null);
    setError(null);
    alert("Gmail bağlantısı kesildi.");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
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
      return 'Tarih bilgisi yok';
    }
  };

  const extractCleanSenderName = (sender: string | undefined) => {
    if (!sender) return 'Bilinmeyen Gönderen';
    
    const cleanSender = sender.replace(/<[^>]*>/g, '').trim();
    
    if (cleanSender.includes('@')) {
      return cleanSender.split('@')[0].trim();
    }
    
    return cleanSender || 'Bilinmeyen Gönderen';
  };

  const formatEmailContent = (content: string | undefined) => {
    if (!content) return 'İçerik yok';
    
    if (content.length > 200) {
      return content.substring(0, 200) + '...';
    }
    
    return content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Parse Gmail API response and extract email details
  const parseGmailResponse = (gmailData: any) => {
    if (!gmailData || !gmailData.messages) return [];
    
    return gmailData.messages.map((message: any) => {
      const headers = message.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'Konu Yok';
      const sender = headers.find((h: any) => h.name === 'From')?.value || 'Gönderen Yok';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';
      const snippet = message.snippet || 'İçerik yok';
      
      return {
        id: message.id,
        subject,
        sender,
        date,
        snippet,
        isUrgent: subject.toLowerCase().includes('acil') || subject.toLowerCase().includes('urgent')
      };
    });
  };

  // N8N Workflow'u çalıştır
  const runOrganizerWorkflow = async () => {
    if (!accessToken) {
      alert("Önce Gmail hesabınızı bağlayın!");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('🚀 Calling Gmail Organizer workflow...');
      
      const response = await fetch('/api/gmail/organizer-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          maxResults: 10
        })
      });

      const data = await response.json();
      console.log('📧 Workflow result:', data);
      
      if (data.success) {
        setResult(data);
        // Parse Gmail response and extract email details
        const parsedEmails = parseGmailResponse(data.data);
        setEmails(parsedEmails);
      } else {
        setError(data.error || 'Workflow failed');
      }
    } catch (error) {
      console.error('❌ Workflow error:', error);
      setError('Workflow error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Gmail Organizer Agent</h1>
        <p className="text-xl text-muted-foreground">
          N8N Workflow ile Gmail Organizasyonu
        </p>
      </div>

      {/* Gmail Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gmail Bağlantısı</CardTitle>
        </CardHeader>
        <CardContent>
          {!accessToken ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Gmail Bağlantısı Gerekli</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                N8N workflow'unu çalıştırmak için önce Gmail hesabınızı bağlayın
              </p>
              <Button 
                onClick={() => gmailLogin()} 
                className="relative inline-flex items-center justify-center px-1 py-1 rounded-lg group transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] group-hover:opacity-80 transition-opacity"></div>
                <div className="relative rounded-lg bg-white dark:bg-gray-800 px-4 py-2">
                  <span className="text-black dark:text-white text-sm font-medium leading-none flex items-center">
                    <Mail className="w-3 h-3 mr-2" />
                    Gmail API Bağla
                  </span>
                </div>
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-green-600">Gmail Bağlandı!</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Gmail hesabınız başarıyla bağlandı
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={runOrganizerWorkflow}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Workflow Çalışıyor...
                    </>
                  ) : (
                    <>
                      🚀 N8N Workflow Çalıştır
                    </>
                  )}
                </Button>
                <Button 
                  onClick={disconnectGmail}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Bağlantıyı Kes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Hata:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emails List */}
      {emails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Organize Edilen E-postalar ({emails.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emails.map((email, index) => (
                <div key={email.id || index} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-foreground text-base">
                          {extractCleanSenderName(email.sender)}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-foreground mb-2 line-clamp-2">
                        {email.subject || 'Konu Yok'}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {formatEmailContent(email.snippet)}
                      </div>
                      {email.date && (
                        <div className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(email.date)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* Acil Mail */}
                      {email.isUrgent && (
                        <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full font-medium flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3" />
                          Acil
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Result - Sadece debug için */}
      {result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Debug: Raw Workflow Result</CardTitle>
          </CardHeader>
          <CardContent>
            <details className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium">Raw JSON (Click to expand)</summary>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Nasıl Çalışır?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Gmail API Bağla</strong> butonuna tıklayın</li>
            <li>Google OAuth ile Gmail hesabınızı bağlayın</li>
            <li><strong>N8N Workflow Çalıştır</strong> butonuna tıklayın</li>
            <li>N8N workflow'u Gmail'den mailleri getirir ve organize eder</li>
            <li>Sonuçları bu sayfada görüntüleyin</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
} 