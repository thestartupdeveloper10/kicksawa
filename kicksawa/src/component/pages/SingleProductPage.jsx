import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Truck,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGallery from '../components/ProductGallery';
import ProductRail from '../components/ProductRail';
import { addProduct } from '../../redux/cartRedux';
import { addProductWishlist, removeProductWishlist } from '../../redux/wishlistRedux';
import { Container, Section } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AccordionItem } from '@/components/ui/accordion';
import { formatPrice, normalizeColor } from '@/lib/products';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/site';
import { publicRequest } from '@/service/requestMethods';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */

const Breadcrumb = ({ product }) => (
  <nav aria-label="Breadcrumb" className="mb-6">
    <ol className="flex flex-wrap items-center gap-1 text-micro text-muted-foreground">
      <li>
        <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
      </li>
      <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      <li>
        <Link to="/products" className="transition-colors hover:text-foreground">Shop</Link>
      </li>
      {product.brand && (
        <>
          <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
          <li>
            <Link
              to={`/products/${product.brand}`}
              className="transition-colors hover:text-foreground"
            >
              {product.brand}
            </Link>
          </li>
        </>
      )}
      <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      <li aria-current="page" className="capitalize text-foreground">{product.title}</li>
    </ol>
  </nav>
);

const PdpSkeleton = () => (
  <Container width="default" className="pb-24 pt-8">
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <Skeleton className="aspect-square w-full" />
      </div>
      <div className="lg:col-span-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-9 w-3/4" />
        <Skeleton className="mt-3 h-5 w-1/3" />
        <Skeleton className="mt-6 h-6 w-28" />
        <Skeleton className="mt-10 h-32 w-full" />
        <Skeleton className="mt-8 h-14 w-full rounded-full" />
        <Skeleton className="mt-3 h-14 w-full rounded-full" />
      </div>
    </div>
  </Container>
);

/** Rendered once per breakpoint: under the gallery on desktop, after the buy
 *  panel on mobile. Kept as one definition so the copy cannot drift. */
const ProductDetails = ({ product }) => (
  <>
    <AccordionItem title="Description" defaultOpen>
      <p>{product.desc || 'No description available for this product.'}</p>
    </AccordionItem>

    <AccordionItem title="Delivery & Returns">
      <ul className="space-y-3">
        <li className="flex gap-3">
          <Truck className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={1.75} />
          Countrywide delivery. Free on orders over Ksh{' '}
          {FREE_DELIVERY_THRESHOLD.toLocaleString('en-KE')}.
        </li>
        <li className="flex gap-3">
          <RotateCcw className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={1.75} />
          Unworn items can be returned within 7 days.
        </li>
      </ul>
    </AccordionItem>

    <AccordionItem title="Authenticity">
      <p className="flex gap-3">
        <BadgeCheck className="h-4 w-4 shrink-0 translate-y-0.5" strokeWidth={1.75} />
        Every pair is verified before it ships. If it is not authentic, we refund you in full.
      </p>
    </AccordionItem>
  </>
);

/* -------------------------------------------------------------------------- */

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.currentUser);
  const wishlist = useSelector((state) => state.wishlist);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [validation, setValidation] = useState('');
  const [added, setAdded] = useState(false);

  const addedTimer = useRef(null);
  const sizeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Reset selections when navigating between products.
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
    setValidation('');
    window.scrollTo(0, 0);

    const load = async () => {
      try {
        const { data } = await publicRequest.get(`products/find/${id}`);
        if (cancelled) return;
        setProduct(data);

        // Related: same brand first, then anything sharing a category.
        try {
          const { data: pool } = await publicRequest.get('products');
          if (cancelled || !Array.isArray(pool)) return;
          const categories = new Set(data.categories || []);
          const scored = pool
            .filter((p) => p._id !== data._id)
            .map((p) => ({
              p,
              score:
                (p.brand === data.brand ? 2 : 0) +
                ((p.categories || []).some((c) => categories.has(c)) ? 1 : 0),
            }))
            .filter((entry) => entry.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8)
            .map((entry) => entry.p);
          setRelated(scored);
        } catch {
          // Related products are an enhancement; the page works without them.
        }
      } catch (err) {
        console.error('Failed to load product', err);
        if (!cancelled) setError('We could not load this product.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const colors = useMemo(
    () => [...new Set((product?.color || []).map(normalizeColor).filter(Boolean))],
    [product]
  );
  const sizes = useMemo(
    () => (product?.size || []).map((s) => String(s).trim()).filter(Boolean),
    [product]
  );

  const isInWishlist = Boolean(
    user && wishlist?.wishlists?.[user.id]?.products.some((item) => item._id === id)
  );

  const handleAddToCart = () => {
    // Selections are validated before the sign-in check: sending someone to
    // log in only for them to come back and discover they still have to pick a
    // size is two interruptions where one will do.
    // Inline validation rather than alert(): a native dialog throws away the
    // page context and cannot point at the control that needs attention.
    if (sizes.length > 0 && !selectedSize) {
      setValidation('Please select a size.');
      sizeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      setValidation('Please select a colour.');
      return;
    }

    setValidation('');

    if (!user) {
      navigate('/login');
      return;
    }

    dispatch(
      addProduct({
        userId: user.id,
        product: { ...product, quantity, selectedSize, selectedColor },
      })
    );

    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2600);
  };

  const handleToggleWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      dispatch(removeProductWishlist({ userId: user.id, productId: id }));
    } else {
      dispatch(addProductWishlist({ userId: user.id, product }));
    }
  };

  const shell = (children) => (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
    </div>
  );

  if (loading) return shell(<PdpSkeleton />);

  if (error || !product) {
    return shell(
      <Container className="py-32 text-center">
        <h1 className="font-display text-display-md font-extrabold uppercase font-wide">
          Product Not Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          {error || 'This product may have been removed.'}
        </p>
        <Button asChild className="mt-8">
          <Link to="/products">Back to Shop</Link>
        </Button>
      </Container>
    );
  }

  const outOfStock = product.inStock === false;

  return shell(
    <>
      <Container width="default" className="pb-20 pt-6">
        <Breadcrumb product={product} />

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <ProductGallery images={product.img} title={product.title} />

            {/* Detail sits under the gallery rather than in the buy panel:
                the right column ran far taller than the left, so moving it
                here balances the two and lets the buy panel actually stick. */}
            <div className="mt-12 hidden border-t border-line lg:block">
              <ProductDetails product={product} />
            </div>
          </div>

          {/* Buy panel. Sticks on desktop so the primary action stays reachable
              while the gallery is being read. */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              {product.brand && (
                <Link
                  to={`/products/${product.brand}`}
                  className="text-eyebrow font-bold uppercase text-muted-foreground transition-colors hover:text-foreground"
                >
                  {product.brand}
                </Link>
              )}

              <h1 className="mt-2 font-display text-display-md font-extrabold uppercase leading-[1.02] font-wide">
                {product.title}
              </h1>

              {product.categories?.length > 0 && (
                <p className="mt-2 text-sm capitalize text-muted-foreground">
                  {product.categories.join(' · ')}
                </p>
              )}

              <p className="tnum mt-5 text-xl font-semibold">{formatPrice(product.price)}</p>

              {outOfStock && (
                <Badge variant="outline" className="mt-4">Sold Out</Badge>
              )}

              {/* Colour */}
              {colors.length > 0 && (
                <div className="mt-9">
                  <div className="mb-3 flex items-baseline justify-between">
                    <h2 className="text-[0.9375rem] font-semibold">Select Colour</h2>
                    <span className="tnum text-sm text-muted-foreground">
                      {colors.length} available
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => {
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color);
                            setValidation('');
                          }}
                          aria-pressed={isSelected}
                          aria-label={`Colour ${index + 1}`}
                          title={color}
                          className="flex h-12 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-fast ease-swift hover:bg-surface active:scale-[0.96]"
                        >
                          <span
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-full transition-shadow duration-fast',
                              isSelected
                                ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                                : 'ring-1 ring-foreground/15'
                            )}
                            style={{ backgroundColor: color }}
                          >
                            {isSelected && (
                              <Check
                                className="h-4 w-4 text-white mix-blend-difference"
                                strokeWidth={3}
                              />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size */}
              {sizes.length > 0 && (
                <div className="mt-8" ref={sizeRef}>
                  <div className="mb-3 flex items-baseline justify-between">
                    <h2 className="text-[0.9375rem] font-semibold">Select Size</h2>
                    <span className="text-sm text-muted-foreground">EU</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setValidation('');
                          }}
                          aria-pressed={isSelected}
                          className={cn(
                            'tnum flex h-12 items-center justify-center rounded-md border text-sm font-medium',
                            'transition-[border-color,background-color,transform] duration-fast ease-swift active:scale-[0.96]',
                            isSelected
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-line-strong hover:border-foreground'
                          )}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {validation && (
                <p role="alert" className="mt-3 text-sm font-medium text-destructive">
                  {validation}
                </p>
              )}

              {/* Quantity */}
              <div className="mt-8">
                <h2 className="mb-3 text-[0.9375rem] font-semibold">Quantity</h2>
                <div className="inline-flex items-center rounded-full border border-line-strong">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-fast ease-swift hover:bg-surface active:scale-[0.96] disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <span className="tnum w-10 text-center text-sm font-semibold" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-fast ease-swift hover:bg-surface active:scale-[0.96] disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-9 space-y-3">
                <Button
                  size="lg"
                  block
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  aria-live="polite"
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                      Added to Bag
                    </>
                  ) : outOfStock ? (
                    'Sold Out'
                  ) : (
                    'Add to Bag'
                  )}
                </Button>

                <Button variant="outline" size="lg" block onClick={handleToggleWishlist}>
                  {isInWishlist ? 'Remove from Favourites' : 'Favourite'}
                  <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} strokeWidth={2} />
                </Button>

                {added && (
                  <Link
                    to="/cart"
                    className="block py-1 text-center text-sm font-medium underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-foreground"
                  >
                    View Bag
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-12 border-t border-line lg:hidden">
              <ProductDetails product={product} />
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <Section padding="none" className="border-t border-line pt-4">
          <ProductRail
            eyebrow="More like this"
            title="You Might Also Like"
            products={related}
            viewAllHref={product.brand ? `/products/${product.brand}` : '/products'}
          />
        </Section>
      )}
    </>
  );
};

export default SingleProductPage;
