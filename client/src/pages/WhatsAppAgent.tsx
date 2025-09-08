import React, { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, MessageCircle, QrCode, Settings, Trash2, Send, Plus, Phone, CheckCircle, XCircle, Loader2, AlertCircle, Zap, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import HighlightButton from '@/components/ui/highlight-button';
import BasicButton from '@/components/ui/basic-button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface WhatsAppTemplate {
  id: string;
  trigger: string;
  response: string;
  userId: string;
}

interface BotStatus {
  isConnected: boolean;
  phoneNumber?: string;
  qrCode?: string;
  pairingCode?: string;
  connectionStatus: string;
}

const MAX_TEMPLATES = 10;

export default function WhatsAppAgent() {
  const [match, params] = useRoute("/agent/:id/whatsapp");
  const agentId = params?.id;
  const { t } = useLanguage();

  // Agent ID yoksa yönlendirme yap
  if (!agentId) {
    return (
      <div className="min-h-screen py-20 bg-[var(--light-gray)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">{t("whatsapp.agentNotFound")}</h2>
            <p className="text-gray-600 mb-8">{t("whatsapp.agentNotFoundDesc")}</p>
            <Link href="/my-agents">
              <BasicButton>{t("whatsapp.goToMyAgents")}</BasicButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [botStatus, setBotStatus] = useState<BotStatus>({ isConnected: false, connectionStatus: 'disconnected' });
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [usePairingCode, setUsePairingCode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  
  // Agent bilgileri için state ekle
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(true);

  const userId = localStorage.getItem("userId") || "b682763a-1412-4463-8be5-e01d3a7cb265";

  // Agent bilgilerini yükle
  const loadAgentInfo = async () => {
    try {
      setAgentLoading(true);
      const response = await fetch(`/api/whatsapp/agent/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAgentInfo(data.data);
      }
    } catch (error) {
      console.error('Error loading agent info:', error);
    } finally {
      setAgentLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      loadAgentInfo();
      loadBotStatus();
      loadTemplates();
    }
  }, [agentId]);

const loadBotStatus = async () => {
  try {
    const response = await fetch(`/api/whatsapp/status?userId=${userId}`);
    const data = await response.json();
    console.log('📊 Bot status response:', data);
    
    if (data.success) {
      setBotStatus(data.data);
      
      // If QR code is available, show it
      if (data.data.qrCode && !data.data.isConnected) {
        console.log('📱 Setting QR code:', data.data.qrCode.substring(0, 50) + '...');
        setQrCode(data.data.qrCode);
        setPairingCode(null);
      } 
      // If pairing code is available, show it
      else if (data.data.pairingCode && !data.data.isConnected) {
        console.log('🔑 Setting pairing code:', data.data.pairingCode);
        setPairingCode(data.data.pairingCode);
        setQrCode(null);
      } 
      // If connected, clear both
      else if (data.data.isConnected) {
        console.log('✅ Bot connected, clearing codes');
        setQrCode(null);
        setPairingCode(null);
      }
    }
  } catch (error) {
    console.error('Error loading bot status:', error);
  }
};

const loadTemplates = async () => {
  try {
    console.log('🔄 Loading templates for userId:', userId);
    const response = await fetch(`/api/whatsapp/templates?userId=${userId}`);
    const data = await response.json();
    console.log('📡 Templates API response:', data);
    
    if (data.success) {
      setTemplates(data.data.templates);
      console.log('✅ Templates loaded:', data.data.templates.length);
    } else {
      console.error('❌ Templates API error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error loading templates:', error);
  }
};
const connectBot = async () => {
  setIsConnecting(true);
  setQrCode(null);
  setPairingCode(null);
  
  try {
    console.log('🔄 Connecting WhatsApp bot...');

    // Start polling for status immediately to capture QR as soon as it appears
    let pollCount = 0;
    const maxPolls = 60; // 2 dakika
    const pollInterval = setInterval(async () => {
      pollCount++;
      const currentResponse = await fetch(`/api/whatsapp/status?userId=${userId}`, { cache: 'no-store' as RequestCache });
      const currentData = await currentResponse.json();
      console.log('📊 Status response:', currentData);
      if (currentData.success) {
        const status = currentData.data;
        setBotStatus(status);
        if (status.isConnected) {
          console.log('✅ Bot connected!');
          clearInterval(pollInterval);
          setQrCode(null);
          setPairingCode(null);
          setIsConnecting(false);
        } else if (status.qrCode && status.connectionStatus === 'qr_generated') {
          console.log('📱 QR Code received:', status.qrCode.substring(0, 50) + '...');
          setQrCode(status.qrCode);
        }
      }
      if (pollCount >= maxPolls) {
        console.log('⏰ Polling timeout');
        clearInterval(pollInterval);
        setIsConnecting(false);
      }
    }, 2000);

    const response = await fetch('/api/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId, 
        resetSession: true
      })
    });
    
    const data = await response.json();
    console.log('📡 Connect response:', data);
    
    if (!data.success) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Error connecting bot:', error);
    alert(t("whatsapp.connectionError") + ': ' + error);
    setIsConnecting(false);
  }
};
// ... existing code ...

  const disconnectBot = async () => {
    try {
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBotStatus({ isConnected: false, connectionStatus: 'disconnected' });
        setQrCode(null);
        alert(t("whatsapp.botdisconnected"));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error disconnecting bot:', error);
      alert(t("whatsapp.disconnectError") + ': ' + error);
    }
  };

  const addTemplate = async () => {
    if (!newTrigger.trim() || !newResponse.trim()) {
      alert(t("whatsapp.templateRequired"));
      return;
    }

    if (templates.length >= MAX_TEMPLATES) {
      alert(t("whatsapp.templateLimit"));
      return;
    }

    setIsAddingTemplate(true);

    try {
      const response = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, trigger: newTrigger.trim(), response: newResponse.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setTemplates([...templates, data.data]);
        setNewTrigger('');
        setNewResponse('');
        alert(t("whatsapp.templateAdded"));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error adding template:', error);
      alert(t("whatsapp.templateAddError") + ': ' + error);
    } finally {
      setIsAddingTemplate(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm(t("whatsapp.deleteTemplateConfirm"))) {
      return;
    }

    try {
      const response = await fetch(`/api/whatsapp/templates/${templateId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(templates.filter(t => t.id !== templateId));
        alert(t("whatsapp.templateDeleted"));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert(t("whatsapp.templateDeleteError") + ': ' + error);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone.trim() || !testMessage.trim()) {
      alert(t("whatsapp.testMessageRequired"));
      return;
    }

    setIsSendingTest(true);

    try {
      const response = await fetch('/api/whatsapp/test-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phoneNumber: testPhone, message: testMessage })
      });

      const data = await response.json();

      if (data.success) {
        alert(t("whatsapp.testMessageSent"));
        setTestPhone('');
        setTestMessage('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      alert(t("whatsapp.testMessageError") + ': ' + error);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-[var(--light-gray)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/my-agents">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-3xl font-normal text-[var(--dark-purple)]">
                  {t("whatsapp.title")}
                </h1>
                <p className="text-[var(--muted-foreground)] text-xs sm:text-sm">
                  {t("whatsapp.subtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>
         {/* Nasıl Çalışır - Accordion */}
         <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="how-it-works" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-4 px-1 rounded-xl text-[var(--dark-purple)] text-xl font-normal [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-2">
                      {t("whatsapp.howItWorks")}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-3">
                    <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-[var(--dark-purple)] text-xl font-normal flex-shrink-0 flex items-center justify-center">
                          1
                        </div>
                        <p>{t("whatsapp.step1")}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-[var(--dark-purple)] text-xl font-normal flex-shrink-0 flex items-center justify-center">
                          2
                        </div>
                        <p>{t("whatsapp.step2")}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-[var(--dark-purple)] text-xl font-normal flex-shrink-0 flex items-center justify-center">
                          3
                        </div>
                        <p>{t("whatsapp.step3")}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-[var(--dark-purple)] text-xl font-normal flex-shrink-0 flex items-center justify-center">
                          4
                        </div>
                        <p>{t("whatsapp.step4")}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>


     {/* Connection Status & Actions */}
<div className="glassmorphic rounded-xl p-4 mb-6 border border-white/10">
  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
    {/* Sol taraf - Durum ve Butonlar */}
    <div className="flex flex-row items-center gap-3 flex-shrink-0 w-full lg:w-auto">
      {/* Bağlantı Durumu */}
      <div className="flex items-center text-sm gap-2 px-3 py-2 rounded-lg">
        {botStatus.isConnected ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-400 font-medium">{t("whatsapp.connected")}</span>
            {botStatus.phoneNumber && (
              <span className="text-sm text-[var(--muted-foreground)] ml-2">
                +{botStatus.phoneNumber}
              </span>
            )}
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-400 font-normal">
              {isConnecting ? t("whatsapp.connecting") : t("whatsapp.disconnected")}
            </span>
          </>
        )}
      </div>

      {/* Ana Butonlar */}
      {!botStatus.isConnected ? (
        <HighlightButton
          onClick={connectBot}
          disabled={isConnecting}
          className="text-sm"
        >
          {isConnecting ? t("whatsapp.connecting") : t("whatsapp.connectBot")}
        </HighlightButton>
      ) : (
        <button
          onClick={disconnectBot}
          className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-lg text-sm border transition-all duration-200"
        >
          <span className="flex items-center">
            <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {t("whatsapp.disconnect")}
          </span>
        </button>
      )}
    </div>

    {/* Sağ taraf - İstatistikler */}
    <div className="flex-1 min-w-0 w-full lg:w-auto">
      <div className="flex flex-row items-center gap-4">
        <span className="text-sm text-[var(--foreground)]">
          {t("whatsapp.templates")}: {templates.length}/{MAX_TEMPLATES}
        </span>
      </div>
    </div>
  </div>
</div>


        {/* QR Code Section */}
        {qrCode && (
          <Card className="glassmorphic border-white/10 mb-6">
            <CardHeader className="pb-4 font-normal">
              <CardTitle className="flex items-center gap-2 text-[var(--dark-purple)] font-normal text-xl">
                <QrCode className="w-5 h-5" />
                {t("whatsapp.qrCodeTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                    alt="WhatsApp QR Code"
                    className="w-48 h-48"
                    onLoad={() => console.log('📱 QR code image loaded')}
                    onError={(e) => console.error('❌ QR code image error:', e)}
                  />
                </div>
                <div className="text-center">
                  <p className="text-m text-[var(--muted-foreground)] mb-2 font-light ">
                    {t("whatsapp.qrCodeDescription")}
                  </p>
                  <Badge variant="outline" className="text-md font-light text-gray-400">
                    {t("whatsapp.qrCodeSteps")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pairing Code Section */}
        {pairingCode && (
          <Card className="glassmorphic border-white/10 mb-6">
            <CardHeader className="pb-4 font-normal">
              <CardTitle className="flex items-center gap-2 text-[var(--dark-purple)] font-normal text-xl">
                <Phone className="w-5 h-5" />
                Eşleştirme Kodu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-white tracking-wider">
                      {pairingCode}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-m text-[var(--muted-foreground)] mb-2 font-light">
                    Bu kodu WhatsApp uygulamanızda "Bağlı cihazlar" - "Cihaz bağla" bölümünde girin
                  </p>
                  <Badge variant="outline" className="text-md font-light text-gray-400">
                    1. WhatsApp&apos;ı açın &gt; 2. Ayarlar &gt; 3. Bağlı cihazlar &gt; 4. Cihaz bağla &gt; 5. Kodu girin
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Template Yönetimi */}
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white font-normal">
                <Settings className="w-5 h-5" />
                {t("whatsapp.templateManagement")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Yeni Template Ekleme */}
              <div className="space-y-3 p-4 rounded-lg border border-white/10">
                <h4 className="font-normal text-m text-white">{t("whatsapp.addNewTemplate")}</h4>
                <Input
                  placeholder={t("whatsapp.triggerPlaceholder")}
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className=" border-white/20 text-[var(--foreground)]"
                />
                <Textarea
                  placeholder={t("whatsapp.responsePlaceholder")}
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="border-white/20 text-[var(--foreground)] min-h-[80px]"
                />
                <BasicButton
                  onClick={addTemplate}
                  disabled={isAddingTemplate || !newTrigger.trim() || !newResponse.trim() || templates.length >= MAX_TEMPLATES}
                  className="w-full"
                >
                
                  {t("whatsapp.addTemplate")}
                </BasicButton>
                {templates.length >= MAX_TEMPLATES && (
                  <p className="text-xs text-orange-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t("whatsapp.templateLimitReached").replace("{max}", MAX_TEMPLATES.toString())}                  </p>
                )}
              </div>

              {/* Mevcut Template'ler */}
              <div className="space-y-3">
                <h4 className="font-normal text-2xl text-[var(--foreground)]">
                  {t("whatsapp.existingTemplates")} ({templates.length}/{MAX_TEMPLATES})
                </h4>
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-[var(--muted-foreground)]">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t("whatsapp.noTemplates")}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {templates.map((template) => (
                      <div key={template.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {template.trigger}
                              </Badge>
                            </div>
                            <p className="text-sm text-[var(--foreground)] break-words">
                              {template.response}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTemplate(template.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/20 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test & İstatistikler */}
          <div className="space-y-6">
            {/* Test Mesajı */}
            <Card className="border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white font-normal">
                  <Send className="w-5 h-5" />
                  {t("whatsapp.sendTestMessage")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder={t("whatsapp.phonePlaceholder")}
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className=" border-white/20 text-[var(--foreground)]"
                />
                <Textarea
                  placeholder={t("whatsapp.messagePlaceholder")}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className=" border-white/20 text-[var(--foreground)]"
                />
                <BasicButton
                  onClick={sendTestMessage}
                  disabled={isSendingTest || !botStatus.isConnected || !testPhone.trim() || !testMessage.trim()}
                  className="w-full"
                >
               
                  {t("whatsapp.sendTestMessage")}
                </BasicButton>
                {!botStatus.isConnected && (
                  <p className="text-xs text-orange-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t("whatsapp.connectFirst")}
                  </p>
                )}
              </CardContent>
            </Card>

           
          </div>
        </div>
      </div>
    </div>
  );
}