'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';


// Types for auth actions
interface SignInData {
  email: string;
  password: string;
  redirect?: string;
  priceId?: string;
}

interface SignUpData {
  email: string;
  password: string;
  name?: string;
  inviteId?: string;
  redirect?: string;
}

// Fetch user function
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

// Main auth hook
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // User query
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async (data: SignInData) => {
      console.log('Signing in with:', { email: data.email, redirect: data.redirect });
      
      // First, authenticate with Supabase client-side to set session cookies
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!authData.user) {
        throw new Error('Sign in failed');
      }

      // Now call our API to handle redirects and get user data
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Sign in response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Sign in failed');
      }

      return result;
    },
    onSuccess: (result) => {
      console.log('Sign in success, result:', result);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Add a small delay to ensure session is set
      setTimeout(() => {
        // Handle redirects
        if (result?.redirectTo) {
          console.log('Redirecting to:', result.redirectTo);
          router.push(result.redirectTo);
        } else {
          console.log('No redirect specified, pushing to dashboard');
          router.push('/dashboard');
        }
      }, 100);
    },
    onError: (error) => {
      console.error('Sign in error:', error);
    },
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      console.log('Signing up with:', { email: data.email, name: data.name });
      
      // First, authenticate with Supabase client-side to set session cookies
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name || data.email.split('@')[0],
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!authData.user) {
        throw new Error('Sign up failed');
      }

      // Now call our API to handle database setup and redirects
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Sign up response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Sign up failed');
      }

      return result;
    },
    onSuccess: (result) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Handle redirects
      if (result?.redirectTo) {
        router.push(result.redirectTo);
      }
    },
    onError: (error) => {
      console.error('Sign up error:', error);
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      // Immediately clear user cache
      queryClient.setQueryData(['user'], null);
      
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: ['user'] });
      queryClient.removeQueries({ queryKey: ['team'] });
      
      // Redirect to home
      router.push('/');
    },
    onError: (error) => {
      console.error('Sign out error:', error);
      // Even if there's an error, clear the cache and redirect
      queryClient.setQueryData(['user'], null);
      router.push('/');
    },
  });

  // Helper functions
  const isAuthenticated = !!user;
  const isLoading = isLoadingUser || signInMutation.isPending || signUpMutation.isPending || signOutMutation.isPending;

  return {
    // User state
    user,
    isAuthenticated,
    isLoading,
    userError,
    
    // Actions
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    
    // Mutation states
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    
    // Errors
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
    signOutError: signOutMutation.error,
    
    // Utilities
    refetchUser,
    clearUser: () => queryClient.setQueryData(['user'], null),
  };
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && !isAuthenticated) {
    router.push('/sign-in');
    return null;
  }

  return user;
}

// Hook for checking if user has lifetime access
export function useLifetimeAccess() {
  const { user, isAuthenticated } = useAuth();
  
  return {
    hasLifetimeAccess: isAuthenticated && user?.hasLifetimeAccess,
    isAuthenticated,
    user,
  };
} 