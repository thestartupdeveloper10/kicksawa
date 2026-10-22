import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { publicRequest, userRequest, apiError } from '../../services/requestMethods';
import {
  ConfirmDialog, EmptyState, ErrorNote, FilterChips, LoadingRows, PageHeader, Panel, SearchInput, Table, Td, Th,
} from '@/components/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatKsh, isTracked, lowSizes, pairsOnHand } from '@/lib/format';

const VIEWS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'low', label: 'Low or sold out', test: (p) => lowSizes(p).length > 0 },
  { id: 'soldout', label: 'Sold out', test: (p) => p.inStock === false },
  { id: 'untracked', label: 'Stock not tracked', test: (p) => !isTracked(p) },
];

const Products = () => {
  const [params, setParams] = useSearchParams();
  const view = VIEWS.some((v) => v.id === params.get('view')) ? params.get('view') : 'all';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    publicRequest
      .get('/products')
      .then(({ data }) => !cancelled && setProducts([...data].sort((a, b) => a.title.localeCompare(b.title))))
      .catch((err) => !cancelled && setError(apiError(err, 'Could not load products.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(
    () => Object.fromEntries(VIEWS.map((v) => [v.id, products.filter(v.test).length])),
    [products]
  );

  const visible = useMemo(() => {
    const test = VIEWS.find((v) => v.id === view).test;
    const term = search.trim().toLowerCase();
    return products.filter(
      (p) => test(p) && (!term || [p.title, p.brand, ...(p.categories || [])].some((f) => f?.toLowerCase().includes(term)))
    );
  }, [products, view, search]);

  const confirmDelete = async () => {
    setBusy(true);
    setDeleteError('');
    try {
      await userRequest.delete(`/products/${deleting._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleting._id));
      setDeleting(null);
    } catch (err) {
      setDeleteError(apiError(err, 'Could not delete this product.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Stock counts drop as orders are placed and come back when payments fail or orders are cancelled."
        actions={
          <Button asChild size="sm">
            <Link to="/products/add"><Plus className="h-4 w-4" /> Add product</Link>
          </Button>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      <Panel>
        <div className="mb-5 flex flex-col gap-4">
          <FilterChips
            options={VIEWS.map((v) => ({ id: v.id, label: v.label, count: counts[v.id] }))}
            value={view}
            onChange={(id) => setParams(id === 'all' ? {} : { view: id })}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Search title, brand or category" />
        </div>

        {loading ? (
          <LoadingRows />
        ) : visible.length === 0 ? (
          <EmptyState title="No products here" body={search ? 'Nothing matches that search.' : undefined} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th className="text-right">Price</Th>
                <Th>Stock</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => {
                const low = lowSizes(product);
                return (
                  <tr key={product._id}>
                    <Td>
                      <Link to={`/products/${product._id}`} className="flex items-center gap-3 hover:opacity-80">
                        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface">
                          {product.img?.[0] && (
                            <img src={product.img[0]} alt="" loading="lazy" className="img-outline h-full w-full object-cover" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{product.title}</span>
                          <span className="block text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</span>
                        </span>
                      </Link>
                    </Td>
                    <Td className="tnum whitespace-nowrap text-right font-semibold">{formatKsh(product.price)}</Td>
                    <Td>
                      {isTracked(product) ? (
                        <div>
                          <span className="tnum font-semibold">{pairsOnHand(product)} pairs</span>
                          {product.inStock === false && <Badge variant="brand" className="ml-2">Sold out</Badge>}
                          {low.length > 0 && product.inStock !== false && (
                            <span className="mt-0.5 block text-xs text-brand">
                              Low: {low.map((e) => `${e.size || 'stock'} (${e.quantity})`).join(', ')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Not tracked · {product.inStock === false ? 'marked sold out' : 'marked in stock'}
                        </span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-right">
                      <Button asChild variant="outline" size="sm" className="mr-2">
                        <Link to={`/products/edit/${product._id}`}>Edit</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setDeleting(product); setDeleteError(''); }}>
                        Delete
                      </Button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Panel>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete product?"
        description={deleting && `“${deleting.title}” disappears from the store. Past orders keep their own record of it.`}
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDelete}
        busy={busy}
        error={deleteError}
      />
    </>
  );
};

export default Products;
