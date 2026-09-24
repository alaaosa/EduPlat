import Stripe from 'stripe';

export const StripeProvider = {
  provide: 'STRIPE',
  useFactory: () => {
    return new Stripe(process.env.STRIPE_SECRET_KEY!);
  },
};
