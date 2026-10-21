import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Container, Section } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Reveal, TextReveal } from '@/components/ui/motion';

const IMAGE =
  'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=75';

/**
 * The page's mid-point statement.
 *
 * Asymmetric on purpose: the image column runs taller than the text column and
 * the copy is pinned to the bottom, so the two halves interlock instead of
 * sitting as a tidy 50/50 split.
 */
const EditorialSplit = () => (
  <Section padding="lg">
    <Container>
      <div className="grid items-stretch gap-4 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-7">
          <div className="relative h-full overflow-hidden bg-surface">
            <img
              src={IMAGE}
              alt="Streetwear layering photographed against a poster wall"
              loading="lazy"
              decoding="async"
              className="h-full min-h-[320px] w-full object-cover sm:min-h-[440px] lg:min-h-[560px]"
            />
          </div>
        </Reveal>

        <Reveal
          delay={0.1}
          className="flex flex-col justify-end bg-foreground p-8 text-background sm:p-10 lg:col-span-5 lg:p-12"
        >
          <p className="mb-5 flex items-center gap-3 text-eyebrow font-bold uppercase text-background/60">
            <span className="h-px w-8 bg-volt" />
            The Culture
          </p>

          <TextReveal
            as="h2"
            lines={['Worn In,', 'Never Worn', 'Out.']}
            className="font-display text-display-lg font-black uppercase leading-[0.9] tracking-tightest font-expanded"
          />

          <p className="mt-6 max-w-sm text-background/70">
            Every pair we stock is verified authentic and sourced from the brands
            that shaped the streets. No replicas, no compromises.
          </p>

          <div className="mt-8">
            <Button asChild variant="inverse" size="lg" className="dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-950/85">
              <Link to="/products">
                Shop The Edit
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </Container>
  </Section>
);

export default EditorialSplit;
