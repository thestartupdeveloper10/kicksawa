import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import { Container } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { EASE_OUT_QUINT, TextReveal } from '@/components/ui/motion';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=2400&q=75';

/**
 * Full-bleed opening statement.
 *
 * The image is chosen so its subject sits right of centre, leaving the left
 * third clear for the lockup — the type never fights the photograph. A single
 * orchestrated entrance (masked headline wiping up, supporting copy following)
 * carries the whole page load; nothing else on the page animates this hard.
 */
const HeroSection = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate flex min-h-[88svh] items-end overflow-hidden bg-neutral-950">
      <motion.img
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        initial={reduceMotion ? false : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: EASE_OUT_QUINT }}
      />

      {/* Two scrims rather than one: a bottom-up ramp for the lockup and a
          left-to-right wash so the type keeps contrast over the busy wall. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/20 to-transparent"
      />

      <Container className="relative pb-16 pt-32 sm:pb-20 lg:pb-24">
        <div className="max-w-3xl">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_QUINT, delay: 0.1 }}
            className="mb-5 flex items-center gap-3 text-eyebrow font-bold uppercase text-white/70"
          >
            <span className="h-px w-8 bg-volt" />
            New Season · Nairobi
          </motion.p>

          <TextReveal
            lines={['The Street', 'Is Yours']}
            delay={0.22}
            className="font-display text-display-xl font-black uppercase leading-[0.86] tracking-tightest text-white font-expanded"
          />

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_OUT_QUINT, delay: 0.55 }}
            className="mt-6 max-w-md text-base text-white/75 sm:text-lg"
          >
            Authentic sneakers and streetwear from the brands that built the culture.
            Delivered countrywide.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_OUT_QUINT, delay: 0.68 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button asChild variant="inverse" size="lg">
              <Link to="/products">Shop New Arrivals</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:border-white hover:bg-white/10"
            >
              <Link to="/brands">
                Explore Brands
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
