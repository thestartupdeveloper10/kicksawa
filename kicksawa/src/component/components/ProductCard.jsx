import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { addProductWishlist, removeProductWishlist } from '../../redux/wishlistRedux';
import { Badge } from '@/components/ui/badge';
import { formatPrice, normalizeColor } from '@/lib/products';
import { cn } from '@/lib/utils';

/** Anything added in the last 30 days earns the "Just In" flag. */
const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const isRecent = (createdAt) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  return Number.isFinite(created) && Date.now() - created < NEW_WINDOW_MS;
};

/**
 * The canonical product tile.
 *
 * Deliberately has no border, no shadow and no corner radius: the product
 * photograph sits on a flat grey swatch and the type sits on the page. That
 * separation — image block, then unboxed text — is what stops a grid of these
 * reading as a wall of cards.
 *
 * Takes the raw API product so every surface (rails, grids, search) renders an
 * identical tile from identical data.
 */
const ProductCard = ({ product, className, eager = false, showBrand = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const wishlist = useSelector((state) => state.wishlist);
  const [swapFailed, setSwapFailed] = useState(false);
  // The hover image is not fetched until the pointer actually arrives.
  // Rendering both up front doubled the page's image payload for a state
  // most cards never enter.
  const [swapArmed, setSwapArmed] = useState(false);

  if (!product?._id) return null;

  const { _id, title, img = [], brand, categories = [], price, color = [], inStock, createdAt } =
    product;

  const userId = user?.id;
  const userWishlist = wishlist?.wishlists?.[userId] || { products: [] };
  const isInWishlist = userWishlist.products.some((item) => item._id === _id);

  const primary = img[0];
  // Only treat a second shot as a hover swap if it is actually a different URL.
  const secondary = img[1] && img[1] !== primary && !swapFailed ? img[1] : null;
  const category = categories[0];
  const colourCount = color.map(normalizeColor).filter(Boolean).length;

  const toggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      dispatch(removeProductWishlist({ userId, productId: _id }));
    } else {
      dispatch(addProductWishlist({ userId, product }));
    }
  };

  return (
    <article
      className={cn('group relative flex h-full flex-col', className)}
      onPointerEnter={() => setSwapArmed(true)}
      onFocusCapture={() => setSwapArmed(true)}
    >
      <Link to={`/product/${_id}`} className="flex flex-1 flex-col focus-visible:outline-offset-4">
        <div className="relative isolate aspect-square overflow-hidden bg-[#f4f4f4]">
          {primary && (
            <img
              src={primary}
              alt={title}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              className={cn(
                'h-full w-full object-contain p-3 mix-blend-multiply sm:p-5',
                'transition-[opacity,transform] duration-[600ms] ease-out-quint',
                'group-hover:scale-[1.04]',
                secondary && swapArmed && 'group-hover:opacity-0'
              )}
            />
          )}

          {/* Second shot crossfades in on hover. Both stay mounted so the swap
              has an exit as well as an enter. */}
          {secondary && swapArmed && (
            <img
              src={secondary}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              onError={() => setSwapFailed(true)}
              className="absolute inset-0 h-full w-full object-contain p-3 mix-blend-multiply opacity-0 transition-[opacity,transform] duration-[600ms] ease-out-quint group-hover:scale-[1.04] group-hover:opacity-100 sm:p-5"
            />
          )}

          {!inStock && (
            <div className="absolute inset-x-0 bottom-0 bg-neutral-950/85 py-1.5 text-center text-eyebrow font-bold uppercase text-white">
              Sold Out
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-0.5 pt-3.5">
          {isRecent(createdAt) && <Badge className="mb-1">Just In</Badge>}

          <h3 className="line-clamp-2 text-[0.9375rem] font-semibold capitalize leading-snug">
            {title}
          </h3>

          {(showBrand || category) && (
            <p className="text-sm capitalize text-muted-foreground">
              {[showBrand && brand, category].filter(Boolean).join(' · ')}
            </p>
          )}

          {colourCount > 1 && (
            <p className="text-sm text-subtle-foreground">{colourCount} Colours</p>
          )}

          <p className="tnum mt-auto pt-2 text-[0.9375rem] font-semibold">
            {formatPrice(price)}
          </p>
        </div>
      </Link>

      {/* Sits outside the Link so it is its own control rather than a nested
          interactive element. Always visible on touch, revealed on hover for
          pointer devices. */}
      <button
        type="button"
        onClick={toggleWishlist}
        aria-pressed={isInWishlist}
        aria-label={isInWishlist ? `Remove ${title} from favourites` : `Add ${title} to favourites`}
        className={cn(
          'absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full',
          'bg-background/80 backdrop-blur-sm',
          'transition-[opacity,background-color,transform] duration-fast ease-swift',
          'hover:bg-background active:scale-[0.96]',
          'focus-visible:opacity-100',
          isInWishlist
            ? 'opacity-100'
            : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100'
        )}
      >
        <Heart
          className={cn('h-[18px] w-[18px]', isInWishlist && 'fill-current')}
          strokeWidth={1.75}
        />
      </button>
    </article>
  );
};

export default ProductCard;
