'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, LoaderCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CallbackState = 'verifying' | 'failed';

export default function SubscriptionPaymentCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>('verifying');
  const [message, setMessage] = useState('Confirming your payment securely...');
  const [retrying, setRetrying] = useState(false);
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    let active = true;
    if (!reference) {
      setState('failed');
      setMessage('No payment reference was returned. Your store has not been activated.');
      return;
    }

    fetch('/api/auth/onboard/subscription/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success || !result.data?.store_id) {
          throw new Error(result.message || 'Payment is not confirmed yet.');
        }
        localStorage.setItem('store_name', result.data.store_name);
        localStorage.setItem('store_id', result.data.store_id);
        if (result.data.store_url) localStorage.setItem('store_url', result.data.store_url);
        if (result.data.qrCode) localStorage.setItem('qrCode', result.data.qrCode);
        if (result.data.user_id) localStorage.setItem('user_id', result.data.user_id);
        if (result.data.user_email) localStorage.setItem('user_email', result.data.user_email);
        sessionStorage.removeItem('v2_subscription_signup_payload');
        if (active) router.replace('/dashboard');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState('failed');
        setMessage(error instanceof Error ? error.message : 'Payment confirmation failed.');
      });

    return () => { active = false; };
  }, [reference, router]);

  async function retryPayment() {
    const rawPayload = sessionStorage.getItem('v2_subscription_signup_payload');
    if (!rawPayload) {
      router.replace('/signup');
      return;
    }

    setRetrying(true);
    try {
      const response = await fetch('/api/auth/onboard/subscription/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rawPayload,
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.data?.authorization_url) {
        throw new Error(result.message || 'Unable to restart payment.');
      }
      window.location.assign(result.data.authorization_url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to restart payment.');
      setRetrying(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md space-y-5 text-center">
        {state === 'verifying' ? (
          <LoaderCircle className="mx-auto size-10 animate-spin text-primary" />
        ) : (
          <CheckCircle2 className="mx-auto size-10 text-destructive" />
        )}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">
            {state === 'verifying' ? 'Verifying subscription payment' : 'Payment not confirmed'}
          </h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          {state === 'failed' && (
            <p className="text-sm text-muted-foreground">Your store remains inactive until payment succeeds.</p>
          )}
        </div>
        {state === 'failed' && (
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={retryPayment} disabled={retrying}>
              {retrying ? <LoaderCircle className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
              Retry payment
            </Button>
            <Button variant="outline" onClick={() => router.replace('/signup')}>
              Return to signup
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
