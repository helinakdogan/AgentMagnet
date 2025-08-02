# AgentMagnet Frontend-Backend Integration

This document describes how the AgentMagnet frontend is connected to the backend API and how to set up and use the integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Backend server running on `http://localhost:3000`
- Database configured and running

### 1. Start the Backend
```bash
cd /path/to/your/backend
npm run dev
```

### 2. Start the Frontend
```bash
npm run dev
```

The frontend will be available at `http://localhost:5001` and will automatically proxy API calls to the backend.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL (for production)
BACKEND_URL=http://localhost:3000

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Database URL (if needed for direct access)
DATABASE_URL=your-database-url
```

### Vite Proxy Configuration

The frontend uses Vite's proxy feature to forward API requests to the backend during development:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## 📡 API Integration

### API Service Layer

The frontend uses a centralized API service layer located at `client/src/lib/api.ts`:

```typescript
// Example usage
import { agentsApi, authApi } from '@/lib/api';

// Get all agents
const agents = await agentsApi.getAll();

// Get current user
const user = await authApi.getCurrentUser();
```

### React Query Hooks

Custom hooks provide loading states, error handling, and caching:

```typescript
import { useAgents, useAuth } from '@/hooks/use-api';

function MyComponent() {
  const { data: agents, isLoading, error } = useAgents();
  const { data: user, isAuthenticated } = useAuth();
  
  if (isLoading) return <Loading />;
  if (error) return <ErrorFallback error={error} />;
  
  return <div>{/* Your component */}</div>;
}
```

## 🔐 Authentication

### Google OAuth Integration

The frontend integrates with Google OAuth for authentication:

1. **Login Flow**: Users click login → redirected to Google → callback to backend → session established
2. **Session Management**: Uses HTTP-only cookies for secure session storage
3. **Protected Routes**: Authentication state managed via React Context

```typescript
import { useAuthContext } from '@/contexts/AuthContext';

function ProtectedComponent() {
  const { isAuthenticated, user, logout } = useAuthContext();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### Authentication Hooks

- `useAuth()` - Get current user data
- `useLogout()` - Logout mutation
- `useIsAuthenticated()` - Check authentication status
- `useAuthContext()` - Access auth context

## 📊 Data Management

### Agent Management

```typescript
// Get all agents
const { data: agents, isLoading } = useAgents();

// Get single agent
const { data: agent } = useAgent(agentId);

// Create agent (admin)
const createAgent = useCreateAgent();
createAgent.mutate(agentData);

// Update agent (admin)
const updateAgent = useUpdateAgent();
updateAgent.mutate({ id: agentId, agent: updateData });

// Delete agent (admin)
const deleteAgent = useDeleteAgent();
deleteAgent.mutate(agentId);
```

### User Management

```typescript
// Get user profile
const { data: profile } = useUserProfile();

// Get purchased agents
const { data: userAgents } = useUserAgents();

// Purchase agent
const purchaseAgent = usePurchaseAgent();
purchaseAgent.mutate(agentId);
```

### Gmail Integration

```typescript
// Get Gmail summary
const gmailSummary = useGmailSummary();
gmailSummary.mutate();

// Get usage statistics
const { data: usage } = useGmailUsage();

// Store OAuth tokens
const storeTokens = useStoreGmailTokens();
storeTokens.mutate(tokens);
```

## 🎨 UI Components

### Loading States

```typescript
import { Loading, LoadingPage, LoadingCard } from '@/components/ui/loading';

// Page loading
<LoadingPage />

// Component loading
<Loading text="Loading agents..." />

// Card skeleton
<LoadingCard />
```

### Error Handling

```typescript
import { ErrorFallback, ErrorBoundary } from '@/components/ui/error-boundary';

// Error boundary wrapper
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Error fallback
<ErrorFallback error={error} resetError={resetFunction} />
```

### Toast Notifications

```typescript
import { handleApiError, handleApiSuccess } from '@/lib/api';

// Success notification
handleApiSuccess('Agent purchased successfully!');

// Error notification
handleApiError(error, 'Failed to purchase agent');
```

## 🔄 State Management

### React Query Configuration

```typescript
// client/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### Context Providers

The app uses multiple context providers for state management:

```typescript
<ErrorBoundary>
  <GoogleOAuthProvider>
    <QueryClientProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
</ErrorBoundary>
```

## 🛠️ Development

### Adding New API Endpoints

1. **Add to API service** (`client/src/lib/api.ts`):
```typescript
export const newApi = {
  getData: () => apiRequest<DataType>('/new-endpoint'),
  createData: (data: CreateData) => apiRequest('/new-endpoint', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
```

2. **Add React Query hook** (`client/src/hooks/use-api.ts`):
```typescript
export const useNewData = () => {
  return useQuery({
    queryKey: ['new-data'],
    queryFn: newApi.getData,
  });
};
```

3. **Use in component**:
```typescript
function MyComponent() {
  const { data, isLoading } = useNewData();
  // ...
}
```

### Error Handling

All API calls include comprehensive error handling:

- **Network errors**: Automatic retry with exponential backoff
- **Authentication errors**: Automatic redirect to login
- **Server errors**: User-friendly error messages
- **Validation errors**: Field-specific error display

### Type Safety

The frontend uses TypeScript for full type safety:

```typescript
// API types
export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  // ...
}

// Usage with full type safety
const { data: agents } = useAgents(); // Type: Agent[]
```

## 🚀 Production Deployment

### Build Process

```bash
# Build frontend
npm run build

# Build backend
npm run build

# Start production server
npm start
```

### Environment Configuration

For production, update the environment variables:

```env
NODE_ENV=production
BACKEND_URL=https://your-backend-domain.com
VITE_GOOGLE_CLIENT_ID=your-production-client-id
```

### CORS Configuration

Ensure your backend has proper CORS configuration:

```typescript
// Backend CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5001',
  credentials: true,
}));
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **Authentication Issues**: Verify Google OAuth setup
3. **API Connection**: Ensure backend is running on correct port
4. **Type Errors**: Check TypeScript configuration and types

### Debug Mode

Enable debug logging:

```typescript
// Add to your component
console.log('API Response:', data);
console.log('Error:', error);
```

### Network Tab

Use browser dev tools to inspect API requests:
- Check request/response headers
- Verify authentication cookies
- Monitor API response times

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

This integration provides a robust, type-safe, and user-friendly connection between the AgentMagnet frontend and backend, with comprehensive error handling, loading states, and authentication management. 