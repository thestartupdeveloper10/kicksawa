import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, Smartphone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/products';
import { userRequest } from '@/service/requestMethods';
import { cn } from '@/lib/utils';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~60s, roughly how long the prompt stays on the handset

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Safaricom expects 2547XXXXXXXX. Accept the ways people actually type it. */
const normalizePhone = (input) => {
  const digits = String(input).replace(/\D/g, '');
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  return null;
};

const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-semibold" htmlFor={children.props.id}>
      {label}
    </label>
    {children}
    {error ? (
      <p className="mt-1.5 text-sm text-destructive">{error}</p>
    ) : (
      hint && <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
    )}
  </div>
);

const inputClass = (invalid) =>
  cn(
    'h-12 w-full rounded-lg border bg-background px-3.5 text-sm outline-none',
    'transition-[border-color,box-shadow] duration-fast ease-swift',
    'placeholder:text-muted-foreground',
    'focus:border-foreground',
    'disabled:opacity-60',
    invalid ? 'border-destructive' : 'border-line-strong'
  );

function PaymentForm({ onSuccess, cartTotal, userId, cartItems }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // The poll loop outlives a fast unmount (dialog closed mid-payment), so it
  // has to stop touching state once the form is gone.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const pollPaymentStatus = async (checkoutRequestId) => {
    for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
      await wait(POLL_INTERVAL_MS);
      if (!alive.current) return { status: 'abandoned' };
      const { data } = await userRequest.post('checkout/payment-status', { checkoutRequestId });
      if (data.status !== 'pending') return data;
    }
    return { status: 'timeout' };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const msisdn = normalizePhone(phoneNumber);
    const errors = {};
    if (!msisdn) errors.phone = 'Enter a valid Safaricom number, e.g. 0712 345 678.';
    if (address.trim().length < 6) errors.address = 'Add a delivery address we can find.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setFailed(false);
    setMessage('Check your phone and enter your M-PESA PIN to approve.');

    try {
      const { data: push } = await userRequest.post('checkout/initiate-payment', {
        phoneNumber: msisdn,
        amount: cartTotal,
      });

      if (!push.CheckoutRequestID) {
        throw new Error(push.errorMessage || 'Could not reach M-PESA');
      }

      const result = await pollPaymentStatus(push.CheckoutRequestID);
      if (!alive.current) return;

      if (result.status === 'success') {
        await userRequest.post('orders', {
          userId,
          products: cartItems.map((item) => ({ productId: item._id, quantity: item.quantity })),
          amount: cartTotal,
          address: { details: address },
        });
        onSuccess?.();
        return;
      }

      setFailed(true);
      setMessage(
        result.status === 'timeout'
          ? 'No confirmation yet. If you were charged, check M-PESA before paying again.'
          : result.resultDesc || 'The payment was not completed. Your bag has been kept.'
      );
    } catch (error) {
      console.error(error);
      if (!alive.current) return;
      setFailed(true);
      setMessage('Something went wrong reaching M-PESA. Please try again.');
    } finally {
      if (alive.current) setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field
        label="M-PESA Phone Number"
        hint="You will get a prompt on this number."
        error={fieldErrors.phone}
      >
        <input
          id="pay-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="0712 345 678"
          disabled={loading}
          aria-invalid={Boolean(fieldErrors.phone)}
          className={inputClass(fieldErrors.phone)}
        />
      </Field>

      <Field label="Delivery Address" error={fieldErrors.address}>
        <textarea
          id="pay-address"
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Kilimani, Nairobi — Apartment 4B"
          disabled={loading}
          aria-invalid={Boolean(fieldErrors.address)}
          className={cn(inputClass(fieldErrors.address), 'h-auto resize-none py-3')}
        />
      </Field>

      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm font-semibold">Amount to pay</span>
        <span className="tnum text-lg font-semibold">{formatPrice(cartTotal)}</span>
      </div>

      <Button type="submit" size="lg" block disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Waiting for approval…
          </>
        ) : (
          <>
            <Smartphone className="h-4 w-4" strokeWidth={2} />
            Pay with M-PESA
          </>
        )}
      </Button>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'flex gap-2.5 rounded-lg p-3.5 text-sm',
            failed
              ? 'bg-destructive/10 text-destructive'
              : 'bg-surface text-muted-foreground'
          )}
        >
          {failed ? (
            <AlertCircle className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={2} />
          ) : (
            <Smartphone className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={2} />
          )}
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}

export default PaymentForm;
