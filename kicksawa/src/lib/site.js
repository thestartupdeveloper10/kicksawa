/**
 * Single source of truth for navigation and brand data.
 *
 * Brand `name` values are sent straight to the API as `products?brand=<name>`,
 * so they must match the values stored on the product documents exactly.
 * Changing the casing here silently returns an empty collection.
 */

export const SITE = {
  name: 'KICKSAWA',
  tagline: 'Authentic sneakers & streetwear',
  locale: 'Kenya',
  currency: 'KES',
}

/**
 * Delivery policy. The footer ticker, the product page and the bag summary all
 * read from these, so the promise on the page and the number charged at
 * checkout cannot drift apart.
 */
export const DELIVERY_FEE = 200
export const FREE_DELIVERY_THRESHOLD = 10000

export const deliveryFeeFor = (subtotal) =>
  subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE

/** Primary nav. `menu` marks the items that open a mega panel on desktop. */
export const NAV = [
  { label: 'Shop', href: '/products', menu: 'shop' },
  { label: 'Brands', href: '/brands', menu: 'brands' },
  { label: 'Contact', href: '/contact-us' },
]

export const BRANDS = [
  { name: 'Nike', blurb: 'Just Do It.' },
  { name: 'Adidas', blurb: 'Impossible Is Nothing.' },
  { name: 'Puma', blurb: 'Forever Faster.' },
  { name: 'New Balance', blurb: 'Fearlessly Independent.' },
  { name: 'Under Armour', blurb: 'The Only Way Is Through.' },
  { name: 'Reebok', blurb: 'Sport The Unexpected.' },
]

/** Links that exist today. Nothing here should resolve to a 404. */
export const SHOP_LINKS = [
  { label: 'All Products', href: '/products' },
  { label: 'New Arrivals', href: '/products' },
  { label: 'Shop by Brand', href: '/brands' },
]

export const FOOTER_COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Brands', href: '/brands' },
      { label: 'Favourites', href: '/favorites' },
      { label: 'Bag', href: '/cart' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'Delivery', href: '/contact-us' },
      { label: 'Returns', href: '/contact-us' },
      { label: 'Order Status', href: '/my-account' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Account', href: '/my-account' },
      { label: 'Sign In', href: '/login' },
      { label: 'Join Us', href: '/signup' },
    ],
  },
]

export const PROMISES = [
  { key: 'delivery', label: 'Countrywide Delivery' },
  { key: 'secure', label: 'Secure M-Pesa Checkout' },
  { key: 'authentic', label: '100% Authentic' },
]
