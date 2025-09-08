import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useAuthContext } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Plus, 
  MessageCircle, 
  Users, 
  Settings, 
  Edit, 
  Trash2, 
  Copy,
  ExternalLink,
  BarChart3,
  Clock,
  Star
} from 'lucide-react';

interface Business {
  id: string;
  businessName: string;
  businessType: string;
  description?: string;
  chatLinkId: string;
  welcomeMessage: string;
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
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  sessionToken: string;
  isActive: boolean;
  lastActivityAt: string;
  createdAt: string;
}

export default function BusinessManagement() {
  const [match, params] = useRoute('/agent/:id/business-chat');
  const agentId = params?.id;
  
  // AuthContext'ten user almaya çalış
  const { user } = useAuthContext();
  
  // Eğer user yoksa localStorage'dan al
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateBusinessOpen, setIsCreateBusinessOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);

  // Form states
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    businessType: '',
    description: '',
    welcomeMessage: 'Merhaba! Size nasıl yardımcı olabilirim?'
  });

  const [templateForm, setTemplateForm] = useState({
    title: '',
    trigger: '',
    response: '',
    category: 'genel'
  });

  // İşletme edit formu
  const [editBusinessForm, setEditBusinessForm] = useState({
    businessName: '',
    businessType: '',
    description: '',
    welcomeMessage: ''
  });

  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  const businessTypes = [
    'Kuaför', 'Berber', 'Güzellik Salonu', 'Restoran', 'Kafe', 'Veteriner', 
    'Diş Hekimi', 'Doktor', 'Avukat', 'Muhasebeci', 'Emlak', 'Oto Servis',
    'Temizlik', 'Nakliyat', 'Eğitim', 'Spor Salonu', 'Eczane', 'Diğer'
  ];

  const templateCategories = [
    'genel', 'randevu', 'fiyat', 'hizmetler', 'iletişim', 'çalışma-saatleri', 'konum', 'diğer'
  ];

  useEffect(() => {
    // AuthContext'ten user gelirse onu kullan
    if (user?.id) {
      console.log('🔍 User from AuthContext:', user);
      setCurrentUser(user);
    } else {
      // localStorage'dan user bilgisini al
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('🔍 User from localStorage:', parsedUser);
        setCurrentUser(parsedUser);
      } else {
        console.log('🔍 No user found in localStorage');
      }
    }
  }, [user]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserBusinesses();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchBusinessTemplates();
      fetchBusinessChatSessions();
      // Edit formunu doldur
      setEditBusinessForm({
        businessName: selectedBusiness.businessName,
        businessType: selectedBusiness.businessType,
        description: selectedBusiness.description || '',
        welcomeMessage: selectedBusiness.welcomeMessage
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

  const updateBusiness = async () => {
    if (!selectedBusiness) return;
    
    try {
      const response = await fetch(`/api/business-chat/business/${selectedBusiness.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: editBusinessForm.businessName,
          businessType: editBusinessForm.businessType,
          description: editBusinessForm.description,
          welcomeMessage: editBusinessForm.welcomeMessage
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUserBusinesses();
        setIsEditingBusiness(false);
        // Güncellenen işletmeyi selectedBusiness olarak ayarla
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
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchBusinessChatSessions = async () => {
    if (!selectedBusiness) return;
    try {
      const response = await fetch(`/api/business-chat/business/${selectedBusiness.id}/sessions`);
      const data = await response.json();
      if (data.success) {
        setChatSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const createBusiness = async () => {
    console.log('🔍 Current User:', currentUser);
    console.log('🔍 Agent ID:', agentId);
    
    if (!currentUser?.id) {
      alert('Kullanıcı bilgisi bulunamadı. Lütfen sayfayı yenileyin.');
      return;
    }
    
    try {
      const response = await fetch('/api/business-chat/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          businessName: businessForm.businessName,
          businessType: businessForm.businessType,
          description: businessForm.description,
          welcomeMessage: businessForm.welcomeMessage
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUserBusinesses();
        setBusinessForm({
          businessName: '',
          businessType: '',
          description: '',
          welcomeMessage: 'Merhaba! Size nasıl yardımcı olabilirim?'
        });
        setIsCreateBusinessOpen(false);
      } else {
        console.error('Business creation failed:', data.error);
        alert('İşletme oluşturulamadı: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating business:', error);
      alert('Bir hata oluştu');
    }
  };

  const createTemplate = async () => {
    if (!selectedBusiness) return;
    try {
      const response = await fetch('/api/business-chat/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          ...templateForm
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchBusinessTemplates();
        setTemplateForm({
          title: '',
          trigger: '',
          response: '',
          category: 'genel'
        });
        setIsCreateTemplateOpen(false);
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/business-chat/template/${templateId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchBusinessTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Toast notification ekle
  };

  const getCustomerChatUrl = (chatLinkId: string) => {
    return `${window.location.origin}/chat/${chatLinkId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">İşletme Yönetimi</h1>
            <p className="text-gray-600 dark:text-gray-300">Müşteri chat sisteminizi yönetin</p>
          </div>
          
          <Dialog open={isCreateBusinessOpen} onOpenChange={setIsCreateBusinessOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Yeni İşletme
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni İşletme Oluştur</DialogTitle>
                <DialogDescription>
                  Müşteri chat sistemi için yeni bir işletme profili oluşturun.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="İşletme Adı"
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm({...businessForm, businessName: e.target.value})}
                />
                <Select value={businessForm.businessType} onValueChange={(value) => setBusinessForm({...businessForm, businessType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="İşletme Türü Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="İşletme Açıklaması (Opsiyonel)"
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm({...businessForm, description: e.target.value})}
                />
                <Textarea
                  placeholder="Hoş Geldin Mesajı"
                  value={businessForm.welcomeMessage}
                  onChange={(e) => setBusinessForm({...businessForm, welcomeMessage: e.target.value})}
                />
                <Button onClick={createBusiness} className="w-full">
                  İşletme Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {businesses.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Henüz İşletmeniz Yok</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Müşteri chat sistemi kullanmak için bir işletme oluşturun.</p>
              <Button onClick={() => setIsCreateBusinessOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                İlk İşletmenizi Oluşturun
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sol Panel - İşletme Listesi */}
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">İşletmelerim</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedBusiness?.id === business.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
                      }`}
                      onClick={() => setSelectedBusiness(business)}
                    >
                      <h3 className="text-gray-900 dark:text-white font-medium">{business.businessName}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{business.businessType}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sağ Panel - İşletme Detayları */}
            <div className="lg:col-span-3">
              {selectedBusiness && (
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Genel Bakış
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Şablonlar
                    </TabsTrigger>
                    <TabsTrigger value="chats" className="data-[state=active]:bg-purple-600">
                      <Users className="w-4 h-4 mr-2" />
                      Müşteri Sohbetleri
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
                      <Settings className="w-4 h-4 mr-2" />
                      Ayarlar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-200 text-sm">Aktif Şablonlar</p>
                              <p className="text-2xl font-bold text-white">{templates.filter(t => t.isActive).length}</p>
                            </div>
                            <MessageCircle className="w-8 h-8 text-purple-400" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-200 text-sm">Toplam Sohbet</p>
                              <p className="text-2xl font-bold text-white">{chatSessions.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-purple-400" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-200 text-sm">Toplam Kullanım</p>
                              <p className="text-2xl font-bold text-white">
                                {templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)}
                              </p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-purple-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white">Müşteri Chat Linki</CardTitle>
                        <CardDescription className="text-purple-200">
                          Bu linki müşterilerinizle paylaşın
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={getCustomerChatUrl(selectedBusiness.chatLinkId)}
                            readOnly
                            className="bg-white/5 border-white/20 text-white"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(getCustomerChatUrl(selectedBusiness.chatLinkId))}
                            className="border-white/20 hover:bg-white/10"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(getCustomerChatUrl(selectedBusiness.chatLinkId), '_blank')}
                            className="border-white/20 hover:bg-white/10"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="templates" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white">Şablon Yönetimi</h2>
                      <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Şablon
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Yeni Şablon Oluştur</DialogTitle>
                            <DialogDescription>
                              Müşteri mesajlarına otomatik cevap verecek şablon oluşturun.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Şablon Başlığı"
                              value={templateForm.title}
                              onChange={(e) => setTemplateForm({...templateForm, title: e.target.value})}
                            />
                            <Input
                              placeholder="Anahtar Kelime (örn: randevu, fiyat)"
                              value={templateForm.trigger}
                              onChange={(e) => setTemplateForm({...templateForm, trigger: e.target.value})}
                            />
                            <Select value={templateForm.category} onValueChange={(value) => setTemplateForm({...templateForm, category: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Kategori Seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {templateCategories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Textarea
                              placeholder="Otomatik Cevap Mesajı"
                              value={templateForm.response}
                              onChange={(e) => setTemplateForm({...templateForm, response: e.target.value})}
                              rows={4}
                            />
                            <Button onClick={createTemplate} className="w-full">
                              Şablon Oluştur
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <Card key={template.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-white text-lg">{template.title}</CardTitle>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="bg-purple-600/50">
                                  {template.category}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTemplate(template.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <CardDescription className="text-purple-200">
                              Anahtar: <span className="font-mono bg-purple-600/30 px-2 py-1 rounded">{template.trigger}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-white mb-3">{template.response}</p>
                            <div className="flex items-center justify-between text-sm text-purple-200">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1" />
                                {template.usageCount || 0} kullanım
                              </div>
                              {template.lastUsedAt && (
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {new Date(template.lastUsedAt).toLocaleDateString('tr-TR')}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="chats" className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Müşteri Sohbetleri</h2>
                    <div className="space-y-4">
                      {chatSessions.map((session) => (
                        <Card key={session.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-white font-medium">
                                  {session.customerName || 'Anonim Müşteri'}
                                </h3>
                                <p className="text-purple-200 text-sm">
                                  {session.customerPhone && `Tel: ${session.customerPhone}`}
                                  {session.customerEmail && ` • Email: ${session.customerEmail}`}
                                </p>
                                <p className="text-purple-200 text-xs">
                                  Son aktivite: {new Date(session.lastActivityAt).toLocaleString('tr-TR')}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                className="border-white/20 hover:bg-white/10"
                                onClick={() => {
                                  // TODO: Sohbet detaylarını göster
                                  console.log('Show chat details for:', session.id);
                                }}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Sohbeti Gör
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-gray-900 dark:text-white">İşletme Ayarları</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                              İşletme bilgilerinizi ve chat ayarlarınızı yönetin.
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => setIsEditingBusiness(!isEditingBusiness)}
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {isEditingBusiness ? 'İptal' : 'Düzenle'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isEditingBusiness ? (
                          // Edit Mode
                          <>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">İşletme Adı</label>
                              <Input
                                value={editBusinessForm.businessName}
                                onChange={(e) => setEditBusinessForm({...editBusinessForm, businessName: e.target.value})}
                                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">İşletme Türü</label>
                              <Select 
                                value={editBusinessForm.businessType} 
                                onValueChange={(value) => setEditBusinessForm({...editBusinessForm, businessType: value})}
                              >
                                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {businessTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">İşletme Açıklaması</label>
                              <Textarea
                                value={editBusinessForm.description}
                                onChange={(e) => setEditBusinessForm({...editBusinessForm, description: e.target.value})}
                                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">Hoş Geldin Mesajı</label>
                              <Textarea
                                value={editBusinessForm.welcomeMessage}
                                onChange={(e) => setEditBusinessForm({...editBusinessForm, welcomeMessage: e.target.value})}
                                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">Chat Link ID</label>
                              <Input
                                value={selectedBusiness.chatLinkId}
                                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 mt-1"
                                readOnly
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chat Link ID değiştirilemez</p>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button onClick={updateBusiness} className="bg-blue-600 hover:bg-blue-700">
                                Kaydet
                              </Button>
                              <Button 
                                onClick={() => setIsEditingBusiness(false)} 
                                variant="outline"
                                className="border-gray-300 dark:border-gray-600"
                              >
                                İptal
                              </Button>
                            </div>
                          </>
                        ) : (
                          // View Mode
                          <>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">İşletme Adı</label>
                              <Input
                                value={selectedBusiness.businessName}
                                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">İşletme Türü</label>
                              <Input
                                value={selectedBusiness.businessType}
                                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">İşletme Açıklaması</label>
                              <Textarea
                                value={selectedBusiness.description || 'Açıklama eklenmemiş'}
                                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                                readOnly
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">Hoş Geldin Mesajı</label>
                              <Textarea
                                value={selectedBusiness.welcomeMessage}
                                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                                readOnly
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-gray-900 dark:text-white text-sm font-medium">Chat Link ID</label>
                              <Input
                                value={selectedBusiness.chatLinkId}
                                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mt-1"
                                readOnly
                              />
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
      </div>
    </div>
  );
} 