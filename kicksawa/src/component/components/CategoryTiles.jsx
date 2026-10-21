import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { Reveal } from '@/components/ui/motion';

/**
 * Category values match the `categories` array on the product documents, so
 * these tiles land on a genuinely filtered grid rather than a generic listing.
 * Counts are the live catalogue's four deepest categories.
 */
const CATEGORIES = [
  {
    label: 'Sneakers',
    slug: 'sneakers',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=70',
  },
  {
    label: 'Running',
    slug: 'running',
    image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=70',
  },
  {
    label: 'Lifestyle',
    slug: 'lifestyle',
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=70',
  },
  {
    label: 'Streetwear',
    slug: 'streetwear',
    image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=1200&q=70',
  },
];

const CategoryTiles = () => (
  <Section padding="md">
    <Container>
      <SectionHeader eyebrow="Find your fit" title="Shop by Category" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {CATEGORIES.map((category, index) => (
          <Reveal key={category.slug} delay={index * 0.06}>
            <Link
              to={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-surface lg:aspect-[3/4]"
            >
              <img
                src={category.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[700ms] ease-out-quint group-hover:scale-[1.06]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 lg:p-5">
                <h3 className="font-display text-display-sm font-extrabold uppercase text-white font-wide">
                  {category.label}
                </h3>
                {/* Nudges out along the diagonal it points down — the arrow
                    reads as following the cursor rather than just scaling. */}
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-white transition-transform duration-[300ms] ease-swift group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Container>
  </Section>
);

export default CategoryTiles;
