import { Link } from 'react-router-dom';

import adidas from '../../assets/imgs/adidas.svg';
import newBalance from '../../assets/imgs/new.svg';
import nike from '../../assets/imgs/nike.svg';
import puma from '../../assets/imgs/puma.svg';
import reebok from '../../assets/imgs/reebok.svg';
import underArmour from '../../assets/imgs/under-armour.svg';

import { Container, Section } from '@/components/ui/layout';
import { Marquee } from '@/components/ui/motion';

/**
 * Only brands we actually stock, so every mark links to a populated grid —
 * `brand` is sent to the API verbatim and must match the product documents.
 *
 * `height` is set per logo rather than shared. These marks have very different
 * proportions (a wide swoosh vs. a stacked trefoil), so a single box makes the
 * wordmarks tower over the symbols. These values equalise them optically.
 */
const LOGOS = [
  { name: 'Nike', logo: nike, brand: 'Nike', height: 'h-7 sm:h-9' },
  { name: 'Adidas', logo: adidas, brand: 'Adidas', height: 'h-11 sm:h-14' },
  { name: 'Puma', logo: puma, brand: 'Puma', height: 'h-8 sm:h-10' },
  { name: 'New Balance', logo: newBalance, brand: 'New Balance', height: 'h-8 sm:h-10' },
  { name: 'Reebok', logo: reebok, brand: 'Reebok', height: 'h-7 sm:h-9' },
  { name: 'Under Armour', logo: underArmour, brand: 'Under Armour', height: 'h-10 sm:h-12' },
];

const BrandMarquee = () => (
  <Section padding="sm" className="overflow-hidden border-y border-line">
    <Container className="mb-7">
      <p className="text-center text-eyebrow font-bold uppercase text-muted-foreground">
        The brands that built the culture
      </p>
    </Container>

    <Marquee duration={36}>
      {LOGOS.map((item) => (
        <div key={item.name} className="group/logo flex shrink-0 items-center px-7 sm:px-11">
          <Link to={`/products/${item.brand}`} aria-label={`Shop ${item.name}`}>
            <img
              src={item.logo}
              alt={`${item.name} logo`}
              loading="lazy"
              className={`${item.height} w-auto object-contain opacity-70 transition-opacity duration-[250ms] ease-swift group-hover/logo:opacity-100 dark:invert`}
            />
          </Link>
        </div>
      ))}
    </Marquee>
  </Section>
);

export default BrandMarquee;
