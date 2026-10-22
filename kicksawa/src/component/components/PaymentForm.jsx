import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, Smartphone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/products';
import { userRequest } from '@/service/requestMethods';
import { updateUser } from '@/redux/userRedux';
import { cn } from '@/lib/utils';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~60s, roughly how long the prompt stays on the handset

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
 * Idempotency. Each checkout attempt carries a key; sending the same key again
 * (a double tap, a retry after the connection dropped, reopening the dialog
 * mid-payment) gets the original order back from the server instead of a
 * second prompt on the customer's phone. The attempt is kept in sessionStorage
 * so closing the dialog or reloading does not mint a fresh key.
 */
const ATTEMPT_STORAGE_KEY = 'kicksawa.checkoutAttempt';

const newKey = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const readAttempt = () => {
  try {
    return JSON.parse(sessionStorage.getItem(ATTEMPT_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

const saveAttempt = (attempt) => {
  try {
    if (attempt) sessionStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(attempt));
    else sessionStorage.removeItem(ATTEMPT_STORAGE_KEY);
  } catch {
    // Storage blocked: the in-memory attempt still covers this visit.
  }
};

/** Same key for the same request; a changed bag, phone or address is a new attempt. */
const attemptFor = (current, fingerprint) =>
  current && current.fingerprint === fingerprint ? current : { key: newKey(), fingerprint };

/** No response at all means the request may or may not have landed; resending is safe with the same key. */
const postCheckout = async (payload, key) => {
  const send = () =>
    userRequest.post('orders/checkout', payload, { headers: { 'Idempotency-Key': key } });
  try {
    return await send();
  } catch (error) {
    if (error.response) throw error;
    await wait(1000);
    return send();
  }
};

/** Safaricom expects 2547XXXXXXXX. Accept the ways people actually type it. */
const normalizePhone = (input) => {
  const digits = String(input).replace(/\D/g, '');
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  return null;
};

/**
 * A saved profile number, shown the way people write it: 0712 345 678.
 * Anything else on the profile (including its 'Not Provided' default) gives
 * an empty field rather than text that would fail validation.
 */
const displayPhone = (input) => {
  const msisdn = normalizePhone(input);
  if (!msisdn) return '';
  const local = `0${msisdn.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
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

function PaymentForm({ onSuccess, cartTotal, cartItems }) {
  // Start from the number on their profile so most customers only confirm it.
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const savedPhone = currentUser?.phone;
  const [phoneNumber, setPhoneNumber] = useState(() => displayPhone(savedPhone));
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // The poll loop outlives a fast unmount (dialog closed mid-payment), so it
  // has to stop touching state once the form is gone.
  const alive = useRef(true);
  const attempt = useRef(readAttempt());
  const setAttempt = (next) => {
    attempt.current = next;
    saveAttempt(next);
  };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // The server decides whether the order is paid; this only asks it.
  const pollPaymentStatus = async (orderId) => {
    for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
      await wait(POLL_INTERVAL_MS);
      if (!alive.current) return { paymentStatus: 'abandoned' };
      const { data } = await userRequest.get(`orders/${orderId}/status`);
      if (data.paymentStatus !== 'awaiting') return data;
    }
    return { paymentStatus: 'timeout' };
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

    // Only what was chosen goes up. The server prices the order from the
    // catalogue and charges that, whatever this page believes the total is.
    const payload = {
      items: cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        size: item.selectedSize || undefined,
        color: item.selectedColor || undefined,
      })),
      address,
      phone: msisdn,
    };
    setAttempt(attemptFor(attempt.current, JSON.stringify(payload)));

    try {
      const { data: order } = await postCheckout(payload, attempt.current.key);
      if (!alive.current) return;

      if (order.amount !== cartTotal) {
        setMessage(
          `Prices have changed since you added these. Approve ${formatPrice(order.amount)} on your phone.`
        );
      }

      const result = await pollPaymentStatus(order.orderId);
      if (!alive.current) return;

      if (result.paymentStatus === 'paid') {
        setAttempt(null);
        // The server saves a paying number to a profile that had none; mirror
        // that locally so the next checkout is prefilled without a re-login.
        if ([undefined, null, '', 'Not Provided'].includes(savedPhone) || /^Google-/.test(savedPhone)) {
          dispatch(updateUser({ ...currentUser, phone: `0${msisdn.slice(3)}` }));
        }
        onSuccess?.({ orderId: order.orderId, amount: result.amount, receipt: result.receipt });
        return;
      }

      // A timeout keeps the key: paying again re-checks the same order rather
      // than prompting twice. Any settled outcome frees the next tap to start
      // a new attempt.
      if (result.paymentStatus !== 'timeout' && result.paymentStatus !== 'abandoned') {
        setAttempt(null);
      }
      setFailed(true);
      setMessage(
        result.paymentStatus === 'timeout'
          ? "No confirmation yet. Tap Pay again to check: you won't get a second prompt for this order."
          : result.resultDesc || 'The payment was not completed. Your bag has been kept.'
      );
    } catch (error) {
      console.error(error);
      // The server has settled this attempt (prompt failed, or the key was
      // refused), so the next try needs a key of its own.
      const status = error.response?.status;
      if (status === 422 || status >= 500) setAttempt(null);
      if (!alive.current) return;
      setFailed(true);
      setMessage(error.response?.data?.error || 'Something went wrong reaching M-PESA. Please try again.');
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
