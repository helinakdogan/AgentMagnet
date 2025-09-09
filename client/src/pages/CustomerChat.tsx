// Frontend/client/src/pages/CustomerChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Send, 
  User,
  Bot,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Globe,
  Clock,
  Sparkles,
  X,
  UserPlus
} from 'lucide-react';

interface Business {
  id: string;
  businessName: string;
  businessType: string;
  description?: string;
  welcomeMessage: string;
  address?: string;
  phone?: string;
  instagram?: string;
  website?: string;
  logo?: string;
  backgroundPhoto?: string;
  colorTheme: string;
}

interface Message {
  id: string;
  senderType: 'customer' | 'business' | 'system';
  message: string;
  isAutoResponse: boolean;
  isRead: boolean;
  timestamp: string;
}

interface Template {
  id: string;
  title: string;
  trigger: string;
  response: string;
  category: string;
}

// Müşteri bilgi formu state'i
interface CustomerInfo {
  name: string;
  phone: string;
  preferredTime: string;
}

// Tema renkleri - SADECE GRADYANLAR
const colorThemes = {
  default: {
    primary: 'from-gray-500 to-gray-600',
    glassmorphic: 'from-gray-400/20 to-gray-700/20'
  },
  earth: {
    primary: 'from-amber-600 to-orange-700',
    glassmorphic: 'from-amber-600/20 to-orange-700/20'
  },
  modern: {
    primary: 'from-gray-800 to-gray-900',
    glassmorphic: 'from-gray-800/20 to-gray-900/20'
  },
  neon: {
    primary: 'from-purple-500 to-pink-500',
    glassmorphic: 'from-purple-500/20 to-pink-500/20'
  },
  pastel: {
    primary: 'from-pink-500 to-pink-500',
    glassmorphic: 'from-pink-500/20 to-pink-500/20'
  }
};

// Background photo URL'lerini döndüren fonksiyon
const getBackgroundPhotoUrl = (photoId: string): string => {
 // CustomerChat.tsx - backgroundPhotos path'lerini güncelle
const backgroundPhotos = [
  { id: 'salon1', src: '/images/salon1.png' },
  { id: 'salon2', src: '/images/salon2.png' },
  { id: 'salon3', src: '/images/salon3.png' }
];
  
  const photo = backgroundPhotos.find(p => p.id === photoId);
  return photo ? photo.src : '';
};

export default function CustomerChat() {
  const [match, params] = useRoute('/chat/:chatLinkId');
  const chatLinkId = params?.chatLinkId;
  const [business, setBusiness] = useState<Business | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIntroFormOpen, setIsIntroFormOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
    const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Müşteri bilgi formu state'leri
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    preferredTime: ''
  });
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatLinkId) {
      initializeChat();
    }
  }, [chatLinkId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching business data for chatLinkId:', chatLinkId);
      
      // İşletme bilgilerini getir
      const businessResponse = await fetch(`/api/business-chat/business/link/${chatLinkId}`);
      const businessData = await businessResponse.json();
      
      console.log('📊 Business response:', businessData);
      
      if (!businessData.success) {
        setError('İşletme bulunamadı');
        return;
      }

      console.log('✅ Business data:', businessData.data);
      setBusiness(businessData.data);

      // Şablonları getir
      const templatesResponse = await fetch(`/api/business-chat/business/${businessData.data.id}/templates`);
      const templatesData = await templatesResponse.json();
      console.log(' Templates response:', templatesData);
      
      if (templatesData.success) {
        setTemplates(templatesData.data);
      }

      // Hoş geldin mesajını ekle
      setMessages([{
        id: 'welcome',
        message: businessData.data.welcomeMessage,
        senderType: 'system',
        timestamp: new Date().toISOString(),
        isAutoResponse: false,
        isRead: false
      }]);

    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      setError('Sohbet başlatılamadı');
    } finally {
      setLoading(false);
    }
  };

  // Müşteri bilgilerini kaydet
// CustomerChat.tsx - saveCustomerInfo düzeltmesi
// CustomerChat.tsx - saveCustomerInfo düzeltmesi
const saveCustomerInfo = async () => {
  setIsSubmittingInfo(true);
  try {
    if (!business) throw new Error('İşletme bulunamadı');
    // Önce mevcut session'ı bul
    const sessionResponse = await fetch(`/api/business-chat/business/${business.id}/sessions`);
    const sessionData = await sessionResponse.json();

    if (sessionData.success && Array.isArray(sessionData.data) && sessionData.data.length > 0) {
      const latestSession = sessionData.data[0]; // En son session
      
      // Session'ı güncelle
      const updateResponse = await fetch(`/api/business-chat/session/${latestSession.sessionToken}/info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          preferredTime: customerInfo.preferredTime
        })
      });

      const updateData = await updateResponse.json();
      if (updateData.success) {
        // Başarı mesajı gönder
        const successMessage: Message = {
          id: Date.now().toString(),
          message: 'Bilgileriniz kaydedildi! Randevu oluşturmanıza yardımcı olabiliriz. ��',
          senderType: 'business',
          timestamp: new Date().toISOString(),
          isAutoResponse: true,
          isRead: false
        };
        setMessages(prev => [...prev, successMessage]);
        setShowCustomerForm(false);
      } else {
        throw new Error(updateData.error || 'Bilgiler kaydedilemedi');
      }
    } else {
      throw new Error('Session bulunamadı');
    }
  } catch (error) {
    console.error('Bilgi kaydetme hatası:', error);
    // Hata mesajı gönder
    const errorMessage: Message = {
      id: Date.now().toString(),
      message: 'Bilgiler kaydedilemedi. Lütfen tekrar deneyin.',
      senderType: 'business',
      timestamp: new Date().toISOString(),
      isAutoResponse: true,
      isRead: false
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsSubmittingInfo(false);
  }
};

 // CustomerChat.tsx - sendMessage metodunu düzelt
const sendMessage = async () => {
  if (!newMessage.trim() || !business || sendingMessage) return;

  setSendingMessage(true);

  const customerMessage: Message = {
    id: Date.now().toString(),
    message: newMessage,
    senderType: 'customer',
    timestamp: new Date().toISOString(),
    isAutoResponse: false,
    isRead: false
  };

  setMessages(prev => [...prev, customerMessage]);
  const messageToSend = newMessage;
  setNewMessage('');

  // Backend'e mesaj gönder (bu endpoint session oluşturacak)
  try {
    const response = await fetch(`/api/business-chat/chat/${chatLinkId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageToSend })
    });
    
    const data = await response.json();
    if (data.success && data.response) {
      const businessMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: data.response,
        senderType: 'business',
        timestamp: new Date().toISOString(),
        isAutoResponse: true,
        isRead: false
      };
      setMessages(prev => [...prev, businessMessage]);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    setSendingMessage(false);
  }
};

  const selectTemplate = (template: Template) => {
    setNewMessage(template.trigger);
    // Otomatik gönder
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chat yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="bg-white shadow-xl border-0 p-8 max-w-md mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat Bulunamadı</h2>
            <p className="text-gray-600">{error || 'Geçersiz chat linki'}</p>
          </div>
        </Card>
      </div>
    );
  }

  const theme = colorThemes[business.colorTheme as keyof typeof colorThemes] || colorThemes.default;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Arkaplan fotoğrafı */}
      {business.backgroundPhoto && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ 
            backgroundImage: `url(${getBackgroundPhotoUrl(business.backgroundPhoto)})` 
          }}
        />
      )}

      {/* Ana içerik */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Welcome Section - GLASSMORFIK KÜNYE */}
        <div className="pt-8 pb-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className={`bg-gradient-to-r ${theme.glassmorphic} backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center`}>
              <h1 className="text-2xl sm:text-3xl font-normal text-white mb-2">
                {business.businessName}'a Hoş Geldiniz
              </h1>
              <p className="text-sm sm:text-base text-white opacity-80 mb-4">
                {business.description || `${business.businessType} hizmetlerimizden yararlanmak için bizimle iletişime geçin.`}
              </p>
              
              {/* İletişim bilgileri */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm">
                {business.address && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="text-white">{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4 text-white" />
                    <span className="text-white">{business.phone}</span>
                  </div>
                )}
                {business.instagram && (
                  <div className="flex items-center space-x-1">
                    <Instagram className="w-4 h-4 text-white" />
                    <span className="text-white">{business.instagram}</span>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4 text-white" />
                    <span className="text-white">{business.website}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı şablonlar */}
        {templates.length > 0 && (
          <div className="pb-4">
            <div className="max-w-4xl mx-auto px-4">
              <p className="text-sm mb-2 text-white text-center">Hızlı sorular:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {templates.slice(0, 6).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => selectTemplate(template)}
                    className="border border-white text-black bg-white text-xs sm:text-sm"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {template.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Müşteri bilgi formu butonu */}
        <div className="pb-4">
          <div className="max-w-md mx-auto px-4">
            <Button
              onClick={() => setShowCustomerForm(true)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Bilgilerinizi bizimle paylaşın
            </Button>
            <p className="text-white/70 text-xs text-center mt-2">
              Randevu oluşturmanıza yardımcı olabiliriz
            </p>
          </div>
        </div>

        {/* Mesajlar alanı */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                      message.senderType === 'customer'
                        ? `bg-gradient-to-r ${theme.glassmorphic} backdrop-blur-md border border-white/20 text-white`
                        : `bg-white/10 backdrop-blur-md border border-white/20 text-white`
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0">
                        {message.senderType === 'customer' ? (
                          <User className="w-4 h-4 mt-0.5" />
                        ) : message.senderType === 'system' ? (
                          <Bot className="w-4 h-4 mt-0.5" />
                        ) : (
                          <Bot className="w-4 h-4 mt-0.5" />                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.isAutoResponse && (
                            <Badge variant="secondary" className="text-xs text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Otomatik
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Mesaj gönderme */}
        <div className="p-4 backdrop-blur-sm border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex space-x-6">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                onKeyPress={handleKeyPress}
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 focus:border-purple-500 text-white placeholder:text-white/70"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || sendingMessage}
                className={`bg-gradient-to-r ${theme.primary} backdrop-blur-md border border-white/20 hover:opacity-90 text-white px-4 sm:px-6`}
              >
                <Send className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Müşteri bilgi formu modal */}
      <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
        <DialogContent className="max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Bilgilerinizi Paylaşın</DialogTitle>
            <DialogDescription className="text-white/70">
              Randevu oluşturmanıza yardımcı olabiliriz
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/80 text-sm font-medium">Adınız (Opsiyonel)</label>
              <Input
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                placeholder="Adınızı girin"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            
            <div>
              <label className="text-white/80 text-sm font-medium">Telefon (Opsiyonel)</label>
              <Input
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                placeholder="Telefon numaranızı girin"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            
            <div>
              <label className="text-white/80 text-sm font-medium">Uygun Olduğunuz Zaman (Opsiyonel)</label>
              <Input
                value={customerInfo.preferredTime}
                onChange={(e) => setCustomerInfo({...customerInfo, preferredTime: e.target.value})}
                placeholder="Örn: Pazartesi 14:00, Salı sabah"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={saveCustomerInfo}
                disabled={isSubmittingInfo}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                {isSubmittingInfo ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCustomerForm(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}