import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Mail, UserRound, LogOut, Sun, Moon, Menu, X, ExternalLink,
} from 'lucide-react';

import { logout } from '../../redux/userRedux';
import { userRequest } from '../../services/requestMethods';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173';

/** Same storage key as the storefront, so a person's theme follows them. */
const useTheme = () => {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Storage blocked: the theme still applies for this visit.
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
};

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: ShoppingBag, count: (s) => s.toShip + s.needsReview },
  // No count here: sold-out sizes are a standing state, not a to-do, and a
  // badge that never clears stops meaning anything. The dashboard tracks stock.
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/messages', label: 'Messages', icon: Mail, count: (s) => s.unhandledMessages },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const Wordmark = () => (
  <div>
    <p className="font-display text-xl font-black uppercase leading-none tracking-tightest font-expanded">
      Kicksawa
    </p>
    <p className="mt-1.5 text-eyebrow font-bold uppercase text-muted-foreground">Admin</p>
  </div>
);

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.currentUser);
  const [theme, toggleTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(null);

  // Refresh the sidebar counts on each navigation, so acting on an order or
  // message is reflected as soon as you move on.
  useEffect(() => {
    let cancelled = false;
    userRequest
      .get('/orders/summary')
      .then(({ data }) => !cancelled && setSummary(data))
      .catch(() => {});
    setOpen(false);
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between px-6 pb-8 pt-7">
        <Wordmark />
        <IconButton label="Close menu" className="-mr-2 -mt-2 lg:hidden" onClick={() => setOpen(false)}>
          <X strokeWidth={1.75} />
        </IconButton>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
        {NAV.map((item) => {
          const count = summary && item.count ? item.count(summary) : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold',
                  'transition-[background-color,color] duration-fast ease-swift',
                  isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  <span className="flex-1">{item.label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'tnum rounded-full px-2 py-0.5 text-[11px] font-bold leading-none',
                        isActive ? 'bg-background text-foreground' : 'bg-brand text-brand-foreground'
                      )}
                    >
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-line px-3 py-4">
        <a
          href={STOREFRONT_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-fast hover:bg-surface hover:text-foreground"
        >
          <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.75} />
          View store
        </a>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-fast hover:bg-surface hover:text-foreground"
        >
          {theme === 'dark' ? (
            <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
          ) : (
            <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          )}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-fast hover:bg-surface hover:text-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 text-left">
            Sign out
            {user?.email && (
              <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
            )}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-background lg:block">
        {sidebar}
      </aside>

      {/* Phone / tablet: top bar + drawer */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-background px-4 py-3 lg:hidden">
        <Wordmark />
        <IconButton label="Open menu" onClick={() => setOpen(true)}>
          <Menu strokeWidth={1.75} />
        </IconButton>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-background shadow-pop">{sidebar}</aside>
        </div>
      )}

      <main id="main" className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
