import { getUser, getUserDogs, createDog } from '@/lib/db/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const dogs = await getUserDogs(user.id);
    return NextResponse.json(dogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    
    // If it's an auth session error, return 401 instead of 500
    if (error instanceof Error && error.message.includes('Auth session missing')) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, breed, age, weight, temperament, trainingLevel } = body;

    if (!name) {
      return NextResponse.json({ error: 'Dog name is required' }, { status: 400 });
    }

    const newDog = await createDog({
      userId: user.id,
      name,
      breed,
      age,
      weight,
      temperament,
      trainingLevel
    });

    return NextResponse.json(newDog);
  } catch (error) {
    console.error('Error creating dog:', error);
    
    // If it's an auth session error, return 401 instead of 500
    if (error instanceof Error && error.message.includes('Auth session missing')) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 