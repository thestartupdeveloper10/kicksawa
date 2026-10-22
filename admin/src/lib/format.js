/*
 * Formatting and status vocabulary shared by every admin screen. Labels and
 * badge variants mirror the storefront (kicksawa/src/component/pages/
 * UserProfilePage.jsx), so an order reads the same to staff and customers.
 */

export const formatKsh = (value) => `Ksh ${Number(value || 0).toLocaleString('en-KE')}`;

/** The short reference customers see on their confirmation page. */
export const orderNumber = (id) => `#${String(id).slice(-8).toUpperCase()}`;

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

/** Creation time of any Mongo document, including ones saved before timestamps existed. */
export const createdAtOf = (doc) =>
  doc?.createdAt ?? (doc?._id ? new Date(parseInt(String(doc._id).slice(0, 8), 16) * 1000) : null);

// At or below this many pairs a size is flagged for restocking (matches the API).
export const LOW_STOCK = 2;

/** Orders from before payments were tracked have no payment record; they were only created once paid. */
export const paymentStatusOf = (order) => order?.payment?.status || 'paid';

export const PAYMENT = {
  paid: { label: 'Paid', variant: 'success' },
  awaiting: { label: 'Awaiting payment', variant: 'outline' },
  review: { label: 'Needs review', variant: 'brand' },
  failed: { label: 'Failed', variant: 'neutral' },
  refunded: { label: 'Refunded', variant: 'neutral' },
};

export const FULFILMENT = {
  pending: { label: 'Pending', variant: 'outline' },
  processing: { label: 'Processing', variant: 'outline' },
  shipped: { label: 'Shipped', variant: 'solid' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'brand' },
};

export const FULFILMENT_STEPS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

/** Paid and not yet on its way. */
export const isToShip = (order) =>
  paymentStatusOf(order) === 'paid' && ['pending', 'processing'].includes(order.status || 'pending');

export const isTracked = (product) => Array.isArray(product?.stock) && product.stock.length > 0;
export const pairsOnHand = (product) =>
  isTracked(product) ? product.stock.reduce((sum, entry) => sum + entry.quantity, 0) : null;
export const lowSizes = (product) =>
  isTracked(product) ? product.stock.filter((entry) => entry.quantity <= LOW_STOCK) : [];

/** Profiles hold these when someone never gave a phone number. */
export const realPhone = (phone) =>
  phone && phone !== 'Not Provided' && !String(phone).startsWith('Google-') ? phone : null;

/** Paid orders and spend per user id. */
export const spendByUser = (orders) => {
  const totals = new Map();
  orders
    .filter((o) => paymentStatusOf(o) === 'paid')
    .forEach((o) => {
      const t = totals.get(o.userId) || { orders: 0, spent: 0 };
      totals.set(o.userId, { orders: t.orders + 1, spent: t.spent + o.amount });
    });
  return totals;
};
