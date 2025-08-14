import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, Mail, Clock, User, Eye, EyeOff, RefreshCw, AlertCircle, AlertTriangle, Calendar, DollarSign, MessageCircle, X } from 'lucide-react';
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
        const response = await fetch(`${import.meta.env.DEV ? '/api' : 'https://agent-magnet-backend.onrender.com/api'}/gmail/summary`, {
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
          const response = await fetch(`${import.meta.env.DEV ? '/api' : 'https://agent-magnet-backend.onrender.com/api'}/gmail/summary`, {
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
        const response = await fetch(`${import.meta.env.DEV ? '/api' : 'https://agent-magnet-backend.onrender.com/api'}/gmail/tokens`, {
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
      const response = await fetch(`${import.meta.env.DEV ? '/api' : 'https://agent-magnet-backend.onrender.com/api'}/gmail/summary`, {
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
        throw new Error('Gmail bağlantınız kesilmiş olabilir. Lütfen bağlantıyı kesip yeniden bağlanmayı deneyin.');
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
      let userFriendlyMessage = 'Bilinmeyen hata oluştu';
      
      if (err instanceof Error) {
                    // Kullanıcı dostu hata mesajları
            if (err.message.includes('Gmail bağlantınız kesilmiş')) {
              userFriendlyMessage = 'Gmail bağlantınız kesilmiş olabilir. Lütfen bağlantıyı kesip yeniden bağlanmayı deneyin.';
            } else if (err.message.includes('Günlük limit doldu')) {
          userFriendlyMessage = 'Günlük mail özetleme limitiniz doldu. Yarın tekrar deneyin.';
        } else if (err.message.includes('Gmail bağlantısı süresi dolmuş')) {
          userFriendlyMessage = 'Gmail bağlantısı süresi dolmuş. Lütfen tekrar bağlanın.';
        } else {
          userFriendlyMessage = err.message;
        }
      }
      
      setError(userFriendlyMessage);
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

  // Gönderen adını temizle (email adresini kaldır)
  const extractCleanSenderName = (sender: string | undefined) => {
    if (!sender) return 'Bilinmeyen Gönderen';
    
    // Email formatındaki < > işaretlerini kaldır
    const cleanSender = sender.replace(/<[^>]*>/g, '').trim();
    
    // Sadece isim kısmını al (email adresini kaldır)
    if (cleanSender.includes('@')) {
      return cleanSender.split('@')[0].trim();
    }
    
    return cleanSender || 'Bilinmeyen Gönderen';
  };

  // Mail içeriğini daha okunaklı hale getir
  const formatEmailContent = (content: string | undefined) => {
    if (!content) return 'İçerik yok';
    
    // Çok uzun içerikleri kısalt
    if (content.length > 200) {
      return content.substring(0, 200) + '...';
    }
    
    // Satır sonlarını temizle
    return content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Acil mail tespiti (toplantı, randevu, deadline vs.)
  const isUrgentEmail = (subject: string | undefined, content: string | undefined) => {
    if (!subject && !content) return false;
    
    const text = `${subject || ''} ${content || ''}`.toLowerCase();
    
    // Gerçekten acil olan anahtar kelimeler
    const urgentKeywords = [
      'acil', 'urgent', 'son dakika', 'last minute', 'kritik', 'critical',
      'dikkat', 'attention', 'önemli', 'important', 'hızlı', 'quick'
    ];
    
    // Toplantı ve randevu anahtarları (önemli ama acil değil)
    const meetingKeywords = [
      'toplantı', 'meeting', 'randevu', 'appointment', 'görüşme', 'call',
      'zoom', 'teams', 'google meet', 'skype', 'webinar', 'seminer',
      'konferans', 'conference', 'workshop', 'atölye', 'sunum', 'presentation'
    ];
    
    // Zaman ve deadline anahtarları
    const timeKeywords = [
      'bugün', 'today', 'yarın', 'tomorrow', 'deadline', 'teslim', 'due date', 'son tarih'
    ];
    
    // Tarih formatları
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{4}/, // DD/MM/YYYY
      /\d{1,2}\.\d{1,2}\/\d{4}/, // DD.MM.YYYY
      /\d{1,2}-\d{1,2}-\d{4}/,   // DD-MM-YYYY
      /\d{1,2}:\d{2}/,            // HH:MM
      /\d{1,2}:\d{2}\s*(am|pm)/i, // HH:MM AM/PM
      /\d{1,2}\.\d{2}da/,         // HH.MMda (Türkçe format)
      /\d{1,2}:\d{2}da/,          // HH:MMda (Türkçe format)
      /\d{1,2}\.\d{2}/,           // HH.MM (nokta ile)
      /\d{1,2}:\d{2}/             // HH:MM (iki nokta ile)
    ];
    
    // Acil olmayan mailler (filtreleme için)
    const nonUrgentKeywords = [
      'yemek', 'food', 'sipariş', 'order', 'fatura', 'invoice', 'bill', 'ödeme', 'payment',
      'kampanya', 'campaign', 'indirim', 'discount', 'promosyon', 'promotion',
      'haber', 'news', 'güncelleme', 'update', 'duyuru', 'announcement',
      'reklam', 'advertisement', 'spam', 'newsletter', 'bülten'
    ];
    
    // Acil olmayan kelime kontrolü
    const hasNonUrgentKeyword = nonUrgentKeywords.some(keyword => text.includes(keyword));
    
    // Gerçekten acil olan mail kontrolü
    const isReallyUrgent = urgentKeywords.some(keyword => text.includes(keyword));
    
    // Toplantı/randevu kontrolü
    const hasMeeting = meetingKeywords.some(keyword => text.includes(keyword));
    const hasTimeAndDate = timeKeywords.some(keyword => text.includes(keyword)) && 
                           datePatterns.some(pattern => pattern.test(text));
    
    // Saat + Toplantı = Acil Mail (yeni kural)
    const hasTimeOnly = datePatterns.some(pattern => pattern.test(text)); // Sadece saat/datum var
    const isMeetingWithTime = hasMeeting && hasTimeOnly; // Toplantı + saat = acil
    
    // Acil mail kriterleri (daha seçici)
    if (hasNonUrgentKeyword && !isReallyUrgent) {
      return false; // Acil olmayan mail
    }
    
    return isReallyUrgent || isMeetingWithTime;
  };

  // Toplantı mail tespiti (cevap bekleyen toplantı mailleri için)
  const isMeetingEmail = (subject: string | undefined, content: string | undefined) => {
    if (!subject && !content) return false;
    
    const text = `${subject || ''} ${content || ''}`.toLowerCase();
    
    const meetingKeywords = [
      'toplantı', 'meeting', 'randevu', 'appointment', 'görüşme', 'call',
      'zoom', 'teams', 'google meet', 'skype', 'webinar', 'seminer',
      'konferans', 'conference', 'workshop', 'atölye', 'sunum', 'presentation'
    ];
    
    // 🎯 Basit kural: toplantı kelimesi geçiyorsa = toplantı maili
    const isMeeting = meetingKeywords.some(keyword => text.includes(keyword));
    
    // Debug log
    if (isMeeting) {
      console.log('📅 TOPLANTI MAİLİ TESPİT EDİLDİ:', { 
        subject, 
        content, 
        text, 
        isMeeting,
        foundKeywords: meetingKeywords.filter(keyword => text.includes(keyword))
      });
    }
    
    return isMeeting;
  };

  // Önemli ama acil olmayan mail tespiti
  const isImportantButNotUrgent = (subject: string | undefined, content: string | undefined) => {
    if (!subject && !content) return false;
    
    const text = `${subject || ''} ${content || ''}`.toLowerCase();
    
    // Önemli ama acil olmayan anahtar kelimeler
    const importantKeywords = [
      'toplantı', 'meeting', 'randevu', 'appointment', 'görüşme', 'call',
      'zoom', 'teams', 'google meet', 'skype', 'webinar', 'seminer',
      'konferans', 'conference', 'workshop', 'atölye', 'sunum', 'presentation',
      'deadline', 'teslim', 'due date', 'son tarih', 'proje', 'project',
      'rapor', 'report', 'analiz', 'analysis', 'sonuç', 'result'
    ];
    
    // Acil olmayan kelimeler
    const nonUrgentKeywords = [
      'yemek', 'food', 'sipariş', 'order', 'fatura', 'invoice', 'bill', 'ödeme', 'payment',
      'kampanya', 'campaign', 'indirim', 'discount', 'promosyon', 'promotion',
      'haber', 'news', 'güncelleme', 'update', 'duyuru', 'announcement',
      'reklam', 'advertisement', 'spam', 'newsletter', 'bülten'
    ];
    
    // Gerçekten acil olan kelimeler
    const urgentKeywords = [
      'acil', 'urgent', 'son dakika', 'last minute', 'kritik', 'critical',
      'dikkat', 'attention', 'önemli', 'important', 'hızlı', 'quick'
    ];
    
    const hasImportantKeyword = importantKeywords.some(keyword => text.includes(keyword));
    const hasNonUrgentKeyword = nonUrgentKeywords.some(keyword => text.includes(keyword));
    const hasUrgentKeyword = urgentKeywords.some(keyword => text.includes(keyword));
    
    // Önemli ama acil olmayan mail kriterleri
    return hasImportantKeyword && !hasNonUrgentKeyword && !hasUrgentKeyword;
  };

  // Cevap bekleyen mail tespiti
  const isWaitingForReply = (subject: string | undefined, content: string | undefined) => {
    if (!subject && !content) return false;
    
    const text = `${subject || ''} ${content || ''}`.toLowerCase();
    
    // Cevap bekleyen mail anahtar kelimeleri
    const replyKeywords = [
      'cevap', 'reply', 'yanıt', 'response', 'geri dön', 'get back', 'dönüş', 'return',
      'cevabınızı', 'cevabını', 'cevabımı', 'cevabımızı', 'cevabınız', 'cevabın',
      'onay', 'approval', 'confirm', 'teyit', 'verification', 'doğrulama',
      'görüş', 'opinion', 'fikir', 'idea', 'öneri', 'suggestion', 'proposal',
      'soru', 'question', 'inquiry', 'sorgu', 'query', 'yardım', 'help',
      'destek', 'support', 'assistance', 'danışma', 'consultation',
      'uygun mu', 'müsait misin', 'available', 'müsait', 'uygun', 'suitable',
      'ne düşünüyorsun', 'what do you think', 'fikrin nedir', 'your opinion',
      'onaylıyor musun', 'do you approve', 'kabul ediyor musun', 'do you accept',
      'cevap ver', 'reply to', 'yanıtla', 'respond to', 'geri bildirim', 'feedback',
      'bekliyor', 'bekliyorum', 'bekliyoruz', 'bekliyorsun', 'bekliyorsunuz'
    ];
    
    // Cevap beklemeyen mail anahtar kelimeleri
    const noReplyKeywords = [
      'otomatik', 'automatic', 'bilgilendirme', 'information', 'duyuru', 'announcement',
      'hatırlatma', 'reminder', 'güncelleme', 'update', 'onaylandı', 'confirmed',
      'tamamlandı', 'completed', 'sonuç', 'result', 'final', 'finalized',
      'teşekkürler', 'thank you', 'teşekkür', 'thanks', 'güle güle', 'goodbye',
      'yapalım', 'let\'s do', 'yapacağız', 'we will do', 'planladık', 'we planned',
      'kararlaştırdık', 'we decided', 'belirledik', 'we determined'
    ];
    
    const hasReplyKeyword = replyKeywords.some(keyword => text.includes(keyword));
    const hasNoReplyKeyword = noReplyKeywords.some(keyword => text.includes(keyword));
    
    return hasReplyKeyword && !hasNoReplyKeyword;
  };

  // Finansal mail tespiti
  const isFinancialEmail = (subject: string | undefined, content: string | undefined) => {
    if (!subject && !content) return false;
    
    const text = `${subject || ''} ${content || ''}`.toLowerCase();
    
    const financialKeywords = [
      'fatura', 'invoice', 'bill', 'ödeme', 'payment', 'para', 'money', 'ücret', 'fee',
      'banka', 'bank', 'kredi', 'credit', 'borç', 'debt', 'alacak', 'receivable',
      'muhasebe', 'accounting', 'finans', 'finance', 'bütçe', 'budget',
      'masraf', 'expense', 'gelir', 'income', 'kâr', 'profit', 'zarar', 'loss'
    ];
    
    return financialKeywords.some(keyword => text.includes(keyword));
  };

  // Sosyal medya ve haber mail tespiti
  const isSocialMediaOrNews = (subject: string | undefined, content: string | undefined) => {
    if (!subject && !content) return false;
    
    const text = `${subject || ''} ${content || ''}`.toLowerCase();
    
    const socialKeywords = [
      'instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok',
      'beğeni', 'like', 'yorum', 'comment', 'takip', 'follow', 'paylaşım', 'share',
      'haber', 'news', 'güncelleme', 'update', 'duyuru', 'announcement',
      'kampanya', 'campaign', 'indirim', 'discount', 'promosyon', 'promotion'
    ];
    
    return socialKeywords.some(keyword => text.includes(keyword));
  };

  // E-ticaret mail tespiti
  const isEcommerceEmail = (subject: string | undefined, content: string | undefined) => {
    if (!subject && !content) return false;
    
    const text = `${subject || ''} ${content || ''}`.toLowerCase();
    
    const ecommerceKeywords = [
      'yemek', 'food', 'sipariş', 'order', 'kargo', 'shipping', 'teslimat', 'delivery',
      'ürün', 'product', 'satın al', 'purchase', 'alışveriş', 'shopping',
      'sepet', 'cart', 'basket', 'favori', 'favorite', 'wishlist', 'istek listesi',
      'kupon', 'coupon', 'kod', 'code', 'indirim', 'discount'
    ];
    
    return ecommerceKeywords.some(keyword => text.includes(keyword));
  };

  // 🆕 Reklam/Spam mail tespiti (filtrelenecek)
  const isAdvertisementOrSpam = (subject: string | undefined, content: string | undefined) => {
    if (!subject && !content) return false;
    
    const text = `${subject || ''} ${content || ''}`.toLowerCase();
    
    // Reklam/Spam anahtar kelimeleri
    const spamKeywords = [
      // Pazarlama ve reklam
      'kampanya', 'campaign', 'promosyon', 'promotion', 'indirim', 'discount', 'fırsat', 'opportunity',
      'özel teklif', 'special offer', 'sınırlı süre', 'limited time', 'kaçırma', 'don\'t miss',
      'geri döndü', 'came back', 'yeniden', 'again', 'yeni koleksiyon', 'new collection',
      't-shirt', 'tshirt', 'giyim', 'clothing', 'moda', 'fashion', 'aksesuar', 'accessory',
      
      // 🆕 Sosyal medya ve platform mailleri (spam)
      'instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok', 'snapchat', 'pinterest',
      'quora', 'reddit', 'discord', 'telegram', 'whatsapp', 'signal', 'slack', 'microsoft teams',
      'zoom', 'skype', 'google meet', 'webex', 'jitsi', 'meetup', 'eventbrite',
      
      // Sosyal medya içerik türleri
      'beğeni', 'like', 'yorum', 'comment', 'takip', 'follow', 'paylaşım', 'share', 'post',
      'story', 'reel', 'video', 'fotoğraf', 'photo', 'görsel', 'image', 'emoji', 'sticker',
      'filtre', 'filter', 'efekt', 'effect', 'trend', 'viral', 'popüler', 'popular',
      
      // Haber ve güncelleme (spam)
      'haber', 'news', 'güncelleme', 'update', 'duyuru', 'announcement', 'alert', 'uyarı',
      'bülten', 'newsletter', 'abone ol', 'subscribe', 'takip et', 'follow', 'notification',
      'bildirim', 'reminder', 'hatırlatma', 'daily digest', 'günlük özet', 'weekly summary',
      
      // 🆕 Platform özel kelimeler (spam)
      'suggested', 'önerilen', 'recommended', 'trending', 'popüler', 'popular', 'featured',
      'spaces', 'topluluk', 'community', 'group', 'grup', 'forum', 'discussion', 'tartışma',
      'question', 'soru', 'answer', 'cevap', 'story', 'hikaye', 'post', 'gönderi',
      'digest', 'özet', 'summary', 'roundup', 'top picks', 'en iyiler', 'best of',
      
      // Genel spam
      'ücretsiz', 'free', 'kazan', 'win', 'çekiliş', 'giveaway', 'ödül', 'prize',
      'kupon', 'coupon', 'kod', 'code', 'bonus', 'extra', 'ekstra', 'additional'
    ];
    
    // Gönderen adı kontrolü (spam gönderenler)
    const spamSenders = [
      // E-ticaret ve pazarlama
      'wwf market', 'market', 'shop', 'store', 'brand', 'marka', 'company', 'şirket',
      'newsletter', 'bülten', 'promo', 'sale', 'indirim', 'discount',
      
      // 🆕 Sosyal medya platformları
      'quora', 'instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok',
      'snapchat', 'pinterest', 'reddit', 'discord', 'telegram', 'whatsapp',
      'microsoft', 'google', 'zoom', 'skype', 'webex', 'meetup', 'eventbrite',
      
      // Haber ve medya
      'newsletter', 'news', 'haber', 'bülten', 'digest', 'özet', 'summary',
      'notification', 'bildirim', 'alert', 'uyarı', 'reminder', 'hatırlatma'
    ];
    
    // Spam içerik kontrolü
    const hasSpamContent = spamKeywords.some(keyword => text.includes(keyword));
    
    // Spam gönderen kontrolü (subject'te veya content'te)
    const hasSpamSender = spamSenders.some(sender => text.includes(sender));
    
    // Debug log
    if (hasSpamContent || hasSpamSender) {
      console.log('🚫 SPAM MAIL TESPİT EDİLDİ:', { 
        subject, 
        content, 
        text, 
        hasSpamContent, 
        hasSpamSender,
        spamKeywords: spamKeywords.filter(keyword => text.includes(keyword)),
        spamSenders: spamSenders.filter(sender => text.includes(sender))
      });
    }
    
    return hasSpamContent || hasSpamSender;
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
                  Gmail Bağlantı Sorunu
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
          <div className="space-y-4">
            {/* 🆕 Spam Filtreleme Bilgisi */}
            {emails.filter(email => isAdvertisementOrSpam(email.subject, email.snippet || email.content)).length > 0 && (
              <div className="glassmorphic rounded-xl p-3 mb-4 border border-orange-200 dark:border-orange-800 bg-orange-50/20 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                  <X className="w-4 h-4" />
                  <span>
                    {emails.filter(email => isAdvertisementOrSpam(email.subject, email.snippet || email.content)).length} reklam/spam mail filtrelendi
                  </span>
                </div>
              </div>
            )}
            
            {emails
              .filter(email => {
                const isSpam = isAdvertisementOrSpam(email.subject, email.snippet || email.content);
                if (isSpam) {
                  console.log('🚫 SPAM MAİL FİLTRELENDİ:', { 
                    subject: email.subject, 
                    sender: email.sender,
                    isSpam 
                  });
                }
                return !isSpam;
              }) // 🆕 Spam mailleri filtrele
              .map((email, index) => (
              <div key={index} className="glassmorphic rounded-xl p-5 hover:bg-white/5 transition-colors border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-[var(--foreground)] text-base">
                        {extractCleanSenderName(email.sender || email.from)}
                      </div>
                      {email.isRead === false && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-[var(--foreground)] mb-2 line-clamp-2">
                      {email.subject || 'Konu Yok'}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)] mb-3 leading-relaxed">
                      {formatEmailContent(email.snippet || email.content)}
                    </div>
                    {email.date && (
                      <div className="text-xs text-[var(--muted-foreground)] text-blue-400 font-medium flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(email.date)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* Acil Mail - En üstte */}
                    {(email.isUrgent || isUrgentEmail(email.subject, email.snippet || email.content)) && (
                      <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        Acil
                      </div>
                    )}
                    
                    {/* Cevap Bekleyen Mail - Acil'den sonra */}
                    {isWaitingForReply(email.subject, email.snippet || email.content) && (
                      <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium flex items-center gap-1.5">
                        <MessageCircle className="w-3 h-3" />
                        Cevap Bekliyor
                      </div>
                    )}
                    
                    {/* Toplantı Mail - Her zaman göster */}
                    {isMeetingEmail(email.subject, email.snippet || email.content) && (
                      <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        Toplantı
                      </div>
                    )}
                    
                    {/* Finansal Mail */}
                    {isFinancialEmail(email.subject, email.snippet || email.content) && 
                     !isUrgentEmail(email.subject, email.snippet || email.content) &&
                     !isWaitingForReply(email.subject, email.snippet || email.content) &&
                     !isMeetingEmail(email.subject, email.snippet || email.content) && (
                      <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-medium flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        Finansal
                      </div>
                    )}
                    
                    {/* Sosyal Medya/Haber */}
                    {isSocialMediaOrNews(email.subject, email.snippet || email.content) && 
                     !isUrgentEmail(email.subject, email.snippet || email.content) &&
                     !isWaitingForReply(email.subject, email.snippet || email.content) &&
                     !isMeetingEmail(email.subject, email.snippet || email.content) &&
                     !isFinancialEmail(email.subject, email.snippet || email.content) && (
                      <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full font-medium flex items-center gap-1.5">
                        <Eye className="w-3 h-3" />
                        Sosyal/Haber
                      </div>
                    )}
                    
                    {/* E-ticaret */}
                    {isEcommerceEmail(email.subject, email.snippet || email.content) && 
                     !isUrgentEmail(email.subject, email.snippet || email.content) &&
                     !isWaitingForReply(email.subject, email.snippet || email.content) &&
                     !isMeetingEmail(email.subject, email.snippet || email.content) &&
                     !isFinancialEmail(email.subject, email.snippet || email.content) &&
                     !isSocialMediaOrNews(email.subject, email.snippet || email.content) && (
                      <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-medium flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        E-ticaret
                      </div>
                    )}
                    
                    {/* Bilgi Mail - En son öncelik */}
                    {isImportantButNotUrgent(email.subject, email.snippet || email.content) && 
                     !isUrgentEmail(email.subject, email.snippet || email.content) &&
                     !isWaitingForReply(email.subject, email.snippet || email.content) &&
                     !isMeetingEmail(email.subject, email.snippet || email.content) &&
                     !isFinancialEmail(email.subject, email.snippet || email.content) &&
                     !isSocialMediaOrNews(email.subject, email.snippet || email.content) &&
                     !isEcommerceEmail(email.subject, email.snippet || email.content) && (
                      <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Bilgi
                      </div>
                    )}
                    

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact Empty State */}
        {!loading && emails.length === 0 && accessToken && (
          <div className="text-center mt-16 mb-16">
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
          <div className="text-center mt-16 mb-16">
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
              <div className="relative rounded-lg bg-[var(--muted-foreground)] dark:bg-[var(--soft-muted)] px-4 py-2">
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