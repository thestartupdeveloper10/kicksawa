import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CollectionView from '../components/CollectionView';
import { publicRequest } from '@/service/requestMethods';

const BrandProductsPage = () => {
  const { brand } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const { data } = await publicRequest.get(`products?brand=${encodeURIComponent(brand)}`);
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load brand products', err);
        if (!cancelled) setError('We could not load this brand right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [brand]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        <CollectionView
          eyebrow="Brand"
          title={brand}
          products={products}
          loading={loading}
          error={error}
          // Brand is already fixed by the route, so offering it as a facet
          // would only ever be a single redundant checkbox.
          showFacets={['categories', 'prices', 'colors']}
          emptyMessage={`We have nothing from ${brand} matching these filters.`}
        />
      </main>
      <Footer />
    </div>
  );
};

export default BrandProductsPage;
