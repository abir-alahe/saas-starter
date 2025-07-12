import { getUser, getTrainingSessions, getUserProgress } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const [sessions, progress] = await Promise.all([
      getTrainingSessions(user.id),
      getUserProgress(user.id)
    ]);

    const totalSessions = sessions.length;
    const completedContent = progress.filter(p => p.progress.status === 'completed').length;
    const totalHours = sessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const skillsMastered = progress.filter(p => p.progress.status === 'completed').length;

    return NextResponse.json({
      totalSessions,
      completedContent,
      totalHours: Math.round(totalHours * 10) / 10,
      skillsMastered
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    
    // If it's an auth session error, return 401 instead of 500
    if (error instanceof Error && error.message.includes('Auth session missing')) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 