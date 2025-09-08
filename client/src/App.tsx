import { GoogleOAuthProvider } from '@react-oauth/google';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import MainLayout from "@/components/layout/MainLayout";
import Home from "@/pages/Home";
import AgentStore from "@/pages/AgentStore";
import AgentDetail from "@/pages/AgentDetail";
import Pricing from "@/pages/Pricing";
import Developer from "@/pages/Developer";
import NotFound from "@/pages/NotFound";
import AgentStart from './pages/AgentStart';
import AgentUsage from './pages/AgentUsage';
import GmailAgentUsage from './pages/GmailAgentUsage';
import GmailOrganizerAgent from './pages/GmailOrganizerAgent';
import WhatsAppAgent from './pages/WhatsAppAgent';
import OAuthCallback from './pages/OAuthCallback';
import TestIntegration from './pages/TestIntegration';
import MyAgents from './pages/MyAgents';
import BusinessManagement from './pages/BusinessManagement';
import CustomerChat from './pages/CustomerChat';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/agents" component={AgentStore} />
      <Route path="/agent/:id" component={AgentDetail} />
      <Route path="/agent/:id/start" component={AgentStart} />
      <Route path="/agent/:id/usage" component={AgentUsage} />
      <Route path="/agent/:id/gmail" component={GmailAgentUsage} />
      <Route path="/agent/:id/whatsapp" component={WhatsAppAgent} />
      <Route path="/gmail-organizer" component={GmailOrganizerAgent} />
      <Route path="/whatsapp-agent" component={WhatsAppAgent} />
      <Route path="/oauth/callback" component={OAuthCallback} />
      <Route path="/my-agents" component={MyAgents} />
      <Route path="/business-management" component={BusinessManagement} />
      <Route path="/agent/:id/business-chat" component={BusinessManagement} />
      <Route path="/chat/:chatLinkId" component={CustomerChat} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/developer" component={Developer} />
      <Route path="/test" component={TestIntegration} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "370597034951-8o7ig5kum0gd4g83vm8km7roarehng6v.apps.googleusercontent.com";
  
  console.log('Google OAuth Client ID:', clientId);
  console.log('Environment:', import.meta.env.MODE);
  console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
  
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={clientId}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <MainLayout>
                    <Router />
                  </MainLayout>
                </TooltipProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
