import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, Package, Truck } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Container } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/motion';
import { formatPrice } from '@/lib/products';
import { userRequest } from '@/service/requestMethods';

const STEPS = [
  { icon: Check, title: 'Order received', body: 'Your M-PESA payment has been confirmed.' },
  { icon: Package, title: 'Being packed', body: 'We verify and pack every pair before it ships.' },
  { icon: Truck, title: 'On the way', body: 'Delivery countrywide, typically 1–3 working days.' },
];

const orderNumber = (id) => `#${String(id).slice(-8).toUpperCase()}`;

const OrderConfirmationPage = () => {
  const location = useLocation();
  const placed = location.state?.order;
  const [receipt, setReceipt] = useState(placed?.receipt);

  // Safaricom's callback, which carries the receipt, often lands a moment
  // after the payment is confirmed. Ask once more rather than show nothing.
  useEffect(() => {
    if (!placed?.orderId || receipt) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { data } = await userRequest.get(`orders/${placed.orderId}/status`);
        if (!cancelled && data.receipt) setReceipt(data.receipt);
      } catch {
        // The order is confirmed either way; the receipt is a nicety here.
      }
    }, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placed?.orderId, receipt]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main" className="flex-1">
        <Container width="narrow" className="pb-24 pt-16 text-center">
          <Reveal>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-volt text-volt-foreground">
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-7 font-display text-display-lg font-black uppercase leading-[0.95] tracking-tightest font-expanded">
              Order Confirmed
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Thank you. We have your order and will send confirmation to your phone.
            </p>
          </Reveal>

          {placed?.orderId && (
            <Reveal delay={0.17}>
              <dl className="mx-auto mt-10 grid max-w-sm grid-cols-2 gap-y-3 rounded-lg border border-line p-5 text-left text-sm">
                <dt className="text-muted-foreground">Order</dt>
                <dd className="tnum text-right font-semibold">{orderNumber(placed.orderId)}</dd>
                {placed.amount !== undefined && (
                  <>
                    <dt className="text-muted-foreground">Paid</dt>
                    <dd className="tnum text-right font-semibold">{formatPrice(placed.amount)}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">M-PESA receipt</dt>
                <dd className="tnum text-right font-semibold">
                  {receipt || <span className="font-normal text-muted-foreground">Arriving by SMS</span>}
                </dd>
              </dl>
            </Reveal>
          )}

          <Reveal delay={0.2}>
            <ol className="mx-auto mt-14 max-w-sm space-y-6 text-left">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="flex gap-4">
                    <span
                      className={
                        // The first step is done; the rest are upcoming.
                        index === 0
                          ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background'
                          : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-muted-foreground'
                      }
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-[0.9375rem] font-semibold">{step.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link to="/products">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/my-account">View My Orders</Link>
              </Button>
            </div>
          </Reveal>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
