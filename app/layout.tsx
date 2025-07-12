import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';

export const metadata: Metadata = {
  title: 'BreedBeast - Dog Training Made Easy',
  description: 'Transform your furry best friend into a well-behaved companion with our proven training methods. Get lifetime access to all training content.',
  keywords: 'dog training, puppy training, dog obedience, dog tricks, behavior modification, dog training app',
  authors: [{ name: 'BreedBeast Team' }],
  openGraph: {
    title: 'BreedBeast - Dog Training Made Easy',
    description: 'Transform your furry best friend into a well-behaved companion with our proven training methods.',
    type: 'website',
    images: ['/assets/image/front-view-cute-shiba-inu-dog.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BreedBeast - Dog Training Made Easy',
    description: 'Transform your furry best friend into a well-behaved companion with our proven training methods.',
    images: ['/assets/image/front-view-cute-shiba-inu-dog.png'],
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50" suppressHydrationWarning>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
