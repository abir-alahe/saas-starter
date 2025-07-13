import { createServerClient } from './server';
import { supabase } from './client';
import { redirect } from 'next/navigation';

export async function signUpWithEmail(email: string, password: string, name?: string) {
  const supabaseClient = await createServerClient();
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabaseClient = await createServerClient();
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const supabaseClient = await createServerClient();
  const { error } = await supabaseClient.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function getSession() {
  try {
    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}

export async function getUser() {
  try {
    console.log('getSupabaseUser: Creating server client...');
    const supabase = await createServerClient();
    console.log('getSupabaseUser: Getting user from Supabase...');
    const { data: { user }, error } = await supabase.auth.getUser();

    console.log('getSupabaseUser: Supabase response:', { 
      hasUser: !!user, 
      userId: user?.id, 
      email: user?.email,
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (error) {
      // Don't log AuthSessionMissingError as it's expected during sign-out
      if (error.message !== 'Auth session missing!') {
        console.error('Error getting user:', error);
      } else {
        console.log('getSupabaseUser: Auth session missing (expected during sign-out)');
      }
      return null;
    }

    console.log('getSupabaseUser: Returning user:', { userId: user?.id, email: user?.email });
    return user;
  } catch (error) {
    // Don't log AuthSessionMissingError as it's expected during sign-out
    if (error instanceof Error && error.message !== 'Auth session missing!') {
      console.error('Error in getUser:', error);
    } else {
      console.log('getSupabaseUser: Caught Auth session missing error');
    }
    return null;
  }
}

export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return user;
}

export async function updateUserProfile(updates: {
  name?: string;
  email?: string;
}) {
  const supabaseClient = await createServerClient();
  const { data, error } = await supabaseClient.auth.updateUser({
    data: updates,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function resetPassword(email: string) {
  const supabaseClient = await createServerClient();
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePassword(newPassword: string) {
  const supabaseClient = await createServerClient();
  const { data, error } = await supabaseClient.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
} 