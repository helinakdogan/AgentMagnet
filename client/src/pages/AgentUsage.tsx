import { useState } from "react";
import axios from "axios";
import { useRoute } from "wouter";

interface SummaryResponse {
  summary: string[];
}

const AgentUsage: React.FC = () => {
  const [match, params] = useRoute<{ id: string }>("/agent/:id/usage");
  const [summary, setSummary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const userId = localStorage.getItem("userId") || "demo-user";

const handleSummarize = async () => {
  setLoading(true);
  setLimitReached(false);
  setSummary([]); // Önceki sonuçları temizle

  try {
    const res = await axios.post<{ summary: string[] }>("/api/gmail/summary", { 
      userId 
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
  } catch (err: unknown) {
    console.error("❌ Özet çıkarma hatası:", err);
    
    if (axios.isAxiosError(err)) {
      console.error("Backend hatası:", err.response?.data);
      setSummary([`Hata: ${err.response?.data?.message || err.message}`]);
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

      <button
        onClick={handleSummarize}
        disabled={loading}
        className="btn-gradient px-6 py-3 rounded-xl mb-6 disabled:opacity-50"
      >
        {loading ? "Yükleniyor..." : "Özeti Çıkar"}
      </button>

      {limitReached && (
        <p className="text-red-600 mb-4">
          Günlük kullanım sınırına ulaşıldı (maksimum 2 kez).
        </p>
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