import { lifetimeCheckoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const lifetimePlan = products.find((product) => product.name === 'Lifetime Access');
  const lifetimePrice = prices.find((price) => price.productId === lifetimePlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Get Lifetime Access to BreedBeast
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          One payment, unlimited access to all training content, updates, and features forever.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <PricingCard
          name={lifetimePlan?.name || 'Lifetime Access'}
          price={lifetimePrice?.unitAmount || 9900} // $99.00
          features={[
            'Unlimited access to all training content',
            'Basic commands training',
            'Advanced tricks and games',
            'Behavior modification guides',
            'Puppy training schedules',
            'Progress tracking for multiple dogs',
            'Video tutorials and demonstrations',
            'Community support',
            'Lifetime updates and new content',
            'Mobile-friendly training app',
            'Printable training guides',
            'Expert tips and advice',
          ]}
          priceId={lifetimePrice?.id}
        />
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Why Choose Lifetime Access?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div>
            <div className="text-4xl text-orange-500 mb-2">💎</div>
            <h3 className="text-lg font-semibold mb-2">Best Value</h3>
            <p className="text-gray-600">
              Pay once and get access to everything forever. No monthly fees, no hidden costs.
            </p>
          </div>
          <div>
            <div className="text-4xl text-orange-500 mb-2">🚀</div>
            <h3 className="text-lg font-semibold mb-2">Always Updated</h3>
            <p className="text-gray-600">
              Get all future content and updates included at no additional cost.
            </p>
          </div>
          <div>
            <div className="text-4xl text-orange-500 mb-2">🐕</div>
            <h3 className="text-lg font-semibold mb-2">Multiple Dogs</h3>
            <p className="text-gray-600">
              Train as many dogs as you want with one lifetime membership.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What's Included in Your Lifetime Access?
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-orange-600">Training Content</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Basic obedience commands</li>
              <li>• Advanced tricks and stunts</li>
              <li>• Behavior modification</li>
              <li>• Puppy training essentials</li>
              <li>• Agility and sports training</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-orange-600">Tools & Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Progress tracking dashboard</li>
              <li>• Training session scheduler</li>
              <li>• Video tutorials</li>
              <li>• Printable guides</li>
              <li>• Community forum access</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  features,
  priceId,
}: {
  name: string;
  price: number;
  features: string[];
  priceId?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{name}</h2>
        <div className="mb-4">
          <span className="text-5xl font-bold text-orange-500">${price / 100}</span>
          <span className="text-xl text-gray-600 ml-2">one-time</span>
        </div>
        <p className="text-gray-600">
          No recurring fees • Lifetime access • All future updates included
        </p>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <form action={lifetimeCheckoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          30-day money-back guarantee • Secure payment via Stripe
        </p>
      </div>
    </div>
  );
}
