import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--light-gray)]">
      <div className="text-center max-w-md mx-4">
        {/* 3D Magnet Visual */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto gradient-main rounded-3xl shadow-2xl flex items-center justify-center floating-animation">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 3v5c0 2.76 2.24 5 5 5s5-2.24 5-5V3h2v5c0 3.87-3.13 7-7 7s-7-3.13-7-7V3h2zm10 0v5c0 1.66-1.34 3-3 3s-3-1.34-3-3V3h6z"/>
            </svg>
          </div>
          
          {/* Scattered dots around magnet */}
          <div className="absolute -top-4 -left-4 w-3 h-3 bg-purple-400 rounded-full floating-animation opacity-60" style={{ animationDelay: '-1s' }}></div>
          <div className="absolute -top-2 -right-6 w-2 h-2 bg-pink-400 rounded-full floating-animation opacity-70" style={{ animationDelay: '-2s' }}></div>
          <div className="absolute -bottom-4 left-2 w-2.5 h-2.5 bg-blue-400 rounded-full floating-animation opacity-50" style={{ animationDelay: '-3s' }}></div>
          <div className="absolute -bottom-2 -right-4 w-2 h-2 bg-purple-300 rounded-full floating-animation opacity-80" style={{ animationDelay: '-4s' }}></div>
        </div>

        <h1 className="text-6xl font-semibold text-[var(--dark-purple)] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[var(--dark-purple)] mb-4">
          Sayfa Bulunamadı
        </h2>
        
        <p className="text-lg text-gray-600 font-normal mb-8 leading-relaxed">
          Aradığınız sayfa mıknatısın çekici gücüyle başka bir boyuta sürüklenmiş olabilir. 
          Ana sayfaya dönerek yolculuğunuza devam edebilirsiniz.
        </p>

        <div className="space-y-4">
          <Link href="/">
            <button className="w-full btn-gradient px-8 py-4 text-lg">
              <div className="gradient-border absolute inset-0 p-0.5 rounded-xl">
                <div className="bg-[var(--light-gray)] rounded-xl w-full h-full flex items-center justify-center">
                  <span className="gradient-text font-semibold">Ana Sayfaya Dön</span>
                </div>
              </div>
            </button>
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="w-full btn-black px-8 py-3"
          >
            Geri Dön
          </button>
        </div>

       
      </div>
    </div>
  );
}
