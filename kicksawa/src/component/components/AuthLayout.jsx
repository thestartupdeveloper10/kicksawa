import { Link } from 'react-router-dom';

import { SITE } from '@/lib/site';
import { Container } from '@/components/ui/layout';

const PANEL_IMAGE =
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1400&q=70';

/**
 * Split shell for sign in / join.
 *
 * These pages previously rendered a bare centred card with no header, no
 * footer and no way back into the site — a dead end if you landed on one by
 * accident. The wordmark is a link home, and the editorial panel keeps the
 * brand present on what is otherwise the least branded screen in the app.
 */
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-svh">
    <div className="flex w-full flex-col lg:w-1/2">
      <header className="px-6 py-6 sm:px-10">
        <Link
          to="/"
          aria-label={`${SITE.name} home`}
          className="font-display text-xl font-black uppercase leading-none tracking-tightest font-expanded transition-opacity duration-fast ease-swift hover:opacity-70"
        >
          {SITE.name}
        </Link>
      </header>

      <main id="main" className="flex flex-1 items-center">
        <Container width="narrow" className="max-w-md py-10">
          <h1 className="font-display text-display-md font-extrabold uppercase leading-[1.02] font-wide">
            {title}
          </h1>
          {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}

          <div className="mt-9">{children}</div>

          {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
        </Container>
      </main>

      <footer className="px-6 py-6 text-micro text-muted-foreground sm:px-10">
        © {new Date().getFullYear()} {SITE.name} · {SITE.locale}
      </footer>
    </div>

    {/* Decorative, so it is hidden from assistive tech and dropped on small
        screens rather than pushing the form below the fold. */}
    <div aria-hidden="true" className="relative hidden w-1/2 bg-neutral-950 lg:block">
      <img
        src={PANEL_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-12">
        <p className="mb-3 flex items-center gap-3 text-eyebrow font-bold uppercase text-white/70">
          <span className="h-px w-8 bg-volt" />
          {SITE.locale}
        </p>
        <p className="font-display text-display-lg font-black uppercase leading-[0.9] tracking-tightest text-white font-expanded">
          The Street
          <br />
          Is Yours
        </p>
      </div>
    </div>
  </div>
);

export default AuthLayout;
