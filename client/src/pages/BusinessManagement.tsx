import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useAuthContext } from '../contexts/AuthContext';
import { useAgent } from '../hooks/use-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Plus, MessageCircle, Users, Settings, Edit, Trash2, Copy,
  ExternalLink, BarChart3, Building2, Link as LinkIcon, CheckCircle,
  ArrowLeft, Bot, ChevronDown, ChevronUp, Upload, Palette, Image
} from 'lucide-react';
import HighlightButton from '../components/ui/highlight-button';
import BasicButton from '../components/ui/basic-button';


interface Business {
  id: string;
  businessName: string;
  businessType: string;
  description?: string;
  address?: string;
  phone?: string;
  instagram?: string;
  website?: string;
  logo?: string;
  chatLinkId: string;
  welcomeMessage: string;
  backgroundPhoto?: string;
  colorTheme?: string;
  isActive: boolean;
  createdAt: string;
}

interface Template {
  id: string;
  title: string;
  trigger: string;
  response: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  businessId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  sessionToken: string;
  isActive: boolean;
  lastActivityAt: string;
  messageCount: number;
  lastMessage?: string; // Bu satırı ekle
  preferredTime?: string;
  createdAt: string;
}

const businessTypes = [
  'Kuaför', 'Berber', 'Güzellik Salonu', 'Spa & Masaj', 'Fitness & Spor',
  'Restoran', 'Kafe', 'Pastane', 'Market', 'Eczane', 'Doktor', 'Diş Hekimi',
  'Veteriner', 'Avukat', 'Muhasebeci', 'Emlak', 'Sigorta', 'Banka',
  'Eğitim', 'Danışmanlık', 'Teknoloji', 'Yazılım', 'Tasarım', 'Pazarlama',
  'İnsan Kaynakları', 'Lojistik', 'Nakliye', 'Temizlik', 'Güvenlik', 'Diğer'
];

const backgroundPhotos = [
  { id: 'salon1', name: 'Modern Salon', src: '/src/assets/salon1.png' },
  { id: 'salon2', name: 'Klasik Salon', src: '/src/assets/salon2.png' },
  { id: 'salon3', name: 'Lüks Salon', src: '/src/assets/salon3.png' }
];
// BusinessManagement.tsx - colorThemes düzeltmesi
const colorThemes = [
  { id: 'default', name: 'Varsayılan (Glassmorphic)', colors: ['#3b82f6', '#8b5cf6'] },
  { id: 'earth', name: 'Toprak Tonları', colors: ['#d97706', '#ea580c'] },
  { id: 'modern', name: 'Modern', colors: ['#374151', '#111827'] },
  { id: 'neon', name: 'Neon', colors: ['#a855f7', '#ec4899'] },
  { id: 'pastel', name: 'Pastel Renkler', colors: ['#f8b4d9', '#f472b6'] }
];

export default function BusinessManagement() {
  const [match, params] = useRoute("/agent/:id/business-chat");
  const agentId = params?.id;
  const { user } = useAuthContext();
  const { data: agent, isLoading: agentLoading, error: agentError } = useAgent(agentId || '');

  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isCreateBusinessOpen, setIsCreateBusinessOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());
  // BusinessManagement.tsx - State'leri ekle (diğer useState'lerin yanına)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatSession, setSelectedChatSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [businessForm, setBusinessForm] = useState({
    businessName: '', businessType: '', description: '', address: '', phone: '',
    instagram: '', website: '', logo: '', welcomeMessage: 'Merhaba! Size nasıl yardımcı olabilirim?'
  });

  const [templateForm, setTemplateForm] = useState({
    title: '', trigger: '', response: '', category: 'genel'
  });

  const [editBusinessForm, setEditBusinessForm] = useState({
    businessName: '', businessType: '', description: '', address: '', phone: '',
    instagram: '', website: '', logo: '', welcomeMessage: '', backgroundPhoto: '', colorTheme: 'default'
  });

  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const currentUser = user || JSON.parse(localStorage.getItem('userData') || '{}');
  // BusinessManagement.tsx - State'leri ekle (line 110 civarına)
  const [selectedBackground, setSelectedBackgroundState] = useState<string>('salon2');
  const [selectedColorTheme, setSelectedColorThemeState] = useState<string>('default');


  useEffect(() => {
    if (currentUser?.id) fetchUserBusinesses();
  }, [currentUser?.id]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchBusinessTemplates();
      fetchBusinessChatSessions();
      setEditBusinessForm({
        businessName: selectedBusiness.businessName,
        businessType: selectedBusiness.businessType,
        description: selectedBusiness.description || '',
        address: selectedBusiness.address || '',
        phone: selectedBusiness.phone || '',
        instagram: selectedBusiness.instagram || '',
        website: selectedBusiness.website || '',
        logo: selectedBusiness.logo || '',
        welcomeMessage: selectedBusiness.welcomeMessage,
        backgroundPhoto: selectedBusiness.backgroundPhoto || '',
        colorTheme: selectedBusiness.colorTheme || 'default'
      });
    }
  }, [selectedBusiness]);

  const fetchUserBusinesses = async () => {
    try {
      const response = await fetch(`/api/business-chat/business/user/${currentUser?.id}`);
      const data = await response.json();
      if (data.success) {
        setBusinesses(data.data);
        if (data.data.length > 0 && !selectedBusiness) {
          setSelectedBusiness(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  // BusinessManagement.tsx - updateBusiness fonksiyonunu düzelt
  const updateBusiness = async () => {
    if (!selectedBusiness) return;
    try {
      // Yeni alanları da ekle
      const updatedData = {
        ...editBusinessForm,
        backgroundPhoto: selectedBackground,
        colorTheme: selectedColorTheme
      };

      console.log('📤 Sending update data:', updatedData);

      const response = await fetch(`/api/business-chat/business/${selectedBusiness.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      console.log('�� Update response:', data);

      if (data.success) {
        await fetchUserBusinesses();
        setIsEditingBusiness(false);
        setSelectedBusiness(data.data);
      } else {
        alert('İşletme güncellenemedi: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Bir hata oluştu');
    }
  };

  const fetchBusinessTemplates = async () => {
    if (!selectedBusiness) return;
    try {
      const response = await fetch(`/api/business-chat/business/${selectedBusiness.id}/templates`);
      const data = await response.json();
      if (data.success) setTemplates(data.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // BusinessManagement.tsx - fetchBusinessChatSessions debug ekle
  // BusinessManagement.tsx - fetchBusinessChatSessions debug ekle
  const fetchBusinessChatSessions = async () => {
    if (!selectedBusiness) return;
    try {
      console.log('Fetching sessions for business:', selectedBusiness.id);
      const response = await fetch(`/api/business-chat/business/${selectedBusiness.id}/sessions`);
      const data = await response.json();
      console.log('Sessions response:', data);
      if (data.success) {
        console.log('Setting sessions:', data.data);
        setChatSessions(data.data);
        console.log('Sessions set, current state:', chatSessions);
      } else {
        console.log('Failed to fetch sessions:', data);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const createBusiness = async () => {
    try {
      const response = await fetch('/api/business-chat/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, ...businessForm })
      });
      const data = await response.json();
      if (data.success) {
        await fetchUserBusinesses();
        setIsCreateBusinessOpen(false);
        setBusinessForm({
          businessName: '', businessType: '', description: '', address: '', phone: '',
          instagram: '', website: '', logo: '', welcomeMessage: 'Merhaba! Size nasıl yardımcı olabilirim?'
        });
      } else {
        alert('İşletme oluşturulamadı: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating business:', error);
      alert('Bir hata oluştu');
    }
  };

  const createTemplate = async () => {
    if (!selectedBusiness || templates.length >= 10) return;
    try {
      const response = await fetch('/api/business-chat/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: selectedBusiness.id, ...templateForm })
      });
      const data = await response.json();
      if (data.success) {
        await fetchBusinessTemplates();
        setIsCreateTemplateOpen(false);
        setTemplateForm({ title: '', trigger: '', response: '', category: 'genel' });
      } else {
        alert('Şablon oluşturulamadı: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Bir hata oluştu');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Bu şablonu silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(`/api/business-chat/template/${templateId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) await fetchBusinessTemplates();
      else alert('Şablon silinemedi: ' + data.error);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Bir hata oluştu');
    }
  };
  // BusinessManagement.tsx - Eksik fonksiyonları ekle (diğer fonksiyonların yanına)
  // BusinessManagement.tsx - viewChat fonksiyonunu güncelle
  const viewChat = async (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedChatSession(session);
      setIsChatModalOpen(true);

      // Mesajları getir
      try {
        const response = await fetch(`/api/business-chat/session/${sessionId}/messages`);
        const data = await response.json();
        if (data.success) {
          setChatMessages(data.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
  };

  const deleteChat = async (sessionId: string) => {
    if (!confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(`/api/business-chat/session/${sessionId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        await fetchBusinessChatSessions();
      } else {
        alert('Sohbet silinemedi: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Bir hata oluştu');
    }
  };

  const editTemplate = (template: Template) => {
    // Şablon düzenleme fonksiyonu
    console.log('Editing template:', template);
    // Burada şablon düzenleme modal'ını açabilirsin
  };

  const copyChatLink = (chatLinkId: string) => {
    const link = `${window.location.origin}/chat/${chatLinkId}`;
    navigator.clipboard.writeText(link);
    alert('Chat linki kopyalandı!');
  };

  const toggleChatExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedChats);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedChats(newExpanded);
  };

  if (loading || agentLoading) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-600 dark:text-gray-300">Yükleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

  if (agentError || !agent) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Agent bulunamadı</h2>
            <p className="text-gray-600 mb-8">Agent bilgileri yüklenemedi</p>
            <Link href="/my-agents">
              <BasicButton>Ajanlarıma Dön</BasicButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // BusinessManagement.tsx - Fonksiyonları düzelt
  function setSelectedBackground(id: string): void {
    setSelectedBackgroundState(id);
    setEditBusinessForm(prev => ({ ...prev, backgroundPhoto: id }));
  }

  function setSelectedColorTheme(theme: string): void {
    setSelectedColorThemeState(theme);
    setEditBusinessForm(prev => ({ ...prev, colorTheme: theme }));
  }


  return (
    <div className="min-h-screen py-8 sm:py-12 bg-[var(--light-gray)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/my-agents">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-3xl font-normal text-[var(--dark-purple)]">{agent.name}</h1>
                <p className="text-[var(--muted-foreground)] text-xs sm:text-sm">{agent.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-normal text-[var(--foreground)] mb-2">İşletme Yönetimi</h2>
            <p className="text-[var(--muted-foreground)]">Müşteri chat sisteminizi yönetin</p>
          </div>

          <Dialog open={isCreateBusinessOpen} onOpenChange={setIsCreateBusinessOpen}>
            <DialogTrigger asChild>

            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni İşletme Oluştur</DialogTitle>
                <DialogDescription>Müşteri chat sistemi için yeni bir işletme profili oluşturun.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="İşletme Adı" value={businessForm.businessName}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })} />
                <Select value={businessForm.businessType} onValueChange={(value) => setBusinessForm({ ...businessForm, businessType: value })}>
                  <SelectTrigger><SelectValue placeholder="İşletme Türü Seçin" /></SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea placeholder="İşletme Açıklaması (Opsiyonel)" value={businessForm.description}
                  onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })} />
                <Textarea placeholder="Hoş Geldin Mesajı" value={businessForm.welcomeMessage}
                  onChange={(e) => setBusinessForm({ ...businessForm, welcomeMessage: e.target.value })} />
                <HighlightButton onClick={createBusiness} className="w-full">İşletme Oluştur</HighlightButton>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {businesses.length === 0 ? (
          <Card className="glassmorphic border-white/10">
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
              <h2 className="text-xl font-normal text-[var(--foreground)] mb-2">Henüz İşletmeniz Yok</h2>
              <p className="text-[var(--muted-foreground)] mb-4">Müşteri chat sistemi kullanmak için bir işletme oluşturun.</p>
              <HighlightButton onClick={() => setIsCreateBusinessOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                İlk İşletmenizi Oluşturun
              </HighlightButton>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sol Panel - İşletme Listesi */}
            <div className="lg:col-span-1">
              <Card className="glassmorphic border-white/10">
                <CardHeader>
                  <CardTitle className="text-[var(--foreground)] font-normal">İşletmelerim</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {businesses.map((business) => (
                    <div key={business.id} className={`p-3 rounded-lg cursor-pointer transition-all ${selectedBusiness?.id === business.id
                      ? 'glassmorphic bg-white/10 border border-white/20'
                      : 'glassmorphic bg-white/5 hover:bg-white/10 border border-transparent'
                      }`} onClick={() => setSelectedBusiness(business)}>
                      <h3 className="text-[var(--foreground)] font-normal">{business.businessName}</h3>
                      <p className="text-[var(--muted-foreground)] text-sm font-light">{business.businessType}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sağ Panel - İşletme Detayları */}
            <div className="lg:col-span-3">
              {selectedBusiness && (
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="glassmorphic bg-white/10 backdrop-blur-sm border-white/20">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-black">
                      <BarChart3 className="w-4 h-4 mr-2" />Genel Bakış
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:text-black">
                      <MessageCircle className="w-4 h-4 mr-2" />Şablonlar
                    </TabsTrigger>
                    <TabsTrigger value="chats" className="data-[state=active]:bg-white data-[state=active]:text-black">
                      <Users className="w-4 h-4 mr-2" />Müşteri Sohbetleri
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-black">
                      <Settings className="w-4 h-4 mr-2" />Ayarlar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <Card className="glassmorphic border-white/10">
                      <CardHeader>
                        <CardTitle className="text-[var(--foreground)] font-normal">İşletme Bilgileri</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[var(--foreground)] text-sm font-medium">İşletme Adı</label>
                            <div className="text-[var(--foreground)] font-normal mt-1">{selectedBusiness.businessName}</div>
                          </div>
                          <div>
                            <label className="text-[var(--foreground)] text-sm font-medium">İşletme Türü</label>
                            <div className="text-[var(--foreground)] font-normal mt-1">{selectedBusiness.businessType}</div>
                          </div>
                        </div>
                        {selectedBusiness.description && (
                          <div>
                            <label className="text-[var(--foreground)] text-sm font-medium">Açıklama</label>
                            <div className="text-[var(--foreground)] font-normal mt-1">{selectedBusiness.description}</div>
                          </div>
                        )}
                        <div>
                          <label className="text-[var(--foreground)] text-sm font-medium">Hoş Geldin Mesajı</label>
                          <div className="text-[var(--foreground)] font-normal mt-1">{selectedBusiness.welcomeMessage}</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glassmorphic border-white/10">
                      <CardHeader>
                        <CardTitle className="text-[var(--foreground)] font-normal">Chat Linki</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                          <LinkIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="text-[var(--foreground)] font-mono text-sm flex-1">
                            {window.location.origin}/chat/{selectedBusiness.chatLinkId}
                          </span>
                          <Button size="sm" variant="ghost" onClick={() => copyChatLink(selectedBusiness.chatLinkId)}
                            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">
                          Bu linki müşterilerinizle paylaşarak chat sisteminizi kullanmalarını sağlayabilirsiniz.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="templates" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-normal text-[var(--foreground)]">Şablonlar</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">{templates.length}/10 şablon kullanıldı</p>
                      </div>
                      <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                        <DialogTrigger asChild>
                          <BasicButton disabled={templates.length >= 10}>
                            Yeni Şablon
                          </BasicButton>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Yeni Şablon Oluştur</DialogTitle>
                            <DialogDescription>Müşterilerinize otomatik cevap verecek şablon oluşturun.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input placeholder="Şablon Başlığı" value={templateForm.title}
                              onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })} />
                            <Input placeholder="Tetikleyici Kelime" value={templateForm.trigger}
                              onChange={(e) => setTemplateForm({ ...templateForm, trigger: e.target.value })} />
                            <Textarea placeholder="Otomatik Cevap" value={templateForm.response}
                              onChange={(e) => setTemplateForm({ ...templateForm, response: e.target.value })} />
                            <Select value={templateForm.category} onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="genel">Genel</SelectItem>
                                <SelectItem value="fiyat">Fiyat</SelectItem>
                                <SelectItem value="randevu">Randevu</SelectItem>
                                <SelectItem value="hizmet">Hizmet</SelectItem>
                                <SelectItem value="iletişim">İletişim</SelectItem>
                              </SelectContent>
                            </Select>
                            <BasicButton onClick={createTemplate} className="w-full">Şablon Oluştur</BasicButton>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-4">
                      {templates.length === 0 ? (
                        <Card className="glassmorphic border-white/10">
                          <CardContent className="p-8 text-center">
                            <MessageCircle className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                            <h3 className="text-lg font-normal text-[var(--foreground)] mb-2">Henüz Şablon Yok</h3>
                            <p className="text-[var(--muted-foreground)] mb-4">Müşterilerinize otomatik cevap vermek için şablon oluşturun.</p>
                            <BasicButton onClick={() => setIsCreateTemplateOpen(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              İlk Şablonunuzu Oluşturun
                            </BasicButton>
                          </CardContent>
                        </Card>
                      ) : (
                        templates.map((template) => (
                          <Card key={template.id} className="glassmorphic backdrop-blur-sm border-white/20">
                            <CardHeader
                              className="cursor-pointer hover:bg-white/5 transition-colors"
                              onClick={() => {
                                const newExpanded = new Set(expandedTemplates);
                                if (newExpanded.has(template.id)) {
                                  newExpanded.delete(template.id);
                                } else {
                                  newExpanded.add(template.id);
                                }
                                setExpandedTemplates(newExpanded);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-white text-lg font-normal">{template.title}</CardTitle>
                                  <CardDescription className="text-white/70 font-light">
                                    Kategori: {template.category} • Kullanım: {template.usageCount}
                                  </CardDescription>
                                </div>
                                <ChevronDown
                                  className={`w-5 h-5 text-white/70 transition-transform ${expandedTemplates.has(template.id) ? 'rotate-180' : ''
                                    }`}
                                />
                              </div>
                            </CardHeader>
                            {expandedTemplates.has(template.id) && (
                              <CardContent className="pt-0">
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-white/80 text-sm font-medium">Anahtar Kelime:</label>
                                    <p className="text-white bg-white/10 p-2 rounded">{template.trigger}</p>
                                  </div>
                                  <div>
                                    <label className="text-white/80 text-sm font-medium">Otomatik Cevap:</label>
                                    <p className="text-white bg-white/10 p-2 rounded">{template.response}</p>
                                  </div>
                                  <div className="flex gap-2">
                                  
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => deleteTemplate(template.id)}
                                    >
                                      Sil
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="chats" className="space-y-6">
                    <h3 className="text-xl font-normal text-[var(--foreground)]">Müşteri Sohbetleri</h3>
                    <div className="space-y-4">
                      {chatSessions.length === 0 ? (
                        <Card className="glassmorphic border-white/10">
                          <CardContent className="p-8 text-center">
                            <Users className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                            <h3 className="text-lg font-normal text-[var(--foreground)] mb-2">Henüz Sohbet Yok</h3>
                            <p className="text-[var(--muted-foreground)]">Müşterileriniz chat linkinizi kullandığında burada görünecek.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        chatSessions.map((session) => (
                          <Card key={session.id} className="glassmorphic backdrop-blur-sm border-white/20">
                            <CardHeader
                              className="cursor-pointer hover:bg-white/5 transition-colors"
                              onClick={() => {
                                const newExpanded = new Set(expandedChats);
                                if (newExpanded.has(session.id)) {
                                  newExpanded.delete(session.id);
                                } else {
                                  newExpanded.add(session.id);
                                }
                                setExpandedChats(newExpanded);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-white text-lg font-normal">
                                    {session.customerName || 'İsimsiz Müşteri'}
                                  </CardTitle>
                                  <CardDescription className="text-white/70">
                                    {session.customerPhone && ` ${session.customerPhone}`}
                                    {session.customerEmail && ` •  ${session.customerEmail}`}
                                    {session.preferredTime && ` • ${session.preferredTime}`}
                                  </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                                    {session.messageCount} mesaj
                                  </Badge>
                                  <ChevronDown
                                    className={`w-5 h-5 text-white/70 transition-transform ${expandedChats.has(session.id) ? 'rotate-180' : ''
                                      }`}
                                  />
                                </div>
                              </div>
                            </CardHeader>
                            {expandedChats.has(session.id) && (
                              <CardContent className="pt-0">
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-white/80 text-sm font-medium">Son Mesaj:</label>
                                    <p className="text-white bg-white/10 p-2 rounded">
                                      {session.lastMessage || 'Henüz mesaj yok'}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-white/20 text-white hover:bg-white/10"
                                      onClick={() => viewChat(session.id)}
                                    >
                                      Sohbeti Görüntüle
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => deleteChat(session.id)}
                                    >
                                      Sohbeti Sil
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <Card className="glassmorphic border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-[var(--foreground)] font-normal">İşletme Ayarları</CardTitle>
                            <CardDescription className="text-[var(--muted-foreground)]">
                              İşletme bilgilerinizi ve chat ayarlarınızı yönetin.
                            </CardDescription>
                          </div>
                          <Button onClick={() => setIsEditingBusiness(!isEditingBusiness)} variant="outline" className="border-white/20">
                            <Edit className="w-4 h-4 mr-2" />
                            {isEditingBusiness ? 'İptal' : 'Düzenle'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isEditingBusiness ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[var(--foreground)] text-sm font-medium">İşletme Adı</label>
                                <Input value={editBusinessForm.businessName}
                                  onChange={(e) => setEditBusinessForm({ ...editBusinessForm, businessName: e.target.value })}
                                  className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" />
                              </div>
                              <div>
                                <label className="text-[var(--foreground)] text-sm font-medium">İşletme Türü</label>
                                <Select value={editBusinessForm.businessType}
                                  onValueChange={(value) => setEditBusinessForm({ ...editBusinessForm, businessType: value })}>
                                  <SelectTrigger className="bg-white/5 border-white/20 mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {businessTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[var(--foreground)] text-sm font-medium">İşletme Açıklaması</label>
                              <Textarea value={editBusinessForm.description}
                                onChange={(e) => setEditBusinessForm({ ...editBusinessForm, description: e.target.value })}
                                className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" rows={2} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[var(--foreground)] text-sm font-medium">Adres (Opsiyonel)</label>
                                <Input placeholder="İşletme adresi" value={editBusinessForm.address}
                                  onChange={(e) => setEditBusinessForm({ ...editBusinessForm, address: e.target.value })}
                                  className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" />
                              </div>
                              <div>
                                <label className="text-[var(--foreground)] text-sm font-medium">Telefon (Opsiyonel)</label>
                                <Input placeholder="Telefon numarası" value={editBusinessForm.phone}
                                  onChange={(e) => setEditBusinessForm({ ...editBusinessForm, phone: e.target.value })}
                                  className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[var(--foreground)] text-sm font-medium">Instagram (Opsiyonel)</label>
                                <Input placeholder="@kullaniciadi" value={editBusinessForm.instagram}
                                  onChange={(e) => setEditBusinessForm({ ...editBusinessForm, instagram: e.target.value })}
                                  className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" />
                              </div>
                              <div>
                                <label className="text-[var(--foreground)] text-sm font-medium">Website (Opsiyonel)</label>
                                <Input placeholder="https://example.com" value={editBusinessForm.website}
                                  onChange={(e) => setEditBusinessForm({ ...editBusinessForm, website: e.target.value })}
                                  className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" />
                              </div>
                            </div>

                            <div>
                              <label className="text-[var(--foreground)] text-sm font-medium">İşletme Logosu (Opsiyonel)</label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input placeholder="Logo URL" value={editBusinessForm.logo}
                                  onChange={(e) => setEditBusinessForm({ ...editBusinessForm, logo: e.target.value })}
                                  className="bg-white/5 border-white/20 text-[var(--foreground)]" />
                                <Button size="sm" variant="outline" className="border-white/20">
                                  <Upload className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[var(--foreground)] text-sm font-medium">Hoş Geldin Mesajı</label>
                              <Textarea value={editBusinessForm.welcomeMessage}
                                onChange={(e) => setEditBusinessForm({ ...editBusinessForm, welcomeMessage: e.target.value })}
                                className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" rows={3} />
                            </div>

                            <div>
                              <label className="text-[var(--foreground)] text-sm font-medium">Arkaplan Fotoğrafı</label>
                              <div className="grid grid-cols-3 gap-4">
                                {backgroundPhotos.map((photo) => (
                                  <div
                                    key={photo.id}
                                    className={`cursor-pointer rounded-lg overflow-hidden border-2 ${selectedBackground === photo.id ? 'border-purple-500' : 'border-gray-200'
                                      }`}
                                    onClick={() => setSelectedBackground(photo.id)}
                                  >
                                    <img
                                      src={photo.src}
                                      alt={photo.name}
                                      className="w-full h-24 object-cover"
                                    />
                                    <p className="text-sm text-center p-2">{photo.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-[var(--foreground)] text-sm font-medium">Renk Teması</label>
                              <div className="grid grid-cols-5 gap-2 mt-2">
                                {colorThemes.map((theme) => (
                                  <div
                                    key={theme.id}
                                    className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${selectedColorTheme === theme.id
                                      ? 'border-purple-500 bg-purple-500/10'
                                      : 'border-white/20 hover:border-white/40'
                                      }`}
                                    onClick={() => {
                                      setSelectedColorTheme(theme.id);
                                      setEditBusinessForm({ ...editBusinessForm, colorTheme: theme.id });
                                    }}
                                  >
                                    <div className="flex gap-1 mb-1">
                                      {theme.colors.map((color, index) => (
                                        <div key={index} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                      ))}
                                    </div>
                                    <p className="text-xs text-center text-[var(--foreground)]">{theme.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <BasicButton onClick={updateBusiness}>Kaydet</BasicButton>
                              <Button onClick={() => setIsEditingBusiness(false)} variant="outline" className="border-white/20">
                                İptal
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[var(--foreground)] text-sm font-medium">İşletme Adı</label>
                                <Input value={selectedBusiness.businessName} className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" readOnly />
                              </div>
                              <div>
                                <label className="text-[var(--foreground)] text-sm font-medium">İşletme Türü</label>
                                <Input value={selectedBusiness.businessType} className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" readOnly />
                              </div>
                            </div>
                            <div>
                              <label className="text-[var(--foreground)] text-sm font-medium">İşletme Açıklaması</label>
                              <Textarea value={selectedBusiness.description || 'Açıklama eklenmemiş'}
                                className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" readOnly rows={2} />
                            </div>
                            <div>
                              <label className="text-[var(--foreground)] text-sm font-medium">Hoş Geldin Mesajı</label>
                              <Textarea value={selectedBusiness.welcomeMessage}
                                className="bg-white/5 border-white/20 text-[var(--foreground)] mt-1" readOnly rows={3} />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        )}
        {/* Chat Modal */}
        <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] glassmorphic">
            <DialogHeader>
              <DialogTitle className='font-normal'>
                Sohbet - {selectedChatSession?.customerName || 'İsimsiz Müşteri'}
              </DialogTitle>
              <DialogDescription>
                {selectedChatSession?.customerPhone && ` ${selectedChatSession.customerPhone}`}
                {selectedChatSession?.customerEmail && ` • ${selectedChatSession.customerEmail}`}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-4 p-4 glassmorphic rounded-lg">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Henüz mesaj yok
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderType === 'customer'
                          ? 'bg-white text-black'
                          : 'bg-purple-500 text-white border'
                        }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => setIsChatModalOpen(false)} variant="outline">
                Kapat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

    </div>

  );
}