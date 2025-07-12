import { NextResponse } from 'next/server';
import { signOut } from '@/lib/supabase/auth';

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    // Even if there's an error, return success to clear client state
    return NextResponse.json({ success: true });
  }
} 