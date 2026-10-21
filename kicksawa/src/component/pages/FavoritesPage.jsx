import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { Container } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';

/**
 * Favourites renders the same tile as every other grid on the site. The old
 * page had its own horizontal row component, so a saved item looked nothing
 * like the card it was saved from.
 *
 * Removal is handled by the card's own heart control rather than a separate X,
 * which keeps one interaction for the same action everywhere.
 */
const FavoritesPage = () => {
  const user = useSelector((state) => state.user.currentUser);
  const wishlist = useSelector((state) => state.wishlist);

  const userId = user?.id;
  const favorites = wishlist.wishlists[userId]?.products ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main" className="flex-1">
        <Container className="pb-24 pt-10">
          <h1 className="font-display text-display-md font-extrabold uppercase font-wide">
            Favourites{' '}
            {favorites.length > 0 && (
              <span className="tnum text-muted-foreground">({favorites.length})</span>
            )}
          </h1>

          {favorites.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-display-sm font-extrabold uppercase font-wide">
                Nothing Saved Yet
              </p>
              <p className="mt-2 text-muted-foreground">
                Tap the heart on any product to keep it here.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-8 mt-2 text-sm text-muted-foreground">
                Saved items are kept to your account.
              </p>
              <ProductGrid products={favorites} />
            </>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
