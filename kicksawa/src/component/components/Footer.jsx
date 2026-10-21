import { ArrowRight, BadgeCheck, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BRANDS, FOOTER_COLUMNS, FREE_DELIVERY_THRESHOLD, SITE } from '@/lib/site';
import { Container } from '@/components/ui/layout';
import { Marquee } from '@/components/ui/motion';

const PROMISE_ICONS = { delivery: Truck, secure: ShieldCheck, authentic: BadgeCheck };

const PROMISES = [
  { key: 'delivery', label: 'Countrywide Delivery' },
  { key: 'secure', label: 'Secure M-Pesa Checkout' },
  { key: 'authentic', label: '100% Authentic' },
];

const TICKER = [
  `Free delivery over Ksh ${FREE_DELIVERY_THRESHOLD.toLocaleString('en-KE')}`,
  '100% Authentic',
  'Countrywide shipping',
  'Pay with M-Pesa',
];

const LEGAL = [
  { label: 'Privacy Policy', href: '/contact-us' },
  { label: 'Terms of Sale', href: '/contact-us' },
  { label: 'Returns', href: '/contact-us' },
];

/**
 * The footer is fixed near-black in both themes.
 *
 * Pure black rather than the dark theme's #0a0a0a so it still separates from
 * the page when the rest of the site is already dark — it reads as an anchor,
 * not as the page simply running out.
 */
const Footer = () => (
  <footer className="mt-auto">
    {/* Ticker. The one place the volt accent runs at full strength. */}
    <Marquee duration={38} className="bg-volt text-volt-foreground" aria-hidden="true">
      {TICKER.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="flex items-center gap-8 whitespace-nowrap py-2.5 pr-8 text-eyebrow font-bold uppercase"
        >
          {item}
          <span className="h-1 w-1 rounded-full bg-current" />
        </span>
      ))}
    </Marquee>

    <div className="bg-black text-white">
      {/* Promise row */}
      <Container className="grid gap-4 border-b border-white/10 py-6 sm:grid-cols-3">
        {PROMISES.map((promise) => {
          const Icon = PROMISE_ICONS[promise.key];
          return (
            <div key={promise.key} className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-white/60" strokeWidth={1.5} />
              <span className="text-micro font-semibold uppercase text-white/80">
                {promise.label}
              </span>
            </div>
          );
        })}
      </Container>

      {/* Link columns */}
      <Container className="grid gap-x-8 gap-y-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-4 text-eyebrow font-bold uppercase text-white">
              {column.title}
            </h2>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/65 transition-colors duration-fast ease-swift hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <nav aria-label="Brands">
          <h2 className="mb-4 text-eyebrow font-bold uppercase text-white">Brands</h2>
          <ul className="space-y-2.5">
            {BRANDS.map((brand) => (
              <li key={brand.name}>
                <Link
                  to={`/products/${brand.name}`}
                  className="text-sm text-white/65 transition-colors duration-fast ease-swift hover:text-white"
                >
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Newsletter. An underline field rather than a boxed input — it sits
            quieter next to the link columns and reads as editorial. */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h2 className="mb-4 text-eyebrow font-bold uppercase text-white">Stay In The Loop</h2>
          <p className="mb-5 text-sm text-white/65">
            Drops, restocks and members-only offers. No noise.
          </p>
          <form
            onSubmit={(event) => event.preventDefault()}
            className="group relative flex items-center border-b border-white/25 transition-colors duration-fast ease-swift focus-within:border-white"
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              required
              placeholder="Email address"
              className="h-11 w-full bg-transparent pr-10 text-sm text-white outline-none placeholder:text-white/55"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-[color,transform] duration-fast ease-swift hover:text-white active:scale-[0.96]"
            >
              <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </Container>

      {/* Wordmark anchor. Sized to span the container so it reads as a
          masthead rather than a logo that happens to be large. */}
      <Container className="pb-8">
        <div className="masthead-fit-wrap">
          <Link
            to="/"
            aria-label={`${SITE.name} home`}
            className="masthead-fit block font-display font-black uppercase leading-[0.78] tracking-tightest text-white font-expanded"
          >
            {SITE.name}
          </Link>
        </div>
      </Container>

      {/* Legal */}
      <Container className="flex flex-col gap-4 border-t border-white/10 py-6 text-micro text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <li aria-hidden="true" className="text-white/55">
            {SITE.locale} · {SITE.currency}
          </li>
          {LEGAL.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className="transition-colors duration-fast ease-swift hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  </footer>
);

export default Footer;
