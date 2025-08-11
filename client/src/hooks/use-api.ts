import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  agentsApi, 
  authApi, 
  usersApi, 
  gmailApi, 
  oauthApi,
  handleApiError,
  handleApiSuccess,
  type Agent,
  type User,
  type UserAgent,
  type GmailSummary
} from '@/lib/api';

// Query keys for consistent caching
export const queryKeys = {
  agents: ['agents'] as const,
  agent: (id: string) => ['agents', id] as const,
  user: ['user'] as const,
  userAgents: ['user', 'agents'] as const,
  gmailUsage: ['gmail', 'usage'] as const,
};

// Authentication hooks
export const useAuth = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      handleApiSuccess('Successfully logged out');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to logout');
    },
  });
};

// Agents hooks
export const useAgents = (category?: string) => {
  return useQuery({
    queryKey: [...queryKeys.agents, category],
    queryFn: () => agentsApi.getAll(category),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAgent = (id: string) => {
  return useQuery({
    queryKey: queryKeys.agent(id),
    queryFn: () => agentsApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: agentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents });
      handleApiSuccess('Agent created successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to create agent');
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, agent }: { id: string; agent: Partial<Agent> }) =>
      agentsApi.update(id, agent),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent(id) });
      handleApiSuccess('Agent updated successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update agent');
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: agentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents });
      handleApiSuccess('Agent deleted successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to delete agent');
    },
  });
};

// User hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: usersApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserAgents = (userId?: string) => {
  return useQuery({
    queryKey: [...queryKeys.userAgents, userId],
    queryFn: () => usersApi.getPurchasedAgents(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePurchaseAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => agentsApi.purchase(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAgents });
      handleApiSuccess('Agent purchased successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to purchase agent');
    },
  });
};

// Gmail hooks
export const useGmailLastEmails = () => {
  return useMutation({
    mutationFn: ({ agentId, userId }: { agentId: string; userId: string }) => 
      gmailApi.getLastEmails(agentId, userId),
    onError: (error) => {
      handleApiError(error, 'Failed to get last emails');
    },
  });
};

export const useGmailSummary = () => {
  return useMutation({
    mutationFn: gmailApi.getSummary,
    onError: (error) => {
      handleApiError(error, 'Failed to get Gmail summary');
    },
  });
};

export const useGmailUsage = () => {
  return useQuery({
    queryKey: queryKeys.gmailUsage,
    queryFn: gmailApi.getUsage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStoreGmailTokens = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: gmailApi.storeTokens,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gmailUsage });
      handleApiSuccess('Gmail tokens stored successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to store Gmail tokens');
    },
  });
};

// OAuth hooks
export const useGmailOAuthCallback = () => {
  return useMutation({
    mutationFn: oauthApi.gmailCallback,
    onSuccess: () => {
      handleApiSuccess('Gmail connected successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to connect Gmail');
    },
  });
};

// Utility hooks
export const useIsAuthenticated = () => {
  const { data: user, isLoading, error } = useAuth();
  return {
    isAuthenticated: !!user,
    isLoading,
    error,
    user,
  };
};

// Custom hook for agent purchase with authentication check
export const useAgentPurchase = () => {
  const purchaseMutation = usePurchaseAgent();
  
  const purchaseAgent = (agentId: string, userId: string) => {
    // localStorage'dan user bilgisini kontrol et
    const userData = localStorage.getItem('userData');
    if (!userData) {
      handleApiError(new Error('Please log in to purchase agents'), 'Authentication required');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      if (!user || !user.id) {
        handleApiError(new Error('Please log in to purchase agents'), 'Authentication required');
        return;
      }
      
      // User ID'yi localStorage'dan al, parametre olarak gelen userId'yi kullanma
      purchaseMutation.mutate({ id: agentId, userId: user.id });
    } catch (error) {
      handleApiError(new Error('Please log in to purchase agents'), 'Authentication required');
    }
  };
  
  return {
    purchaseAgent,
    isLoading: purchaseMutation.isPending,
    error: purchaseMutation.error,
  };
}; 