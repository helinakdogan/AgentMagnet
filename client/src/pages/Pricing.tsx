import { CheckCircle, X } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "",
      description: "Temel özelliklerle başlayın",
      features: [
        "Sınırlı ajan özellikleri",
        "Düşük kotalı kullanım",
        "Temel entegrasyonlar",
      ],
      limitations: [
        "Özel entegrasyonlar yok",
        "Öncelikli destek yok",
      ],
      popular: false,
      buttonText: "Ücretsiz Başla",
      buttonStyle: "btn-black",
    },
    {
      name: "Plus",
      price: "",
      description: "Gelişmiş özellikler ve yüksek kotalar",
      features: [
        "Gelişmiş ajan özellikleri",
        "Yüksek kotalı kullanım",
        "Yüksek API erişimi",
        "Öncelikli destek",
        "Özel entegrasyonlar",
      ],
      limitations: [
        "Sınırsız kullanım yok",
      ],
      popular: true,
      buttonText: "14 Gün Ücretsiz Dene",
      buttonStyle: "btn-gradient",
    },
    {
      name: "Premium",
      price: "",
      description: "Tüm gelişmiş özellikler ve sınırsız kotalar",
      features: [
        "Daha gelişmiş ajan özellikleri",
        "Sınırsız kullanım",
        "Tam API erişimi",
        "7/24 öncelikli destek",
        "Özel entegrasyonlar",
        "Gelişmiş analitik",
        "Takım işbirliği",
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
            Her AI ajanı için uygun plan seçenekleri. Yıllık ödemede %20 indirim fırsatı.
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
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {typeof plan.price === 'number' && plan.price > 0 && (
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

   

              
                <p className="text-xs text-gray-500 text-center mt-4">
                  {plan.name === "Premium" 
                    ? "Özel fiyatlandırma için iletişime geçin" 
                    : "İstediğiniz zaman iptal edebilirsiniz"}
                </p>
            
            </div>
          ))}
        </div>

        {/* Payment Options */}
        <div className="mt-12 glassmorphic rounded-2xl p-8 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-semibold text-[var(--dark-purple)] mb-4">
            Ödeme Seçenekleri
          </h3>
          <p className="text-gray-600 mb-6">
            Her plan yıllık veya aylık olarak alınabilir. Yıllık ödemelerde <span className="font-semibold"> ay bazında %20 indirim</span> uygulanır. 
          </p>
          
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
                Fiyatlar ajan başına mı hesaplanıyor?
              </h4>
              <p className="text-gray-600">
                Evet, Agent Magnet'te her bir ajan ayrı olarak satılır. Her ajanın fiyatı farklı olabilir. Ödeme sayfasında detaylı olarak inceleyebilirsiniz.
              </p>
            </div>

            <div className="glassmorphic rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[var(--dark-purple)] mb-3">
                Yıllık ödeme indirimi nasıl çalışır?
              </h4>
              <p className="text-gray-600">
                Yıllık ödemede aylık ücretin %20 indirimlisini peşin olarak ödersiniz. Bu size yıllık %20 tasarruf sağlar.
              </p>
            </div>

            <div className="glassmorphic rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[var(--dark-purple)] mb-3">
                Farklı ajanlar için farklı planlar seçebilir miyim?
              </h4>
              <p className="text-gray-600">
                Evet, her AI ajanı için farklı plan seçebilirsiniz. Örneğin bir ajan için Premium, diğeri için Plus planı kullanabilirsiniz.
              </p>
            </div>

            <div className="glassmorphic rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[var(--dark-purple)] mb-3">
                Kurumsal çözümler için ne yapmalıyım?
              </h4>
              <p className="text-gray-600">
                Çoklu ajan yönetimi, özel entegrasyonlar ve kurumsal çözümler için satış ekibimizle iletişime geçebilirsiniz.
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
              Kurumsal çözümler, çoklu ajan yönetimi, özel entegrasyonlar ve 
              hacim indirimleri için satış ekibimizle iletişime geçin.
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