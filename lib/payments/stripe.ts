import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { User } from '@/lib/db/schema';
import {
  getUser,
  updateUserLifetimeAccess,
  getUserByStripeCustomerId,
  updateUserStripeCustomerId
} from '@/lib/db/queries';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

export async function createLifetimeCheckoutSession({
  user,
  priceId
}: {
  user: User | null;
  priceId: string;
}) {
  if (!user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // Create or get Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.name || undefined,
      metadata: {
        userId: user.id
      }
    });
    customerId = customer.id;
    
    // Update user with Stripe customer ID
    await updateUserStripeCustomerId(user.id, customerId);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'payment', // Changed from 'subscription' to 'payment'
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: customerId,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    // Remove trial_period_days since it's a one-time payment
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(user: User) {
  if (!user.stripeCustomerId) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    // Create a simple configuration for lifetime access customers
    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your account'
      },
      features: {
        payment_method_update: {
          enabled: true
        },
        invoice_history: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
}

export async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent
) {
  const customerId = paymentIntent.customer as string;
  const paymentIntentId = paymentIntent.id;
  const status = paymentIntent.status;

  console.log('Payment success handler called:', { customerId, paymentIntentId, status });

  // Find user by Stripe customer ID
  const user = await getUserByStripeCustomerId(customerId);

  if (!user) {
    console.error('User not found for Stripe customer:', customerId);
    return;
  }

  console.log('Found user:', { userId: user.id, email: user.email });

  if (status === 'succeeded') {
    console.log('Updating user lifetime access for user:', user.id);
    await updateUserLifetimeAccess(user.id, {
      hasLifetimeAccess: true,
      stripePaymentIntentId: paymentIntentId,
      purchaseDate: new Date()
    });
    console.log('Successfully updated user lifetime access');
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'one_time' // Changed from 'recurring' to 'one_time'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    // Remove interval and trialPeriodDays since it's one-time payment
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}



// Legacy functions for migration (keeping for now)
export async function createCheckoutSession({
  team,
  priceId
}: {
  team: any;
  priceId: string;
}) {
  const user = await getUser();

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14
    }
  });

  redirect(session.url!);
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  // This is legacy code - keeping for migration
  console.log('Legacy subscription change handled:', { customerId, subscriptionId, status });
}
