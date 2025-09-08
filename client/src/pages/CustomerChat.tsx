import React, { useState, useEffect, useRef } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Send, 
  MessageCircle, 
  User,
  Bot,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface Business {
  id: string;
  businessName: string;
  businessType: string;
  description?: string;
  welcomeMessage: string;
}

interface ChatSession {
  id: string;
  sessionToken: string;
  businessId: string;
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

export default function CustomerChat() {
  const [match, params] = useRoute('/chat/:chatLinkId');
  const chatLinkId = params?.chatLinkId;
  const [business, setBusiness] = useState<Business | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIntroFormOpen, setIsIntroFormOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Message input
  const [newMessage, setNewMessage] = useState('');
  
  // Customer info form
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

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

      // İşletme bilgilerini getir
      const businessResponse = await fetch(`/api/business-chat/business/link/${chatLinkId}`);
      const businessData = await businessResponse.json();
      
      if (!businessData.success) {
        setError('İşletme bulunamadı');
        return;
      }

      setBusiness(businessData.data);

      // Şablonları getir
      const templatesResponse = await fetch(`/api/business-chat/business/${businessData.data.id}/templates`);
      const templatesData = await templatesResponse.json();
      if (templatesData.success) {
        setTemplates(templatesData.data);
      }

      // Mevcut session var mı kontrol et (localStorage'dan)
      const savedSessionToken = localStorage.getItem(`chat_session_${chatLinkId}`);
      
      if (savedSessionToken) {
        // Mevcut session'ı yükle
        const sessionResponse = await fetch(`/api/business-chat/session/${savedSessionToken}`);
        const sessionData = await sessionResponse.json();
        
        if (sessionData.success) {
          setSession(sessionData.data);
          await loadMessages(sessionData.data.id);
        } else {
          // Session geçersiz, yeni oluştur
          await createNewSession(businessData.data.id);
        }
      } else {
        // Yeni session oluştur
        await createNewSession(businessData.data.id);
      }

    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Sohbet başlatılamadı');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async (businessId: string) => {
    try {
      const response = await fetch('/api/business-chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });

      const data = await response.json();
      if (data.success) {
        setSession(data.data.session);
        localStorage.setItem(`chat_session_${chatLinkId}`, data.data.sessionToken);
        
        // Hoş geldin mesajını ekle
        if (business) {
          await sendWelcomeMessage(data.data.session.id, businessId);
        }
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const sendWelcomeMessage = async (sessionId: string, businessId: string) => {
    if (!business) return;
    
    try {
      await fetch('/api/business-chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          businessId,
          senderType: 'system',
          message: business.welcomeMessage
        })
      });

      // Mesajları yeniden yükle
      await loadMessages(sessionId);
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/business-chat/session/${sessionId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !session || !business || sendingMessage) return;

    try {
      setSendingMessage(true);
      
      const response = await fetch('/api/business-chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          businessId: business.id,
          senderType: 'customer',
          message: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        // Mesajları yeniden yükle
        await loadMessages(session.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const updateCustomerInfo = async () => {
    if (!session) return;

    try {
      // Bu endpoint henüz backend'de yok, şimdilik localStorage'a kaydedelim
      localStorage.setItem(`customer_info_${chatLinkId}`, JSON.stringify(customerForm));
      setIsIntroFormOpen(false);
    } catch (error) {
      console.error('Error updating customer info:', error);
    }
  };

  const selectTemplate = async (template: Template) => {
    setNewMessage(template.trigger);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Chat yükleniyor...</div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Chat Bulunamadı</h2>
            <p className="text-purple-200">{error || 'Geçersiz chat linki'}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{business.businessName}</h1>
              <p className="text-purple-200 text-sm">{business.businessType}</p>
            </div>
          </div>
          
          <Dialog open={isIntroFormOpen} onOpenChange={setIsIntroFormOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/20 hover:bg-white/10 text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Bilgilerim
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>İletişim Bilgileri</DialogTitle>
                <DialogDescription>
                  Size daha iyi hizmet verebilmemiz için iletişim bilgilerinizi paylaşabilirsiniz.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Adınız"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                />
                <Input
                  placeholder="Telefon Numaranız"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                />
                <Input
                  placeholder="Email Adresiniz"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                />
                <Button onClick={updateCustomerInfo} className="w-full">
                  Kaydet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-100px)] flex flex-col">
        {/* Quick Templates */}
        {templates.length > 0 && (
          <div className="mb-4">
            <p className="text-purple-200 text-sm mb-2">Hızlı sorular:</p>
            <div className="flex flex-wrap gap-2">
              {templates.slice(0, 6).map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => selectTemplate(template)}
                  className="border-purple-400/30 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 hover:text-white"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {template.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <Card className="flex-1 bg-white/10 backdrop-blur-sm border-white/20 flex flex-col">
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderType === 'customer'
                        ? 'bg-purple-600 text-white'
                        : message.senderType === 'system'
                        ? 'bg-blue-600/20 text-blue-200 border border-blue-400/30'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0">
                        {message.senderType === 'customer' ? (
                          <User className="w-4 h-4 mt-0.5" />
                        ) : message.senderType === 'system' ? (
                          <Bot className="w-4 h-4 mt-0.5" />
                        ) : (
                          <MessageCircle className="w-4 h-4 mt-0.5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{message.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.isAutoResponse && (
                            <Badge variant="secondary" className="text-xs bg-green-600/30 text-green-200">
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
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-end space-x-2">
              <Textarea
                placeholder="Mesajınızı yazın..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-purple-300 min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-11"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-purple-300 text-xs">
            Bu sohbet {business.businessName} tarafından sağlanmaktadır
          </p>
        </div>
      </div>
    </div>
  );
} 