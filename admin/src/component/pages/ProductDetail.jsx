import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { publicRequest, userRequest, apiError } from '../../services/requestMethods';
import { ConfirmDialog, ErrorNote, LoadingRows, PageHeader, Panel } from '@/components/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { cn } from '@/lib/utils';
import { LOW_STOCK, formatKsh, isTracked, pairsOnHand, paymentStatusOf } from '@/lib/format';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([publicRequest.get(`/products/find/${id}`), userRequest.get('/orders')])
      .then(([p, o]) => {
        if (cancelled) return;
        if (!p.data) throw new Error('missing');
        setProduct(p.data);
        setOrders(o.data);
      })
      .catch((err) => !cancelled && setError(apiError(err, 'Could not load this product.')));
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Pairs sold per size, from paid orders.
  const sold = useMemo(() => {
    const bySize = new Map();
    orders
      .filter((o) => paymentStatusOf(o) === 'paid' && o.status !== 'cancelled')
      .flatMap((o) => o.products.filter((line) => line.productId === id))
      .forEach((line) => bySize.set(line.size || '', (bySize.get(line.size || '') || 0) + line.quantity));
    return bySize;
  }, [orders, id]);
  const soldTotal = [...sold.values()].reduce((a, b) => a + b, 0);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await userRequest.delete(`/products/${id}`);
      navigate('/products', { replace: true });
    } catch (err) {
      setDeleteError(apiError(err, 'Could not delete this product.'));
      setBusy(false);
    }
  };

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!product) return <LoadingRows rows={6} />;

  const tracked = isTracked(product);

  return (
    <>
      <Link to="/products" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <PageHeader
        eyebrow={product.brand}
        title={product.title}
        actions={
          <>
            <Button asChild size="sm"><Link to={`/products/edit/${id}`}>Edit</Link></Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleting(true)}>Delete</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Stock">
          {tracked ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                <span className="tnum font-semibold text-foreground">{pairsOnHand(product)}</span> pairs on hand ·{' '}
                <span className="tnum font-semibold text-foreground">{soldTotal}</span> sold
              </p>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {product.stock.map((entry) => (
                  <li
                    key={entry.size || 'one-size'}
                    className={cn(
                      'rounded-md border px-3 py-2.5',
                      entry.quantity === 0 ? 'border-brand/40 bg-brand/5' : 'border-line'
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{entry.size ? `Size ${entry.size}` : 'Quantity'}</p>
                    <p className={cn('tnum mt-0.5 font-bold', entry.quantity === 0 ? 'text-brand' : entry.quantity <= LOW_STOCK && 'text-brand')}>
                      {entry.quantity === 0 ? 'Sold out' : entry.quantity}
                    </p>
                    {sold.get(entry.size) > 0 && (
                      <p className="tnum text-xs text-muted-foreground">{sold.get(entry.size)} sold</p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Stock isn&apos;t tracked for this product; it shows as{' '}
              <strong className="text-foreground">{product.inStock ? 'in stock' : 'sold out'}</strong> until changed by hand.{' '}
              <Link to={`/products/edit/${id}`} className="underline underline-offset-4">Track stock</Link>
            </p>
          )}
        </Panel>

        <Panel title="Details">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Price</dt>
            <dd className="tnum font-semibold">{formatKsh(product.price)}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>{product.inStock ? <Badge variant="success">In stock</Badge> : <Badge variant="brand">Sold out</Badge>}</dd>
            <dt className="text-muted-foreground">Categories</dt>
            <dd>{product.categories?.join(', ') || '—'}</dd>
            <dt className="text-muted-foreground">Sizes</dt>
            <dd>{product.size?.join(', ') || 'One size'}</dd>
            <dt className="text-muted-foreground">Colours</dt>
            <dd className="flex flex-wrap gap-1.5">
              {product.color?.length
                ? product.color.map((c) => (
                    <span key={c} className="inline-block h-5 w-5 rounded-full ring-1 ring-line-strong" style={{ backgroundColor: c }} title={c} />
                  ))
                : '—'}
            </dd>
          </dl>
          <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{product.desc}</p>
        </Panel>
      </div>

      {product.img?.length > 0 && (
        <Panel title="Images" className="mt-6">
          <div className="flex flex-wrap gap-3">
            {product.img.map((src, i) => (
              <span key={src} className="relative h-28 w-28 overflow-hidden rounded-md bg-surface">
                <ProductImage src={src} alt={`${product.title}, image ${i + 1}`} className="img-outline h-full w-full object-cover transition-opacity duration-[400ms]" />
              </span>
            ))}
          </div>
        </Panel>
      )}

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title="Delete product?"
        description={`“${product.title}” disappears from the store. Past orders keep their own record of it.`}
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDelete}
        busy={busy}
        error={deleteError}
      />
    </>
  );
};

export default ProductDetail;
