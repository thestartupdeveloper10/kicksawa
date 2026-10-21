import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import adidas from '../../assets/imgs/adidas.svg';
import newBalance from '../../assets/imgs/new.svg';
import nike from '../../assets/imgs/nike.svg';
import puma from '../../assets/imgs/puma.svg';
import reebok from '../../assets/imgs/reebok.svg';
import underArmour from '../../assets/imgs/under-armour.svg';

import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { Reveal } from '@/components/ui/motion';
import { Skeleton } from '@/components/ui/skeleton';
import { publicRequest } from '@/service/requestMethods';

/** Per-logo heights: these marks have very different proportions, so a shared
 *  box would make the wordmarks tower over the symbols. */
const FEATURED = [
  { name: 'Nike', logo: nike, height: 'h-14 sm:h-16', blurb: 'Just Do It.' },
  { name: 'Adidas', logo: adidas, height: 'h-20 sm:h-24', blurb: 'Impossible Is Nothing.' },
  { name: 'Puma', logo: puma, height: 'h-16 sm:h-20', blurb: 'Forever Faster.' },
  { name: 'New Balance', logo: newBalance, height: 'h-16 sm:h-20', blurb: 'Fearlessly Independent.' },
  { name: 'Reebok', logo: reebok, height: 'h-14 sm:h-16', blurb: 'Sport The Unexpected.' },
  { name: 'Under Armour', logo: underArmour, height: 'h-[4.5rem] sm:h-24', blurb: 'The Only Way Is Through.' },
];

const FEATURED_NAMES = new Set(FEATURED.map((b) => b.name));

const BrandTile = ({ brand, count }) => (
  <Link
    to={`/products/${brand.name}`}
    className="group flex flex-col focus-visible:outline-offset-4"
  >
    <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden bg-[#f4f4f4] transition-colors duration-[250ms] ease-swift">
      <img
        src={brand.logo}
        alt={`${brand.name} logo`}
        loading="lazy"
        className={`${brand.height} w-auto max-w-[55%] object-contain mix-blend-multiply transition-transform duration-[450ms] ease-out-quint group-hover:scale-[1.06]`}
      />
      <ArrowUpRight
        className="absolute right-4 top-4 h-5 w-5 text-neutral-400 transition-[transform,color] duration-[300ms] ease-swift group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-900"
        strokeWidth={2}
      />
    </div>

    <div className="flex items-baseline justify-between gap-3 pt-3.5">
      <h3 className="font-display text-display-sm font-extrabold uppercase font-wide">
        {brand.name}
      </h3>
      {typeof count === 'number' ? (
        <span className="tnum shrink-0 text-sm text-muted-foreground">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      ) : (
        <Skeleton className="h-4 w-14 shrink-0" />
      )}
    </div>
    <p className="text-sm text-muted-foreground">{brand.blurb}</p>
  </Link>
);

const BrandsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await publicRequest.get('products');
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        // Counts are an enhancement — the directory is still usable without them.
        console.error('Failed to load brand counts', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.brand) map.set(p.brand, (map.get(p.brand) || 0) + 1);
    });
    return map;
  }, [products]);

  // The catalogue carries more labels than we hold logos for. Listing them as
  // text keeps the directory honest instead of silently hiding stock.
  const otherBrands = useMemo(
    () =>
      [...counts.entries()]
        .filter(([name]) => !FEATURED_NAMES.has(name))
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    [counts]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main" className="flex-1">
        <Section padding="md">
          <Container>
            <SectionHeader
              as="h1"
              eyebrow="Directory"
              title="All Brands"
              description="Every label we stock, verified authentic and shipped countrywide."
            />

            <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED.map((brand, index) => (
                <Reveal key={brand.name} delay={index * 0.05}>
                  <BrandTile
                    brand={brand}
                    count={loading ? undefined : counts.get(brand.name) ?? 0}
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        {otherBrands.length > 0 && (
          <Section padding="md" className="border-t border-line">
            <Container>
              <SectionHeader eyebrow="Also in stock" title="More Labels" />
              <ul className="flex flex-wrap gap-2.5">
                {otherBrands.map(([name, count]) => (
                  <li key={name}>
                    <Link
                      to={`/products/${name}`}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm font-medium transition-[background-color,border-color,transform] duration-fast ease-swift hover:border-foreground hover:bg-surface active:scale-[0.96]"
                    >
                      {name}
                      <span className="tnum text-muted-foreground">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </Section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BrandsPage;
