'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/db/schema';

const fetchUser = async (): Promise<User | null> => {
  const response = await fetch('/api/user');
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserActions() {
  const queryClient = useQueryClient();

  const invalidateUser = () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const setUser = (user: User | null) => {
    queryClient.setQueryData(['user'], user);
  };

  const removeUser = () => {
    queryClient.setQueryData(['user'], null);
  };

  return {
    invalidateUser,
    setUser,
    removeUser,
  };
} 