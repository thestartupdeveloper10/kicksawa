import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Mirrors ProductCard's geometry exactly so nothing shifts when data lands. */
const ProductCardSkeleton = ({ className }) => (
  <div className={cn('flex flex-col', className)} aria-hidden="true">
    <Skeleton className="aspect-square w-full" />
    <div className="flex flex-col gap-2 pt-3.5">
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-3.5 w-2/5" />
      <Skeleton className="mt-1.5 h-4 w-1/4" />
    </div>
  </div>
);

export default ProductCardSkeleton;
