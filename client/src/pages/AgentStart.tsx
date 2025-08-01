import { useParams, useLocation } from "wouter";
import { CheckCircle, Shield, Mail } from "lucide-react";
import { FC } from "react";

const AgentStart: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const handleConnectGmail = () => {
    const redirectUri = encodeURIComponent(import.meta.env.VITE_GOOGLE_REDIRECT_URI);
    const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly");
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const state = encodeURIComponent(JSON.stringify({ agentId: id }));

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

    console.log("🔗 Google OAuth URL:", url);
    window.location.href = url;
  };

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glassmorphic rounded-2xl p-8 shadow-lg text-center">
          <h1 className="text-3xl font-semibold text-[var(--dark-purple)] mb-4">
            Agent Kullanımı İçin Gerekli İzinler
          </h1>
          <p className="text-gray-600 mb-6">
            Bu ajanı kullanabilmeniz için aşağıdaki izinlere ihtiyacımız var:
          </p>

          <div className="text-left space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Google hesabınızla giriş</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Gmail gelen kutunuzu okuma izni</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700">Verileriniz 256-bit ile şifrelenerek işlenir</span>
            </div>
          </div>

          <button
            onClick={handleConnectGmail}
            className="w-full btn-gradient px-8 py-4 text-lg relative"
          >
            <div className="gradient-border absolute inset-0 p-0.5 rounded-xl">
              <div className="bg-white rounded-xl w-full h-full flex items-center justify-center">
                <span className="gradient-text font-semibold">
                  Google ile Devam Et
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentStart;