import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Heart,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  User,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from './ThemeContext';
import { logout } from '../../redux/userRedux';
import { BRANDS, NAV, SHOP_LINKS, SITE } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/layout';
import { IconButton } from '@/components/ui/icon-button';
import { EASE_SWIFT } from '@/components/ui/motion';

/* -------------------------------------------------------------------------- */
/*  Wordmark                                                                   */
/* -------------------------------------------------------------------------- */

const Wordmark = ({ className }) => (
  <Link
    to="/"
    aria-label={`${SITE.name} home`}
    className={cn(
      'font-display text-base font-black uppercase leading-none tracking-tightest font-expanded xs:text-lg sm:text-xl',
      'transition-opacity duration-fast ease-swift hover:opacity-70',
      className
    )}
  >
    {SITE.name}
  </Link>
);

/* -------------------------------------------------------------------------- */
/*  Desktop nav link                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The underline grows from the left rather than fading in — it reads as the
 * link being "armed" and matches the direction the eye is already travelling.
 */
const NavLink = ({ to, children, active, ...props }) => (
  <Link
    to={to}
    className="group relative flex h-full items-center px-1 text-[0.9375rem] font-medium"
    {...props}
  >
    <span className="transition-opacity duration-fast ease-swift group-hover:opacity-100">
      {children}
    </span>
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-foreground',
        'transition-transform duration-[220ms] ease-swift',
        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
      )}
    />
  </Link>
);

/* -------------------------------------------------------------------------- */
/*  Mega menu                                                                  */
/* -------------------------------------------------------------------------- */

const MegaPanel = ({ menu, onNavigate }) => {
  const brandLinks = BRANDS.map((b) => ({ label: b.name, href: `/products/${b.name}` }))
  const half = Math.ceil(brandLinks.length / 2)

  const columns =
    menu === 'brands'
      ? [
          // Split evenly so neither column strands a lone link.
          { title: 'All Brands', links: brandLinks.slice(0, half) },
          {
            title: '\u00A0', // keeps the second column's baseline aligned
            links: [...brandLinks.slice(half), { label: 'Brand Directory', href: '/brands' }],
          },
        ]
      : [
          { title: 'Shop', links: SHOP_LINKS },
          {
            title: 'Top Brands',
            links: BRANDS.slice(0, 4).map((b) => ({
              label: b.name,
              href: `/products/${b.name}`,
            })),
          },
        ];

  return (
    <Container className="grid grid-cols-2 gap-x-12 gap-y-8 py-10 md:grid-cols-4">
      {columns.map((column) => (
        <div key={column.title}>
          <p className="mb-4 text-eyebrow font-bold uppercase text-muted-foreground">
            {column.title}
          </p>
          <ul className="space-y-2.5">
            {column.links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  onClick={onNavigate}
                  className="text-[0.9375rem] text-foreground/80 transition-colors duration-fast ease-swift hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Editorial slot — keeps the panel from reading as a plain sitemap. */}
      <div className="col-span-2 md:col-span-2">
        <Link
          to="/products"
          onClick={onNavigate}
          className="group relative flex h-full min-h-[180px] items-end overflow-hidden bg-surface p-6"
        >
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=70"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[700ms] ease-out-quint group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="relative">
            <p className="text-eyebrow font-bold uppercase text-white/70">Featured</p>
            <p className="font-display text-display-sm font-extrabold uppercase text-white font-wide">
              The Latest Drops
            </p>
          </div>
        </Link>
      </div>
    </Container>
  );
};

/* -------------------------------------------------------------------------- */
/*  Search                                                                     */
/* -------------------------------------------------------------------------- */

const SearchField = ({ className, autoFocus, onSubmitted }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery('');
    onSubmitted?.();
  };

  return (
    <form role="search" onSubmit={submit} className={cn('relative', className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
        aria-label="Search products"
        className={cn(
          'h-10 w-full rounded-full bg-surface pl-10 pr-4 text-sm placeholder:text-muted-foreground',
          'border border-transparent outline-none',
          'transition-[background-color,border-color,width] duration-[220ms] ease-swift',
          'focus:border-line-strong focus:bg-background',
          // Cancel the UA's search affordance; it fights the pill shape.
          '[&::-webkit-search-cancel-button]:appearance-none'
        )}
      />
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/*  Account menu                                                               */
/* -------------------------------------------------------------------------- */

const AccountMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const itemClass =
    'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors duration-fast ease-swift hover:bg-surface';

  return (
    <div ref={wrapperRef} className="relative">
      <IconButton
        label={user ? 'Account menu' : 'Sign in'}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {user?.profilePic ? (
          <img
            src={user.profilePic}
            alt=""
            className="h-6 w-6 rounded-full object-cover img-outline"
          />
        ) : (
          <User strokeWidth={1.75} />
        )}
      </IconButton>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.18, ease: EASE_SWIFT }}
            className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-lg bg-popover py-1.5 text-popover-foreground shadow-pop"
          >
            {user ? (
              <>
                <div className="border-b border-line px-4 pb-2.5 pt-1.5">
                  <p className="text-eyebrow font-bold uppercase text-muted-foreground">
                    Signed in
                  </p>
                  <p className="truncate text-sm font-semibold capitalize">{user.name}</p>
                </div>
                <Link to="/my-account" onClick={() => setOpen(false)} className={itemClass}>
                  <User className="h-4 w-4" strokeWidth={1.75} />
                  Profile
                </Link>
                <Link to="/favorites" onClick={() => setOpen(false)} className={itemClass}>
                  <Heart className="h-4 w-4" strokeWidth={1.75} />
                  Favourites
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className={itemClass}
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className={itemClass}>
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className={itemClass}>
                  Join Us
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Mobile sheet                                                               */
/* -------------------------------------------------------------------------- */

const MobileSheet = ({ open, onClose, user, onLogout, theme, toggleTheme }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_SWIFT }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          // Exits travel a shorter distance than enters — softer on the way out.
          exit={{ x: '100%', transition: { duration: 0.22, ease: EASE_SWIFT } }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-y-0 right-0 z-[70] flex w-[min(24rem,88vw)] flex-col bg-background shadow-pop lg:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <Wordmark className="text-lg" onClick={onClose} />
            <IconButton label="Close menu" onClick={onClose}>
              <X strokeWidth={1.75} />
            </IconButton>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
            <SearchField className="mb-7" onSubmitted={onClose} />

            <nav className="mb-8">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className="block py-2 font-display text-display-sm font-extrabold uppercase font-wide"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="mb-3 text-eyebrow font-bold uppercase text-muted-foreground">
              Brands
            </p>
            <ul className="mb-8 grid grid-cols-2 gap-y-2.5">
              {BRANDS.map((brand) => (
                <li key={brand.name}>
                  <Link
                    to={`/products/${brand.name}`}
                    onClick={onClose}
                    className="text-sm text-foreground/80"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="space-y-2.5 border-t border-line pt-6 text-sm">
              {user ? (
                <>
                  <Link to="/my-account" onClick={onClose} className="block">
                    My Account
                  </Link>
                  <Link to="/favorites" onClick={onClose} className="block">
                    Favourites
                  </Link>
                  <button
                    type="button"
                    className="block"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={onClose} className="block">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={onClose} className="block">
                    Join Us
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2.5 pt-1"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Moon className="h-4 w-4" strokeWidth={1.75} />
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                     */
/* -------------------------------------------------------------------------- */

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector((state) => state.user.currentUser);
  const cart = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist);

  const userId = user?.id;
  const userCart = cart?.carts?.[userId] || { products: {} };
  const userWishlist = wishlist?.wishlists?.[userId] || { products: [] };
  const cartItemCount = Object.values(userCart.products).length;
  const wishlistItemCount = userWishlist.products.length;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef(null);

  // Elevate the bar once the page has moved, so it separates from content
  // without carrying a permanent border.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Any route change closes every transient surface.
  useEffect(() => {
    setSheetOpen(false);
    setOpenMenu(null);
    setMobileSearchOpen(false);
  }, [location.pathname, location.search]);

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheetOpen]);

  // A short grace period so the pointer can travel from the trigger into the
  // panel without the panel snapping shut under it.
  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  }, []);

  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <header className="relative z-50">
      {/* Utility bar. Scrolls away — only the main bar sticks. */}
      <div className="hidden bg-surface text-muted-foreground lg:block">
        <Container className="flex h-9 items-center justify-end gap-5 text-micro font-medium">
          <span>Deliver to {SITE.locale}</span>
          <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
          <Link to="/contact-us" className="transition-colors hover:text-foreground">
            Help
          </Link>
          <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
          {user ? (
            <button type="button" onClick={handleLogout} className="transition-colors hover:text-foreground">
              Sign Out
            </button>
          ) : (
            <>
              <Link to="/signup" className="transition-colors hover:text-foreground">
                Join Us
              </Link>
              <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
              <Link to="/login" className="transition-colors hover:text-foreground">
                Sign In
              </Link>
            </>
          )}
        </Container>
      </div>

      {/* Main bar */}
      <div
        onMouseLeave={scheduleClose}
        className={cn(
          'sticky top-0 z-50 bg-background',
          'transition-shadow duration-[220ms] ease-swift',
          scrolled ? 'shadow-sm' : 'shadow-none',
          // A hairline only while a panel is open, so the panel reads as
          // attached to the bar rather than floating under it.
          openMenu && 'shadow-none'
        )}
      >
        <Container className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
          <Wordmark />

          <nav className="hidden h-full justify-center gap-8 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <div
                key={item.label}
                className="flex h-full items-center"
                onMouseEnter={() => {
                  cancelClose();
                  setOpenMenu(item.menu ?? null);
                }}
              >
                <NavLink to={item.href} active={isActive(item.href)}>
                  {item.label}
                </NavLink>
              </div>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-0 xs:gap-1 sm:gap-1.5">
            <SearchField className="hidden w-44 transition-[width] duration-[220ms] ease-swift focus-within:w-64 xl:block" />

            <IconButton
              label="Search"
              className="xl:hidden"
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((value) => !value)}
            >
              {mobileSearchOpen ? <X strokeWidth={1.75} /> : <Search strokeWidth={1.75} />}
            </IconButton>

            <IconButton asChild label="Favourites" count={wishlistItemCount}>
              <Link to="/favorites">
                <Heart strokeWidth={1.75} />
              </Link>
            </IconButton>

            <IconButton asChild label="Bag" count={cartItemCount}>
              <Link to="/cart">
                <ShoppingBag strokeWidth={1.75} />
              </Link>
            </IconButton>

            <div className="hidden sm:block">
              <AccountMenu user={user} onLogout={handleLogout} />
            </div>

            <IconButton
              label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
              className="hidden sm:inline-flex"
            >
              {/* Both icons stay mounted and cross-fade with scale + blur, so
                  the swap has an exit as well as an enter. */}
              <span className="relative block h-5 w-5">
                <Sun
                  strokeWidth={1.75}
                  className={cn(
                    'absolute inset-0 transition-[opacity,transform,filter] duration-[280ms] ease-swift',
                    theme === 'dark'
                      ? 'scale-100 opacity-100 blur-0'
                      : 'scale-[0.25] opacity-0 blur-[4px]'
                  )}
                />
                <Moon
                  strokeWidth={1.75}
                  className={cn(
                    'absolute inset-0 transition-[opacity,transform,filter] duration-[280ms] ease-swift',
                    theme === 'dark'
                      ? 'scale-[0.25] opacity-0 blur-[4px]'
                      : 'scale-100 opacity-100 blur-0'
                  )}
                />
              </span>
            </IconButton>

            <IconButton
              label="Open menu"
              className="lg:hidden"
              onClick={() => setSheetOpen(true)}
            >
              <Menu strokeWidth={1.75} />
            </IconButton>
          </div>
        </Container>

        {/* Collapsible search row for narrow viewports. */}
        <AnimatePresence initial={false}>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE_SWIFT }}
              className="overflow-hidden border-t border-line xl:hidden"
            >
              <Container className="py-3">
                <SearchField autoFocus onSubmitted={() => setMobileSearchOpen(false)} />
              </Container>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mega panel. Anchored to the bar so it reads as one surface. */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.14, ease: EASE_SWIFT } }}
              transition={{ duration: 0.22, ease: EASE_SWIFT }}
              className="absolute inset-x-0 top-full hidden border-t border-line bg-background shadow-lg lg:block"
            >
              <MegaPanel menu={openMenu} onNavigate={() => setOpenMenu(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </header>
  );
};

export default Navbar;
