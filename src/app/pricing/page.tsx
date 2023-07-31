'use client';

import { CheckIcon } from '@heroicons/react/20/solid';
import Button from '@src/components/ui/Button';
import { postData } from '@src/utils/helpers';
import { getStripe } from '@src/utils/stripe-client';
import cn from 'classnames';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const includedFeatures = [
  'Private forum access',
  'Member resources',
  'Entry to annual conference',
  'Official member t-shirt',
];

const products = [
  {
    active: true,
    description: 'Most Basic',
    id: '1',
    image: null,
    metadata: null,
    name: 'Connect Domain',
    prices: [
      {
        active: true,
        currency: 'USD',
        description: 'Most Basic',
        id: 'price_1NZt1eHXs5yjPpZJZ0Jbk9nD',
        interval: 'month',
        interval_count: 1,
        metadata: null,
        product_id: null,
        trial_period_days: 14,
        type: 'website',
        unit_amount: 600,
      },
      {
        active: true,
        currency: 'USD',
        description: 'For Personal Use',
        id: 'price_1NZt1eHXs5yjPpZJZ0Jbk9nD',
        interval: 'year',
        interval_count: 1,
        metadata: null,
        product_id: null,
        trial_period_days: 14,
        type: 'mobile',
        unit_amount: 400,
      },
    ],
  },
  {
    active: true,
    description: 'For Personal Use',
    id: '2',
    image: null,
    metadata: null,
    name: 'Combo',
    prices: [
      {
        active: true,
        currency: 'USD',
        description: 'Most Basic',
        id: '1',
        interval: 'month',
        interval_count: 1,
        metadata: null,
        product_id: null,
        trial_period_days: 14,
        type: 'website',
        unit_amount: 800,
      },
      {
        active: true,
        currency: 'USD',
        description: 'For Personal Use',
        id: '2',
        interval: 'year',
        interval_count: 1,
        metadata: null,
        product_id: null,
        trial_period_days: 14,
        type: 'mobile',
        unit_amount: 600,
      },
    ],
  },
  {
    active: true,
    description: 'Entrepreneurs & Freelancers',
    id: '3',
    image: null,
    metadata: null,
    name: 'Unlimited',
    prices: [
      {
        active: true,
        currency: 'USD',
        description: 'Most Basic',
        id: '1',
        interval: 'month',
        interval_count: 1,
        metadata: null,
        product_id: null,
        trial_period_days: 14,
        type: 'website',
        unit_amount: 1000,
      },
      {
        active: true,
        currency: 'USD',
        description: 'For Personal Use',
        id: '2',
        interval: 'year',
        interval_count: 1,
        metadata: null,
        product_id: null,
        trial_period_days: 14,
        type: 'mobile',
        unit_amount: 800,
      },
    ],
  },
];

type Subscription = {
  cancel_at: string | null;
  cancel_at_period_end: boolean | null;
  canceled_at: string | null;
  created: string;
  current_period_end: string;
  current_period_start: string;
  ended_at: string | null;
  id: string;
  metadata: any;
  price_id: string | null;
  quantity: number | null;
  status: any;
  trial_end: string | null;
  trial_start: string | null;
  user_id: string;
};
type Product = {
  active: boolean | null;
  description: string | null;
  id: string;
  image: string | null;
  metadata: any;
  name: string | null;
};
type Price = {
  active: boolean | null;
  currency: string | null;
  description: string | null;
  id: string;
  interval: any;
  interval_count: number | null;
  metadata: any;
  product_id: string | null;
  trial_period_days: number | null;
  type: any;
  unit_amount: number | null;
};
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  session?: any;
  user?: any;
  products?: ProductWithPrices[];
  subscription?: SubscriptionWithProduct | null;
}

type BillingPlan = 'website' | 'mobile';

export default function Pricing({ session, user, subscription }: Props) {
  const plans = Array.from(
    new Set(products?.flatMap((product) => product?.prices?.map((price) => price?.type))),
  );
  const router = useRouter();
  const [billingPlan, setBillingPlan] = useState<BillingPlan>('website');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    // if (!user) {
    //   return router.push('/signin');
    // }
    // if (subscription) {
    //   return router.push('/account');
    // }
    try {
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price },
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      return alert((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
    setTimeout(() => {
      setPriceIdLoading(undefined);
    }, 3000);
  };

  if (!products?.length)
    return (
      <section className="bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center"></div>
          <p className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            No subscription pricing plans found. Create them in your{' '}
            <a
              className="text-pink-500 underline"
              href="https://dashboard.stripe.com/products"
              rel="noopener noreferrer"
              target="_blank"
            >
              Stripe Dashboard
            </a>
            .
          </p>
        </div>
        <LogoCloud />
      </section>
    );

  if (products.length === 1)
    return (
      <section className="bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
              Pricing Plans
            </h1>
            <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
              Start building for free, then add a site plan to go live. Account plans unlock
              additional features.
            </p>
            <div className="relative flex self-center mt-12 border rounded-lg bg-zinc-900 border-zinc-800">
              <div className="border border-pink-500 border-opacity-50 divide-y rounded-lg shadow-sm bg-zinc-900 divide-zinc-600">
                <div className="p-6 py-2 m-1 text-2xl font-medium text-white rounded-md shadow-sm border-zinc-800 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8">
                  {products[0].name}
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-4 sm:mt-12 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
              {products[0].prices?.map((price) => {
                const priceString =
                  price.unit_amount &&
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: price.currency!,
                    minimumFractionDigits: 0,
                  }).format(price.unit_amount / 100);

                return (
                  <div
                    key={price.interval}
                    className="divide-y rounded-lg shadow-sm divide-zinc-600 bg-zinc-900"
                  >
                    <div className="p-6">
                      <p>
                        <span className="text-5xl font-extrabold white">{priceString}</span>
                        <span className="text-base font-medium text-zinc-100">
                          /{price.interval}
                        </span>
                      </p>
                      <p className="mt-4 text-zinc-300">{price.description}</p>
                      <Button
                        variant="slim"
                        type="button"
                        disabled={false}
                        loading={priceIdLoading === price.id}
                        onClick={() => handleCheckout(price)}
                        className="mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        {products[0].name === subscription?.prices?.products?.name
                          ? 'Manage'
                          : 'Subscribe'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <LogoCloud />
        </div>
      </section>
    );

  return (
    <section className="bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Pricing Plans
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Start building for free, then add a site plan to go live. Account plans unlock
            additional features.
          </p>
          <div className="relative self-center mt-6 bg-zinc-900 rounded-lg p-0.5 flex sm:mt-8 border border-zinc-800">
            {plans.includes('website') && (
              <button
                onClick={() => setBillingPlan('website')}
                type="button"
                className={`${
                  billingPlan === 'website'
                    ? 'relative w-1/2 bg-zinc-700 border-zinc-800 shadow-sm text-white'
                    : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-400'
                } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8`}
              >
                Website Plans
              </button>
            )}
            {plans.includes('mobile') && (
              <button
                onClick={() => setBillingPlan('mobile')}
                type="button"
                className={`${
                  billingPlan === 'mobile'
                    ? 'relative w-1/2 bg-zinc-700 border-zinc-800 shadow-sm text-white'
                    : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-400'
                } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8`}
              >
                Mobile App Plans
              </button>
            )}
          </div>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {products.map((product) => {
            const price = product?.prices?.find((price) => price.type === billingPlan);
            if (!price) return null;
            const priceString = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency!,
              minimumFractionDigits: 0,
            }).format((price?.unit_amount || 0) / 100);
            return (
              <div
                key={product.id}
                className={cn('rounded-lg shadow-sm divide-y divide-zinc-600 bg-zinc-900', {
                  'border border-pink-500': subscription
                    ? product.name === subscription?.prices?.products?.name
                    : product.name === 'Freelancer',
                })}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold tracking-tight leading-6 text-white">
                    {product.name}
                  </h2>
                  <p className="mt-4 text-zinc-300">{product.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-2">
                    <span className="text-5xl font-extrabold white">{priceString}</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-zinc-100">
                      /{product?.prices[0]?.interval}
                    </span>
                  </p>

                  <div className="mt-10 flex items-center gap-x-4">
                    <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">
                      What’s included
                    </h4>
                    <div className="h-px flex-auto bg-gray-100" />
                  </div>
                  <ul role="list" className="mt-8 gap-4 text-sm leading-6 text-gray-600 sm:gap-6">
                    {includedFeatures.map((feature) => (
                      <li key={feature} className="flex gap-x-3 py-1 text-zinc-300">
                        <CheckIcon
                          className="h-6 w-5 flex-none text-indigo-600"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="slim"
                    type="button"
                    loading={priceIdLoading === price.id}
                    onClick={() => handleCheckout(price)}
                    className="mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {subscription ? 'Manage' : 'Subscribe'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <LogoCloud />
      </div>
    </section>
  );
}

function LogoCloud() {
  return (
    <div>
      <p className="mt-24 text-xs uppercase text-zinc-400 text-center font-bold tracking-[0.3em]">
        Brought to you by
      </p>
      <div className="flex flex-col items-center my-12 space-y-4 sm:mt-8 sm:space-y-0 md:mx-auto md:max-w-2xl sm:grid sm:gap-6 sm:grid-cols-5">
        <div className="flex items-center justify-start">
          <a href="https://nextjs.org" aria-label="Next.js Link">
            <img src="/nextjs.svg" alt="Next.js Logo" className="h-12 text-white" />
          </a>
        </div>
        <div className="flex items-center justify-start">
          <a href="https://vercel.com" aria-label="Vercel.com Link">
            <img src="/vercel.svg" alt="Vercel.com Logo" className="h-6 text-white" />
          </a>
        </div>
        <div className="flex items-center justify-start">
          <a href="https://stripe.com" aria-label="stripe.com Link">
            <img src="/stripe.svg" alt="stripe.com Logo" className="h-12 text-white" />
          </a>
        </div>
        <div className="flex items-center justify-start">
          <a href="https://supabase.io" aria-label="supabase.io Link">
            <img src="/supabase.svg" alt="supabase.io Logo" className="h-10 text-white" />
          </a>
        </div>
        <div className="flex items-center justify-start">
          <a href="https://github.com" aria-label="github.com Link">
            <img src="/github.svg" alt="github.com Logo" className="h-8 text-white" />
          </a>
        </div>
      </div>
    </div>
  );
}
