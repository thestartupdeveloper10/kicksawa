import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CollectionView from '../components/CollectionView';
import { publicRequest } from '@/service/requestMethods';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Entry points across the site deep-link here (category tiles, brand links),
  // and mirroring the state back keeps a filtered view shareable.
  const [initialFilters] = useState(() => ({
    brands: searchParams.getAll('brand'),
    categories: searchParams.getAll('category'),
    prices: searchParams.getAll('price'),
  }));

  const handleFiltersChange = useCallback(
    (filters) => {
      const next = new URLSearchParams();
      filters.brands.forEach((v) => next.append('brand', v));
      filters.categories.forEach((v) => next.append('category', v));
      filters.prices.forEach((v) => next.append('price', v));
      // replace: filtering is a refinement, not a new place to go back to.
      setSearchParams(next, { replace: true });
    },
    [setSearchParams]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        <CollectionView
          eyebrow="Shop"
          title="All Products"
          products={products}
          loading={loading}
          error={error}
          initialFilters={initialFilters}
          onFiltersChange={handleFiltersChange}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
