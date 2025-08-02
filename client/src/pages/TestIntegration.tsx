import { useState } from 'react';
import { useAgents, useAuth, useGmailLastEmails } from '@/hooks/use-api';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TestIntegration() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { t } = useLanguage();
  
  const { data: agents, isLoading: agentsLoading, error: agentsError } = useAgents();
  const { data: user, isLoading: authLoading, error: authError } = useAuth();
  const gmailEmails = useGmailLastEmails();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAPI = async () => {
    try {
      addResult('Testing API connection...');
      
      // Test health endpoint
      const healthResponse = await fetch('/health');
      if (healthResponse.ok) {
        addResult('✅ Health endpoint working');
      } else {
        addResult('❌ Health endpoint failed');
      }

      // Test agents endpoint
      const agentsResponse = await fetch('/api/agents');
      addResult(`Agents endpoint status: ${agentsResponse.status}`);
      
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        addResult(`✅ Agents endpoint working (${agentsData.length || 0} agents)`);
      } else {
        const errorData = await agentsResponse.json();
        addResult(`❌ Agents endpoint failed: ${errorData.message}`);
      }

    } catch (error) {
      addResult(`❌ API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold text-[var(--dark-purple)] mb-8">
          Frontend-Backend Integration Test
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* API Test Card */}
          <Card>
            <CardHeader>
              <CardTitle>API Connection Test</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testAPI} className="mb-4">
                Test API Connection
              </Button>
              
              <Button 
                onClick={() => gmailEmails.mutate({ agentId: 'test', userId: 'test' })} 
                disabled={gmailEmails.isPending}
                className="mb-4 ml-2"
              >
                {gmailEmails.isPending ? t("common.loading") : t("gmail.getEmails")}
              </Button>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {result}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* React Query Test Card */}
          <Card>
            <CardHeader>
              <CardTitle>React Query Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Agents Query:</h4>
                  {agentsLoading ? (
                    <Loading size="sm" text="Loading agents..." />
                  ) : agentsError ? (
                    <div className="text-red-600 text-sm">
                      Error: {agentsError.message}
                    </div>
                  ) : (
                    <div className="text-green-600 text-sm">
                      ✅ Loaded {agents?.length || 0} agents
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Auth Query:</h4>
                  {authLoading ? (
                    <Loading size="sm" text="Loading auth..." />
                  ) : authError ? (
                    <div className="text-red-600 text-sm">
                      Error: {authError.message}
                    </div>
                  ) : (
                    <div className="text-green-600 text-sm">
                      ✅ Auth status: {user ? 'Authenticated' : 'Not authenticated'}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Gmail Mailleri:</h4>
                  {gmailEmails.isPending ? (
                    <Loading size="sm" text="Mailler yükleniyor..." />
                  ) : gmailEmails.error ? (
                    <div className="text-red-600 text-sm">
                      Hata: {gmailEmails.error.message}
                    </div>
                  ) : gmailEmails.data ? (
                    <div className="text-green-600 text-sm">
                      ✅ {gmailEmails.data.recentEmails?.length || 0} mail yüklendi
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">
                      Test etmek için "{t("gmail.getEmails")}" butonuna tıklayın
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm text-gray-600">Frontend Running</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">✅</div>
                <div className="text-sm text-gray-600">Vite Proxy</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">⚠️</div>
                <div className="text-sm text-gray-600">Backend Connection</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">✅</div>
                <div className="text-sm text-gray-600">React Query</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Start your backend server</strong> on port 3000</p>
              <p>2. <strong>Set up your database</strong> and run migrations</p>
              <p>3. <strong>Configure environment variables</strong> for OAuth and database</p>
              <p>4. <strong>Test the integration</strong> by clicking "Test API Connection"</p>
              <p>5. <strong>Navigate to /agents</strong> to see the agent store</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 