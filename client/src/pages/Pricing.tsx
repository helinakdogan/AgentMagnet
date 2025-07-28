import { CheckCircle, X } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Başlangıç",
      price: 0,
      description: "Bireysel kullanıcılar için ideal",
      features: [
        "5 AI ajan erişimi",
        "Aylık 100 sorgu",
        "E-posta desteği",
        "Temel entegrasyonlar",
      ],
      limitations: [
        "API erişimi yok",
        "Özel entegrasyonlar yok",
        "Öncelikli destek yok",
      ],
      popular: false,
      buttonText: "Ücretsiz Başla",
      buttonStyle: "btn-black",
    },
    {
      name: "Profesyonel",
      price: 99,
      description: "Küçük işletmeler ve takımlar için",
      features: [
        "Tüm AI ajanlara erişim",
        "Sınırsız sorgu",
        "Öncelikli destek",
        "API erişimi",
        "Özel entegrasyonlar",
        "Analitik dashboard",
        "Takım işbirliği",
      ],
      limitations: [
        "Özel AI modelleri yok",
      ],
      popular: true,
      buttonText: "14 Gün Ücretsiz Dene",
      buttonStyle: "btn-gradient",
    },
    {
      name: "Kurumsal",
      price: 299,
      description: "Büyük şirketler için kapsamlı çözüm",
      features: [
        "Tüm Profesyonel özellikleri",
        "Özel AI modelleri",
        "Dedike destek",
        "SLA garantisi",
        "Beyaz etiket çözümü",
        "On-premise deployment",
        "Gelişmiş güvenlik",
        "Sınırsız takım üyesi",
      ],
      limitations: [],
      popular: false,
      buttonText: "Satış Ekibi ile Görüş",
      buttonStyle: "btn-black",
    },
  ];

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--dark-purple)] mb-4">
            Size Uygun Planı <span className="gradient-text">Seçin</span>
          </h1>
          <p className="text-xl text-gray-600 font-normal max-w-3xl mx-auto">
            İhtiyaçlarınıza göre tasarlanmış planlarımızla AI ajanlarının gücünden yararlanın. 
            Tüm planlarda 7 gün ücretsiz deneme imkanı.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative glassmorphic rounded-2xl p-8 shadow-lg ${
                plan.popular ? "ring-2 ring-purple-500 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="gradient-main px-6 py-2 text-sm font-semibold text-white rounded-full">
                    En Popüler
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-[var(--dark-purple)] mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-5xl font-semibold text-[var(--dark-purple)]">
                    ₺{plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-lg text-gray-600 font-normal">/ay</span>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitationIndex) => (
                  <div key={limitationIndex} className="flex items-center space-x-3 opacity-60">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">{limitation}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full px-8 py-4 text-lg font-semibold rounded-xl transition-all ${
                  plan.buttonStyle === "btn-gradient" 
                    ? "btn-gradient relative overflow-hidden" 
                    : "btn-black"
                }`}
              >
                {plan.buttonStyle === "btn-gradient" && (
                  <div className="gradient-border absolute inset-0 p-0.5 rounded-xl">
                    <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                      <span className="gradient-text">{plan.buttonText}</span>
                    </div>
                  </div>
                )}
                {plan.buttonStyle === "btn-black" && plan.buttonText}
              </button>

              {plan.price > 0 && (
                <p className="text-xs text-gray-500 text-center mt-4">
                  İstediğiniz zaman iptal edebilirsiniz
                </p>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[var(--dark-purple)] mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fiyatlandırma planlarımız hakkında en çok merak edilen sorular.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="glassmorphic rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[var(--dark-purple)] mb-3">
                Ücretsiz deneme süresince kredi kartı gerekir mi?
              </h4>
              <p className="text-gray-600">
                Hayır, ücretsiz deneme için kredi kartı bilgisi gerekmez. 7 gün boyunca 
                tüm özellikleri ücretsiz olarak deneyebilirsiniz.
              </p>
            </div>

            <div className="glassmorphic rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[var(--dark-purple)] mb-3">
                Plan değişikliği nasıl yapılır?
              </h4>
              <p className="text-gray-600">
                İstediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. 
                Değişiklik anında geçerli olur ve ödeme prorata hesaplanır.
              </p>
            </div>

            <div className="glassmorphic rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[var(--dark-purple)] mb-3">
                API kullanımında limit var mı?
              </h4>
              <p className="text-gray-600">
                Başlangıç planında aylık 100 sorgu limiti vardır. Profesyonel ve 
                Kurumsal planlarda sınırsız API kullanımı mevcuttur.
              </p>
            </div>

            <div className="glassmorphic rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[var(--dark-purple)] mb-3">
                İptal işlemi nasıl yapılır?
              </h4>
              <p className="text-gray-600">
                Hesap ayarlarınızdan istediğiniz zaman aboneliğinizi iptal edebilirsiniz. 
                Mevcut dönem sonuna kadar hizmetten yararlanmaya devam edersiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <div className="glassmorphic rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-[var(--dark-purple)] mb-4">
              Özel İhtiyaçlarınız mı Var?
            </h3>
            <p className="text-gray-600 mb-6">
              Kurumsal çözümler, özel entegrasyonlar ve hacim indirimleri için 
              satış ekibimizle iletişime geçin.
            </p>
            <button className="btn-black px-8 py-3">
              Satış Ekibi ile İletişime Geç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
