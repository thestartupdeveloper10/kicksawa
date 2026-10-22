import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, Trash2 } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaymentForm from '../components/PaymentForm';
import { clearCart, removeProduct, updateProductQuantity } from '../../redux/cartRedux';
import { Container } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ProductImage } from '@/components/ui/product-image';
import { formatPrice } from '@/lib/products';
import { FREE_DELIVERY_THRESHOLD, deliveryFeeFor } from '@/lib/site';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */

const CartLine = ({ item, onUpdateQuantity, onRemove, busy }) => {
  const lineTotal = item.price * item.quantity;

  return (
    <li className="flex gap-4 border-b border-line py-6 sm:gap-6">
      <Link
        to={`/product/${item._id}`}
        className="relative block h-24 w-24 shrink-0 overflow-hidden bg-[#f4f4f4] sm:h-32 sm:w-32"
      >
        <ProductImage
          src={item.img?.[0]}
          alt={item.title}
          className="h-full w-full object-contain p-2 mix-blend-multiply transition-opacity duration-[400ms] ease-out-quint"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-[0.9375rem] font-semibold capitalize">
              <Link to={`/product/${item._id}`}>{item.title}</Link>
            </h3>
            <p className="mt-0.5 text-sm capitalize text-muted-foreground">
              {[item.brand, item.categories?.[0]].filter(Boolean).join(' · ')}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {item.selectedSize && <span className="tnum">Size {item.selectedSize}</span>}
              {item.selectedColor && (
                <span className="flex items-center gap-1.5">
                  Colour
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 rounded-full ring-1 ring-foreground/15"
                    style={{ backgroundColor: item.selectedColor }}
                  />
                </span>
              )}
            </div>
          </div>

          <p className="tnum shrink-0 text-[0.9375rem] font-semibold">{formatPrice(lineTotal)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <div className="inline-flex items-center rounded-full border border-line-strong">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.cartKey, item.quantity - 1)}
              disabled={busy || item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.title}`}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-[background-color,transform] duration-fast ease-swift hover:bg-surface active:scale-[0.96] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Minus className="h-4 w-4" strokeWidth={2} />
            </button>
            <span className="tnum w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}
              disabled={busy || item.quantity >= 10}
              aria-label={`Increase quantity of ${item.title}`}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-[background-color,transform] duration-fast ease-swift hover:bg-surface active:scale-[0.96] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.cartKey)}
            disabled={busy}
            aria-label={`Remove ${item.title} from bag`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-fast ease-swift hover:bg-surface hover:text-destructive active:scale-[0.96]"
          >
            <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </li>
  );
};

const SummaryRow = ({ label, value, strong, muted }) => (
  <div
    className={cn(
      'flex items-baseline justify-between gap-4 py-1.5',
      strong && 'border-t border-line pt-4 text-base font-semibold',
      muted && 'text-muted-foreground'
    )}
  >
    <span className={cn('text-sm', strong && 'text-base')}>{label}</span>
    <span className={cn('tnum text-sm', strong && 'text-base')}>{value}</span>
  </div>
);

/* -------------------------------------------------------------------------- */

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const cart = useSelector((state) => state.cart);

  const [busy, setBusy] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const userId = user?.id;
  const userCart = cart.carts[userId] || { products: {}, quantity: 0, total: 0 };
  const items = useMemo(() => Object.values(userCart.products), [userCart.products]);

  // Derived from the lines rather than the running total the reducer keeps, so
  // the summary cannot drift if a line is ever mutated directly.
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  const unitCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const delivery = deliveryFeeFor(subtotal);
  const total = subtotal + delivery;
  const awayFromFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  const updateQuantity = useCallback(
    (cartKey, quantity) => {
      if (quantity < 1 || quantity > 10) return;
      setBusy(true);
      dispatch(updateProductQuantity({ userId, cartKey, quantity }));
      setBusy(false);
    },
    [dispatch, userId]
  );

  const removeItem = useCallback(
    (cartKey) => {
      setBusy(true);
      dispatch(removeProduct({ userId, cartKey }));
      setBusy(false);
    },
    [dispatch, userId]
  );

  const handlePaymentSuccess = (order) => {
    setCheckoutOpen(false);
    dispatch(clearCart({ userId }));
    navigate('/order-confirmation', { state: { order } });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main" className="flex-1">
        <Container width="default" className="pb-24 pt-10">
          <h1 className="font-display text-display-md font-extrabold uppercase font-wide">
            Your Bag{' '}
            {items.length > 0 && (
              <span className="tnum text-muted-foreground">({unitCount})</span>
            )}
          </h1>

          {items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-display-sm font-extrabold uppercase font-wide">
                Your Bag Is Empty
              </p>
              <p className="mt-2 text-muted-foreground">
                Once you add something, it will show up here.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link to="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <ul className="border-t border-line">
                  {items.map((item) => (
                    <CartLine
                      key={item.cartKey}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                      busy={busy}
                    />
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="mt-6 text-sm font-medium text-muted-foreground underline decoration-line-strong underline-offset-4 transition-colors hover:text-destructive hover:decoration-destructive"
                >
                  Clear bag
                </button>
              </div>

              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
                  <h2 className="mb-5 font-display text-display-sm font-extrabold uppercase font-wide">
                    Summary
                  </h2>

                  <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                  <SummaryRow
                    label="Delivery"
                    value={delivery === 0 ? 'Free' : formatPrice(delivery)}
                  />

                  {awayFromFreeDelivery > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add{' '}
                      <span className="tnum font-semibold text-foreground">
                        {formatPrice(awayFromFreeDelivery)}
                      </span>{' '}
                      more for free delivery.
                    </p>
                  )}

                  <div className="mt-4">
                    <SummaryRow label="Total" value={formatPrice(total)} strong />
                  </div>

                  <div className="mt-8 space-y-3">
                    <Button size="lg" block onClick={() => setCheckoutOpen(true)} disabled={busy}>
                      Checkout
                    </Button>
                    <Button asChild variant="outline" size="lg" block>
                      <Link to="/products">Continue Shopping</Link>
                    </Button>
                  </div>

                  <p className="mt-6 text-center text-micro text-muted-foreground">
                    Secure M-PESA checkout · Countrywide delivery
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>

      <Footer />

      <Dialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Checkout"
        description={`${unitCount} ${unitCount === 1 ? 'item' : 'items'} · ${formatPrice(total)}`}
      >
        <PaymentForm
          onSuccess={handlePaymentSuccess}
          cartTotal={total}
          cartItems={items}
        />
      </Dialog>

      {/* Clearing the bag is destructive and was previously a single click. */}
      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear Bag?"
        description="This removes every item. It cannot be undone."
      >
        <div className="flex gap-3">
          <Button variant="outline" block onClick={() => setConfirmClear(false)}>
            Keep Items
          </Button>
          <Button
            variant="destructive"
            block
            onClick={() => {
              dispatch(clearCart({ userId }));
              setConfirmClear(false);
            }}
          >
            Clear Bag
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default CartPage;
