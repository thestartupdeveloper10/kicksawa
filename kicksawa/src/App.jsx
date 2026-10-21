import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './component/pages/Home';
import { ThemeProvider } from './component/components/ThemeContext';
import ProtectedRoute from './component/components/ProtectedRoute';

/**
 * Home ships in the main bundle because it is the entry point for most
 * sessions. Everything else is split per route.
 *
 * This matters most for the two pages that pull in Firebase (auth and profile):
 * it was previously loaded on every single page view, including by visitors who
 * never sign in.
 */
const ProductsPage = lazy(() => import('./component/pages/ProductsPage'));
const SingleProductPage = lazy(() => import('./component/pages/SingleProductPage'));
const BrandsPage = lazy(() => import('./component/pages/BrandsPage'));
const BrandProductsPage = lazy(() => import('./component/pages/BrandProductsPage'));
const SearchResults = lazy(() => import('./component/pages/SearchResults'));
const ContactPage = lazy(() => import('./component/pages/ContactPage'));
const LoginPage = lazy(() => import('./component/pages/LoginPage'));
const SignUpPage = lazy(() => import('./component/pages/SignUpPage'));
const CartPage = lazy(() => import('./component/pages/CartPage'));
const FavoritesPage = lazy(() => import('./component/pages/FavoritesPage'));
const UserProfilePage = lazy(() => import('./component/pages/UserProfilePage'));
const OrderConfirmationPage = lazy(() => import('./component/pages/OrderConfirmationPage'));
const NotFoundPage = lazy(() => import('./component/pages/NotFoundPage'));

/**
 * Deliberately blank rather than a spinner. Route chunks resolve in a few
 * frames on a warm connection, and a spinner that flashes for 80ms reads as a
 * glitch; the page simply appears.
 */
const RouteFallback = () => <div className="min-h-svh" aria-busy="true" />;

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* Visible only on focus. The header carries ~12 controls, so without
            this a keyboard user tabs through all of them on every page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-background"
        >
          Skip to content
        </a>

        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<SingleProductPage />} />
            <Route path="/contact-us" element={<ContactPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/products/:brand" element={<BrandProductsPage />} />
            <Route path="/search" element={<SearchResults />} />

            {/* Protected Routes */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/my-account" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
            <Route
              path="/order-confirmation"
              element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
