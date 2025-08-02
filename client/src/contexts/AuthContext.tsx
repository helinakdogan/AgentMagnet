import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useLogout } from '@/hooks/use-api';
import type { User } from '@/lib/api';

// JWT token storage
const getToken = () => localStorage.getItem('authToken');
const setToken = (token: string) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logoutMutation = useLogout();

  const logout = () => {
    removeToken();
    setUser(null);
    logoutMutation.mutate();
  };

  const refetch = async () => {
    const token = getToken();
    console.log('AuthContext refetch - token:', token);
    console.log('Token length:', token ? token.length : 0);
    
    if (token) {
      try {
        console.log('Making /api/auth/me request with token');
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data received:', data);
          setUser(data.data);
        } else {
          const errorData = await response.json();
          console.log('Auth failed, error:', errorData);
          removeToken();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth refetch error:', error);
        removeToken();
        setUser(null);
      }
    } else {
      console.log('No token found');
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 