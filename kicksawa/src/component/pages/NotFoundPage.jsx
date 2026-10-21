import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Container } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/motion';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />

    <main id="main" className="flex flex-1 items-center">
      <Container width="narrow" className="py-24 text-center">
        {/* The numeral was previously a 10%-opacity ghost, which failed
            contrast and hid the one thing that explains the page. It is now
            the headline; "Wrong Turn" carries the tone underneath. */}
        <Reveal>
          <h1 className="font-display text-[clamp(5rem,22vw,13rem)] font-black uppercase leading-[0.8] tracking-tightest font-expanded">
            404
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-4 font-display text-display-sm font-extrabold uppercase font-wide">
            Wrong Turn
          </p>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            That page does not exist or has moved. The shop is still open.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link to="/products">Browse Products</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">Back Home</Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </main>

    <Footer />
  </div>
);

export default NotFoundPage;
