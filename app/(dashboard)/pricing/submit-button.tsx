'use client';

import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="w-full">
      <Button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-3 rounded-xl font-semibold"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          'Get Lifetime Access Now'
        )}
      </Button>
    </div>
  );
}
