'use server';

import { redirect } from 'next/navigation';
import { createLifetimeCheckoutSession, createCustomerPortalSession } from './stripe';
import { getUser } from '@/lib/db/queries';

export const lifetimeCheckoutAction = async (formData: FormData) => {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const priceId = formData.get('priceId') as string;
  await createLifetimeCheckoutSession({ user, priceId });
};

export const customerPortalAction = async () => {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const portalSession = await createCustomerPortalSession(user);
  redirect(portalSession.url);
};

// Legacy actions for migration (keeping for now)
export const checkoutAction = async (formData: FormData) => {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const priceId = formData.get('priceId') as string;
  // This would need to be updated to work with the new system
  console.log('Legacy checkout action called');
};
