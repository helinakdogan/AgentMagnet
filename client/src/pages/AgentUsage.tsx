import { useState, useEffect } from "react";
import axios from "axios";
import { useRoute } from "wouter";

interface SummaryResponse {
  summary: string[];
  dailyUsage: {
    currentCount: number;
    maxLimit: number;
    remainingCount: number;
    resetDate: string;
  };
}

const AgentUsage: React.FC = () => {
  const [match, params] = useRoute<{ id: string }>("/agent/:id/usage");
  const [summary, setSummary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [resetDate, setResetDate] = useState<string>('');

  const userId = localStorage.getItem("userId") || "demo-user";

  // 🆕 Sayfa yüklendiğinde mevcut kullanım bilgisini al
  useEffect(() => {
    const fetchCurrentUsage = async () => {
      try {
        const res = await axios.post<SummaryResponse>("/api/gmail/summary", { 
          userId,
          agentId: 'gmail-agent', // Gmail agent ID'si
          checkOnly: true // Sadece kullanım bilgisini al, özetleme yapma
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (res.data.dailyUsage) {
          setDailyUsage(res.data.dailyUsage.currentCount);
          setDailyLimit(res.data.dailyUsage.maxLimit);
          setResetDate(res.data.dailyUsage.resetDate);
        }
      } catch (error) {
        console.log('Kullanım bilgisi alınamadı, varsayılan değerler kullanılıyor');
      }
    };

    fetchCurrentUsage();
  }, [userId]);

  // 🆕 Limit dolunca alert göster
  useEffect(() => {
    if (dailyUsage >= dailyLimit && dailyLimit > 0) {
      // Sweet Alert benzeri custom alert
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      alertDiv.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
          <div class="text-red-500 text-4xl mb-4">🚫</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Günlük Limit Doldu!</h3>
          <p class="text-gray-600 mb-4">
            Bugün maksimum ${dailyLimit} özetleme yapabilirsiniz.<br>
            Yarın tekrar deneyin!
          </p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="bg-red-500 text-white px-4 py-600 transition-colors">
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

const handleSummarize = async () => {
  setLoading(true);
  setLimitReached(false);
  setSummary([]); // Önceki sonuçları temizle

  try {
    const res = await axios.post<SummaryResponse>("/api/gmail/summary", { 
      userId,
      agentId: 'gmail-agent' // Gmail agent ID'si
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("📦 Tam yanıt:", res.data);
    
    if (!res.data?.summary || res.data.summary.length === 0) {
      throw new Error("Boş özet döndü");
    }

    setSummary(res.data.summary);
    
    // 🆕 Backend'den gelen güncel kullanım bilgisini güncelle
    if (res.data.dailyUsage) {
      setDailyUsage(res.data.dailyUsage.currentCount);
      setDailyLimit(res.data.dailyUsage.maxLimit);
      setResetDate(res.data.dailyUsage.resetDate);
    }
    
  } catch (err: unknown) {
    console.error("❌ Özet çıkarma hatası:", err);
    
    if (axios.isAxiosError(err)) {
      console.error("Backend hatası:", err.response?.data);
      
      // 🆕 Limit hatası kontrolü
      if (err.response?.status === 429) {
        setLimitReached(true);
        setSummary([`Günlük limit doldu: ${err.response?.data?.message || 'Maksimum 5 özetleme/gün'}`]);
      } else {
        setSummary([`Hata: ${err.response?.data?.message || err.message}`]);
      }
    } else {
      setSummary([`Beklenmeyen hata: ${(err as Error).message}`]);
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-[var(--dark-purple)]">📬 Gmail Özeti</h1>

      {/* 🆕 Günlük Kullanım Bilgisi */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Günlük Özetleme Limiti</h3>
            <p className="text-sm text-blue-700">
              Kullanım: {dailyUsage}/{dailyLimit} özetleme
            </p>
            {resetDate && (
              <p className="text-xs text-blue-600 mt-1">
                Reset: {new Date(resetDate).toLocaleDateString('tr-TR')}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${dailyLimit - dailyUsage > 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {Math.max(0, dailyLimit - dailyUsage)}
            </div>
            <div className="text-xs text-blue-500">
              {dailyLimit - dailyUsage > 0 ? 'kaldı' : 'limit doldu'}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              dailyUsage >= dailyLimit ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min((dailyUsage / dailyLimit) * 100, 100)}%` }}
          ></div>
        </div>
        
        {/* 🆕 Kalan Hak Uyarısı */}
        {dailyLimit - dailyUsage <= 2 && dailyLimit - dailyUsage > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ Dikkat: Sadece {dailyLimit - dailyUsage} özetleme hakkınız kaldı!
          </div>
        )}
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading || dailyUsage >= dailyLimit}
        className="btn-gradient px-6 py-3 rounded-xl mb-6 disabled:opacity-50"
      >
        {loading ? "Yükleniyor..." : dailyUsage >= dailyLimit ? "Günlük Limit Doldu" : "Özeti Çıkar"}
      </button>

      {limitReached && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Günlük Özetleme Limiti Doldu
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Bugün maksimum {dailyLimit} özetleme yapabilirsiniz. Yarın tekrar deneyin!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {summary.length > 0 && (
        <pre className="text-sm text-gray-500 bg-gray-100 p-4 rounded mb-6">
          {JSON.stringify(summary, null, 2)}
        </pre>
      )}

      <div className="space-y-4">
        {summary.map((line, index) => (
          <div
            key={index}
            className="p-4 bg-white text-black shadow rounded-lg border border-gray-200"
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentUsage;