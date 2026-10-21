import { useEffect, useMemo, useState } from 'react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import CategoryTiles from '../components/CategoryTiles';
import ProductRail from '../components/ProductRail';
import EditorialSplit from '../components/EditorialSplit';
import BrandMarquee from '../components/BrandMarquee';
import { publicRequest } from '@/service/requestMethods';
import { Container } from '@/components/ui/layout';

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The old page made three separate requests for overlapping slices of the
  // same catalogue. One request, sliced locally, is both fewer round trips and
  // guarantees the rails never show the same product twice.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await publicRequest.get('products');
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load products', err);
        if (!cancelled) setError('We could not load products right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { justIn, trending } = useMemo(() => {
    const newest = [...products].sort(byNewest);
    const justInSlice = newest.slice(0, 8);
    const justInIds = new Set(justInSlice.map((p) => p._id));

    return {
      justIn: justInSlice,
      trending: newest
        .filter((p) => !justInIds.has(p._id) && p.inStock !== false)
        .slice(0, 8),
    };
  }, [products]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main" className="flex-1">
        <HeroSection />

        {error ? (
          <Container className="py-20 text-center">
            <p className="text-muted-foreground">{error}</p>
          </Container>
        ) : (
          <>
            <ProductRail
              eyebrow="Fresh drops"
              title="Just In"
              products={justIn}
              loading={loading}
            />
            <CategoryTiles />
            <EditorialSplit />
            <ProductRail
              eyebrow="Moving fast"
              title="Trending Now"
              products={trending}
              loading={loading}
            />
            <BrandMarquee />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
