import { Link } from 'react-router-dom';
import { Check, Package, Truck } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Container } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/motion';

const STEPS = [
  { icon: Check, title: 'Order received', body: 'Your M-PESA payment has been confirmed.' },
  { icon: Package, title: 'Being packed', body: 'We verify and pack every pair before it ships.' },
  { icon: Truck, title: 'On the way', body: 'Delivery countrywide, typically 1–3 working days.' },
];

const OrderConfirmationPage = () => (
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

export default OrderConfirmationPage;
