import { toast } from "@/hooks/use-toast";

// API Base URL - Development'ta proxy, production'da environment variable
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Development: Vite proxy kullanır
  : 'https://agent-magnet-backend.onrender.com/api'; // Production: Backend URL

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}  
 
export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  status: string;
  iconColor: string;
  features: string[];
  integrations: string[];
  isPopular: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAgent {
  id: string;
  userId: string;
  agentId: string;
  oauthTokens?: any;
  usageCount: number;
  lastUsed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GmailEmails {
  recentEmails: Array<{
    id: string;
    subject: string;
    sender: string;
    date: string;
    snippet: string;
    isRead: boolean;
    summary?: string;
  }>;
  totalCount: number;
  summary: string;
}

export interface GmailSummary {
  summary: string;
  unreadCount: number;
  recentEmails: Array<{
    subject: string;
    sender: string;
    date: string;
    snippet: string;
  }>;
}

// Error handling utility
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API request utility with proper error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session management
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || data.error || `HTTP ${response.status}`,
        data
      );
    }

    // Handle backend response structure {success: true, data: [...]}
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data.data;
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error',
      error
    );
  }
}

// 🔐 Authentication API - Google OAuth Giriş için
export const authApi = {
  // Mevcut kullanıcı bilgilerini getirir
  getCurrentUser: () => apiRequest<User>('/auth/me'),
  
  // Google OAuth token exchange - Google token'ını işler
  googleToken: (access_token: string) => apiRequest<User>('/auth/google/token', {
    method: 'POST',
    body: JSON.stringify({ access_token }),
  }),
  
  // Google OAuth login - Google giriş sayfasına yönlendirir
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
  
  // Kullanıcı çıkışı
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  
  // Kullanıcının giriş yapıp yapmadığını kontrol eder
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await authApi.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
};

// 🤖 Agents API - AI Agent yönetimi için
export const agentsApi = {
  // Tüm agent'ları getirir (kategori filtresi ile)
  getAll: (category?: string) => {
    const params = category && category !== 'Tümü' ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest<Agent[]>(`/agents${params}`);
  },
  
  // Tek bir agent'ı ID ile getirir
  getById: (id: string) => apiRequest<Agent>(`/agents/${id}`),
  
  // Agent satın alma (korumalı endpoint)
  purchase: (id: string, userId: string) => apiRequest<{ success: boolean; message: string }>(`/agents/${id}/purchase`, { 
    method: 'POST',
    body: JSON.stringify({ userId })
  }),
  
  // Agent oluşturma (sadece admin)
  create: (agent: Omit<Agent, 'id'>) => 
    apiRequest<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    }),
  
  // Agent güncelleme (sadece admin)
  update: (id: string, agent: Partial<Agent>) =>
    apiRequest<Agent>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agent),
    }),
  
  // Agent silme (sadece admin)
  delete: (id: string) =>
    apiRequest(`/agents/${id}`, {
      method: 'DELETE',
    }),
};

// 👤 Users API - Kullanıcı yönetimi için
export const usersApi = {
  // Mevcut kullanıcı profilini getirir
  getProfile: () => apiRequest<User>('/users/me'),
  
  // Kullanıcının satın aldığı agent'ları getirir
  getPurchasedAgents: (userId?: string) => {
    const url = userId ? `/users/me/agents?userId=${userId}` : '/users/me/agents';
    return apiRequest<UserAgent[]>(url);
  },
  
  // Agent satın alma
  purchaseAgent: (agentId: string) =>
    apiRequest<UserAgent>(`/users/me/agents/${agentId}/purchase`, {
      method: 'POST',
    }),
};

// 📧 Gmail API - Gmail Agent için ana endpoint'ler
export const gmailApi = {
  // Son 10 e-postayı getirir (özet yerine)
  getLastEmails: (agentId: string, userId: string) => apiRequest<GmailEmails>('/gmail/emails', {
    method: 'POST',
    body: JSON.stringify({ agentId, userId }),
  }),
  
  // Gmail özeti getirir (eski versiyon)
  getSummary: () => apiRequest<GmailSummary>('/gmail/summary', {
    method: 'POST',
  }),
  
  // OAuth token'ları saklar
  storeTokens: (tokens: any) =>
    apiRequest('/gmail/tokens', {
      method: 'POST',
      body: JSON.stringify(tokens),
    }),
  
  // Kullanım istatistiklerini getirir
  getUsage: () => apiRequest('/gmail/usage'),
};

// 🔄 OAuth API - Gmail Agent OAuth için
export const oauthApi = {
  // Gmail OAuth callback - Gmail agent kullanımı için gerekli
  gmailCallback: (code: string) =>
    apiRequest('/oauth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};

// Error handler with toast notifications
export const handleApiError = (error: unknown, customMessage?: string) => {
  let message = customMessage || 'An error occurred';
  
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        message = 'Please log in to continue';
        // Redirect to login if needed
        break;
      case 403:
        message = 'You do not have permission to perform this action';
        break;
      case 404:
        message = 'The requested resource was not found';
        break;
      case 429:
        message = 'Too many requests. Please try again later';
        break;
      case 500:
        message = 'Server error. Please try again later';
        break;
      default:
        message = error.message || 'An unexpected error occurred';
    }
  } else if (error instanceof Error) {
    message = error.message;
  }
  
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
  
  console.error('API Error:', error);
  return message;
};

// Success handler with toast notifications
export const handleApiSuccess = (message: string) => {
  toast({
    title: "Success",
    description: message,
  });
};

export { ApiError }; 