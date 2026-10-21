import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { cn } from '@/lib/utils';

/**
 * The catalogue grid. Two columns on phones rather than one: sneakers are
 * recognisable at small sizes, and a single column makes browsing feel endless.
 */
const ProductGrid = ({ products = [], loading = false, skeletonCount = 12, className, columns }) => {
  const grid = cn(
    'grid gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10',
    columns ?? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    className
  );

  if (loading) {
    return (
      <div className={grid}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={grid}>
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} eager={index < 8} />
      ))}
    </div>
  );
};

export default ProductGrid;
