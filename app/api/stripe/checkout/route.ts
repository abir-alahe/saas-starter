import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { getUserByStripeCustomerId, updateUserLifetimeAccess } from '@/lib/db/queries';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'payment_intent'],
    });

    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data from Stripe.');
    }

    const customerId = session.customer.id;
    const paymentIntentId = session.payment_intent as string;

    if (!paymentIntentId) {
      throw new Error('No payment intent found for this session.');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment was not successful.');
    }

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found in database.');
    }

    // Update user with lifetime access
    await updateUserLifetimeAccess(userId, {
      hasLifetimeAccess: true,
      stripePaymentIntentId: paymentIntentId,
      purchaseDate: new Date()
    });

    // Update user's Stripe customer ID if not already set
    if (!user[0].stripeCustomerId) {
      await db
        .update(users)
        .set({
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Don't try to set a custom session - let the user sign in normally
    // Redirect to sign-in with success message
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('success', 'payment_completed');
    signInUrl.searchParams.set('email', user[0].email || '');
    return NextResponse.redirect(signInUrl);
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    // Redirect to pricing page with error message instead of generic error page
    const errorUrl = new URL('/pricing', request.url);
    errorUrl.searchParams.set('error', 'payment_processing');
    return NextResponse.redirect(errorUrl);
  }
}
