'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { User, Dog } from '@/lib/db/schema';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, PawPrint, Trophy, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Fetch functions for TanStack Query
const fetchUser = async (): Promise<User | null> => {
  const response = await fetch('/api/user');
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

const fetchDogs = async (): Promise<Dog[]> => {
  const response = await fetch('/api/dogs');
  if (!response.ok) throw new Error('Failed to fetch dogs');
  return response.json();
};

const fetchStats = async () => {
  const response = await fetch('/api/stats');
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

function LifetimeAccessSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Lifetime Access</CardTitle>
      </CardHeader>
    </Card>
  );
}

function LifetimeAccess() {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-500" />
          Lifetime Access Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Status: {userData?.hasLifetimeAccess ? 'Active' : 'Inactive'}
              </p>
              <p className="text-sm text-muted-foreground">
                {userData?.hasLifetimeAccess 
                  ? `Purchased on ${userData.purchaseDate ? new Date(userData.purchaseDate).toLocaleDateString() : 'Unknown'}`
                  : 'Get lifetime access to all training content'
                }
              </p>
            </div>
            {userData?.hasLifetimeAccess && (
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline">
                  Manage Account
                </Button>
              </form>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DogsSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>My Dogs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dogs() {
  const { data: dogs } = useQuery({
    queryKey: ['dogs'],
    queryFn: fetchDogs,
  });

  if (!dogs?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-orange-500" />
            My Dogs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">No dogs added yet.</p>
          <Link href="/dashboard/dogs/add">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Dog
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-orange-500" />
          My Dogs ({dogs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dogs.map((dog: Dog) => (
            <Card key={dog.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {dog.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{dog.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {dog.breed || 'Unknown breed'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dog.age ? `${dog.age} years old` : 'Age unknown'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/dashboard/dogs/${dog.id}`}>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/training/${dog.id}`}>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                      Start Training
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/dashboard/dogs/add">
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Dog
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatsSkeleton() {
  return (
    <Card className="h-[200px]">
      <CardHeader>
        <CardTitle>Training Stats</CardTitle>
      </CardHeader>
    </Card>
  );
}

function QuickStats() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-orange-500" />
          Training Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {stats?.totalSessions || 0}
            </div>
            <div className="text-sm text-muted-foreground">Training Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {stats?.completedContent || 0}
            </div>
            <div className="text-sm text-muted-foreground">Lessons Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {stats?.totalHours || 0}
            </div>
            <div className="text-sm text-muted-foreground">Hours Trained</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {stats?.skillsMastered || 0}
            </div>
            <div className="text-sm text-muted-foreground">Skills Mastered</div>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/dashboard/progress">
            <Button variant="outline" className="w-full">
              View Detailed Progress
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to BreedBeast!</h1>
          <p className="text-gray-600 mt-2">
            Your journey to becoming a dog training expert starts here.
          </p>
        </div>

        <div className="space-y-8">
          <Suspense fallback={<LifetimeAccessSkeleton />}>
            <LifetimeAccess />
          </Suspense>

          <Suspense fallback={<DogsSkeleton />}>
            <Dogs />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<QuickStatsSkeleton />}>
              <QuickStats />
            </Suspense>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/dashboard/training">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Training Content
                  </Button>
                </Link>
                <Link href="/dashboard/schedule">
                  <Button variant="outline" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Training Session
                  </Button>
                </Link>
                <Link href="/dashboard/community">
                  <Button variant="outline" className="w-full">
                    <PawPrint className="mr-2 h-4 w-4" />
                    Join Community
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
