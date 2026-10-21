import { Link } from 'react-router-dom';

import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { Rail, RailItem } from '@/components/ui/rail';
import { Button } from '@/components/ui/button';

/** Item width is fixed per breakpoint so cards align to a visible rhythm and
 *  the next one always peeks past the right edge, signalling more content. */
const ITEM = 'w-[62vw] xs:w-[46vw] sm:w-[38vw] md:w-[30vw] lg:w-[23vw] xl:w-[19vw] pr-3 lg:pr-4';

const ProductRail = ({
  eyebrow,
  title,
  products = [],
  loading = false,
  viewAllHref = '/products',
  skeletonCount = 6,
}) => {
  if (!loading && products.length === 0) return null;

  return (
    <Section padding="md">
      <Container>
        <Rail
          label={title}
          controls={(arrows) => (
            <SectionHeader
              eyebrow={eyebrow}
              title={title}
              action={
                <div className="flex items-center gap-4">
                  <Button asChild variant="link" className="hidden sm:inline-flex">
                    <Link to={viewAllHref}>View All</Link>
                  </Button>
                  <div className="hidden lg:block">{arrows}</div>
                </div>
              }
            />
          )}
        >
          {loading
            ? Array.from({ length: skeletonCount }, (_, index) => (
                <RailItem key={index} className={ITEM}>
                  <ProductCardSkeleton />
                </RailItem>
              ))
            : products.map((product, index) => (
                <RailItem key={product._id} className={ITEM}>
                  <ProductCard product={product} eager={index < 4} />
                </RailItem>
              ))}
        </Rail>

        <div className="mt-6 sm:hidden">
          <Button asChild variant="outline" block>
            <Link to={viewAllHref}>View All</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
};

export default ProductRail;
