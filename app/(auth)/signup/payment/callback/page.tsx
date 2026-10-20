import { Suspense } from 'react';
import SubscriptionPaymentCallbackClient from './payment-callback-client';

export default function SubscriptionPaymentCallbackPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading payment confirmation...</main>}>
      <SubscriptionPaymentCallbackClient />
    </Suspense>
  );
}
