import { CheckCircle, X, Star, Zap, Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BasicButton from "@/components/ui/basic-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect } from "react";

export default function Pricing() {
  const { t } = useLanguage();
  
  // Add pricing-page class to body when component mounts
  useEffect(() => {
    document.body.classList.add('pricing-page');
    return () => {
      document.body.classList.remove('pricing-page');
    };
  }, []);
  
  const plans = [
    {
      name: t("pricing.free"),
      price: "",
      description: t("pricing.free.description"),
      icon: <Star className="w-8 h-8 text-white" />,
      features: [
        t("pricing.free.feature1"),
        t("pricing.free.feature2"),
        t("pricing.free.feature3"),
      ],
      limitations: [
        t("pricing.free.limitation1"),
        t("pricing.free.limitation2"),
      ],
      popular: false,
      gradient: "from-gray-400 to-gray-600",
    },
    {
      name: t("pricing.plus"),
      price: "",
      description: t("pricing.plus.description"),
      icon: <Zap className="w-8 h-8 text-white" />,
      features: [
        t("pricing.plus.feature1"),
        t("pricing.plus.feature2"),
        t("pricing.plus.feature3"),
        t("pricing.plus.feature4"),
        t("pricing.plus.feature5"),
      ],
      limitations: [
        t("pricing.plus.limitation1"),
      ],
      popular: true,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      name: t("pricing.premium"),
      price: "",
      description: t("pricing.premium.description"),
      icon: <Crown className="w-8 h-8 text-white" />,
      features: [
        t("pricing.premium.feature1"),
        t("pricing.premium.feature2"),
        t("pricing.premium.feature3"),
        t("pricing.premium.feature4"),
        t("pricing.premium.feature5"),
        t("pricing.premium.feature6"),
        t("pricing.premium.feature7"),
      ],
      limitations: [],
      popular: false,
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <>
      {/* 3D Background */}
      <div className="pricing-3d-bg fixed inset-0 pointer-events-none z-0"></div>
      
      <div className="relative z-10 min-h-screen py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[var(--dark-purple)] dark:text-white mb-4">
              {t("pricing.title")} <span className="gradient-text">{t("pricing.titleHighlight")}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-light max-w-3xl">
              {t("pricing.subtitle")}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative group transition-all duration-500 hover:scale-105 ${
                  plan.popular ? "lg:scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 text-sm font-semibold rounded-full shadow-lg">
                      {t("pricing.mostPopular")}
                    </span>
                  </div>
                )}

                {/* Card Background with Glassmorphism */}
                <div className={`relative glassmorphic rounded-2xl p-8 shadow-xl border border-white/20 dark:border-white/10 backdrop-blur-sm h-full flex flex-col ${
                  plan.popular ? "ring-2 ring-purple-500/50" : ""
                }`}>
                  
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${plan.gradient} opacity-5 rounded-full blur-2xl animate-pulse`} style={{animationDuration: '4s'}}></div>
                    <div className={`absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br ${plan.gradient} opacity-5 rounded-full blur-2xl animate-pulse`} style={{animationDelay: '2s', animationDuration: '4s'}}></div>
                  </div>

                  <div className="relative z-10">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.gradient} bg-opacity-10`}>
                          {plan.icon}
                        </div>
                      </div>
                      <h3 className="text-2xl font-normal text-[var(--dark-purple)] dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <div className="mb-2">
                        <span className="text-5xl font-semibold text-[var(--dark-purple)] dark:text-white">
                          {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                        </span>
                        {typeof plan.price === 'number' && plan.price > 0 && (
                          <span className="text-lg text-gray-600 dark:text-gray-400 font-normal">/ay</span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3 group-hover:transform group-hover:translate-x-1 transition-transform duration-300">
                          <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          </div>
                          <span className="font-light text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <div key={limitationIndex} className="flex items-center space-x-3 opacity-60 group-hover:transform group-hover:translate-x-1 transition-transform duration-300">
                          <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
                            <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                          <span className="text-gray-500 dark:text-gray-400">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    {/* Note */}
                    <div className="text-center mt-auto">
                      <p className="text-xs font-light text-gray-500 dark:text-gray-400 text-center mt-4">
                        {plan.name === t("pricing.premium") 
                          ? t("pricing.premium.note")
                          : t("pricing.cancelNote")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-left mb-12">
              <h2 className="text-4xl font-normal text-[var(--dark-purple)] dark:text-white mb-4">
                {t("pricing.faq.title")}
              </h2>
            </div>

            <div className="max-w-7xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="glassmorphic rounded-xl mb-4 border border-white/20 dark:border-white/10 backdrop-blur-sm">
                  <AccordionTrigger className="px-6 py-3 text-left hover:no-underline">
                    <h4 className="text-lg font-normal text-[var(--dark-purple)] dark:text-white">
                      {t("pricing.faq.q1.title")}
                    </h4>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("pricing.faq.q1.answer")}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="glassmorphic rounded-xl mb-4 border border-white/20 dark:border-white/10 backdrop-blur-sm">
                  <AccordionTrigger className="px-6 py-3 text-left hover:no-underline">
                    <h4 className="text-lg font-normal text-[var(--dark-purple)] dark:text-white">
                      {t("pricing.faq.q2.title")}
                    </h4>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("pricing.faq.q2.answer")}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="glassmorphic rounded-xl mb-4 border border-white/20 dark:border-white/10 backdrop-blur-sm">
                  <AccordionTrigger className="px-6 py-3 text-left hover:no-underline">
                    <h4 className="text-lg font-normal text-[var(--dark-purple)] dark:text-white">
                      {t("pricing.faq.q3.title")}
                    </h4>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("pricing.faq.q3.answer")}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="glassmorphic rounded-xl mb-4 border border-white/20 dark:border-white/10 backdrop-blur-sm">
                  <AccordionTrigger className="px-6 py-3 text-left hover:no-underline">
                    <h4 className="text-lg font-normal text-[var(--dark-purple)] dark:text-white">
                      {t("pricing.faq.q4.title")}
                    </h4>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("pricing.faq.q4.answer")}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-16">
            <div className="rounded-2xl p-8 max-w-2xl mx-auto dark:backdrop-blur-sm">
              <h3 className="text-3xl font-normal text-[var(--dark-purple)] dark:text-white mb-4">
                {t("pricing.contact.title")}
              </h3>
              <p className="text-gray-600 text-m font-light dark:text-gray-400 mb-6">
                {t("pricing.contact.description")}
              </p>
        
              <BasicButton href="https://www.instagram.com/agentmagnetai/">
                {t("pricing.contact.button")}
              </BasicButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}