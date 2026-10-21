import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CollectionView from '../components/CollectionView';
import { publicRequest } from '@/service/requestMethods';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The query lives in the URL, so results survive a refresh or a shared link.
  useEffect(() => {
    let cancelled = false;

    if (!query) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const { data } = await publicRequest.get(
          `products?search=${encodeURIComponent(query)}`
        );
        if (!cancelled) setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Search failed', err);
        if (!cancelled) setError('Search is unavailable right now. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        <CollectionView
          eyebrow={query ? 'Search results for' : 'Search'}
          title={query || 'Search'}
          products={results}
          loading={loading && Boolean(query)}
          error={error}
          showFacets={['brands', 'categories', 'prices']}
          emptyMessage={
            query
              ? `We could not find anything for "${query}". Try a brand or a style.`
              : 'Enter a search above to find products.'
          }
        />
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
