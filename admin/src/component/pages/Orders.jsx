import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import { userRequest, apiError } from '../../services/requestMethods';
import {
  ConfirmDialog, EmptyState, ErrorNote, FilterChips, FulfilmentBadge, LoadingRows, PageHeader, Panel,
  PaymentBadge, SearchInput, Table, Td, Th,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Field, FormMessage, Textarea, controlClass } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import {
  FULFILMENT, FULFILMENT_STEPS, createdAtOf, formatDateTime, formatDate, formatKsh, isToShip, orderNumber,
  paymentStatusOf,
} from '@/lib/format';

const VIEWS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'toship', label: 'To ship', test: isToShip },
  { id: 'review', label: 'Needs review', test: (o) => paymentStatusOf(o) === 'review' },
  { id: 'awaiting', label: 'Awaiting payment', test: (o) => paymentStatusOf(o) === 'awaiting' },
  { id: 'paid', label: 'Paid', test: (o) => paymentStatusOf(o) === 'paid' },
  { id: 'failed', label: 'Failed', test: (o) => paymentStatusOf(o) === 'failed' },
  { id: 'refunded', label: 'Refunded', test: (o) => paymentStatusOf(o) === 'refunded' },
];

/** Why an order is waiting on a person, in plain words. */
const reviewReason = (order) => {
  const { paidAmount } = order.payment || {};
  if (paidAmount !== undefined && paidAmount < order.amount) {
    return `M-PESA received ${formatKsh(paidAmount)} but the order total is ${formatKsh(order.amount)}.`;
  }
  return 'The payment arrived after the order had expired, and an item sold out in the meantime.';
};

const Detail = ({ label, children }) => (
  <>
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="tnum min-w-0 break-words">{children ?? '—'}</dd>
  </>
);

const OrderDetails = ({ order, customer, onResolve }) => {
  const payment = order.payment || {};
  const status = paymentStatusOf(order);
  return (
    <div className="grid gap-8 py-2 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <p className="mb-3 text-eyebrow font-bold uppercase text-muted-foreground">Items</p>
        <ul className="divide-y divide-line text-sm">
          {order.products.map((line, i) => (
            <li key={`${line.productId}-${i}`} className="flex items-baseline justify-between gap-4 py-2">
              <span className="min-w-0">
                <Link to={`/products/${line.productId}`} className="font-semibold hover:underline">
                  {line.title || line.productId}
                </Link>
                <span className="text-muted-foreground">
                  {line.size && ` · Size ${line.size}`} · ×{line.quantity}
                </span>
                {line.color && (
                  <span
                    className="ml-2 inline-block h-3 w-3 rounded-full align-middle ring-1 ring-line-strong"
                    style={{ backgroundColor: line.color }}
                    title={line.color}
                  />
                )}
              </span>
              {line.unitPrice !== undefined && (
                <span className="tnum shrink-0">{formatKsh(line.unitPrice * line.quantity)}</span>
              )}
            </li>
          ))}
        </ul>
        <dl className="tnum mt-3 space-y-1 text-sm">
          {order.subtotal !== undefined && (
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt><dd>{formatKsh(order.subtotal)}</dd>
            </div>
          )}
          {order.deliveryFee !== undefined && (
            <div className="flex justify-between text-muted-foreground">
              <dt>Delivery</dt><dd>{order.deliveryFee ? formatKsh(order.deliveryFee) : 'Free'}</dd>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <dt>Total</dt><dd>{formatKsh(order.amount)}</dd>
          </div>
        </dl>

        <p className="mb-2 mt-6 text-eyebrow font-bold uppercase text-muted-foreground">Deliver to</p>
        <p className="text-sm">{order.address?.details || '—'}</p>
        {customer && (
          <p className="mt-1 text-sm text-muted-foreground">
            <Link to={`/customers/${customer.id}`} className="underline underline-offset-4">{customer.username}</Link>
            {' · '}{customer.email}
          </p>
        )}
      </div>

      <div>
        <p className="mb-3 text-eyebrow font-bold uppercase text-muted-foreground">Payment</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
          <Detail label="Method">{payment.method ? 'M-PESA' : 'M-PESA (before tracking)'}</Detail>
          <Detail label="Receipt">{payment.receipt}</Detail>
          <Detail label="Phone">{payment.paidPhone || payment.phone}</Detail>
          <Detail label="Paid">{payment.paidAmount !== undefined ? formatKsh(payment.paidAmount) : undefined}</Detail>
          <Detail label="Paid at">{payment.paidAt ? formatDateTime(payment.paidAt) : undefined}</Detail>
          <Detail label="M-PESA says">{payment.resultDesc}</Detail>
          {order.inventory?.status && order.inventory.status !== 'none' && (
            <Detail label="Stock">
              {order.inventory.status === 'held' ? 'Held for this order' : 'Returned to shelf'}
            </Detail>
          )}
        </dl>

        {status === 'review' && (
          <div className="mt-5 rounded-lg bg-brand/10 p-4 text-sm">
            <p className="font-semibold text-brand">Needs a decision</p>
            <p className="mt-1">{reviewReason(order)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onResolve(order, 'paid')}>Mark paid</Button>
              <Button size="sm" variant="outline" onClick={() => onResolve(order, 'refunded')}>Refunded</Button>
            </div>
          </div>
        )}

        {payment.review?.resolution && (
          <p className="mt-5 rounded-lg bg-surface p-4 text-sm">
            Resolved as <strong>{payment.review.resolution}</strong> on {formatDate(payment.review.at)}
            {payment.review.note && <span className="mt-1 block text-muted-foreground">“{payment.review.note}”</span>}
          </p>
        )}
      </div>
    </div>
  );
};

const Orders = () => {
  const [params, setParams] = useSearchParams();
  const view = VIEWS.some((v) => v.id === params.get('view')) ? params.get('view') : 'all';
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(params.get('open'));
  const [savingId, setSavingId] = useState(null);
  const [resolving, setResolving] = useState(null); // { order, resolution }
  const [note, setNote] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([userRequest.get('/orders'), userRequest.get('/users')])
      .then(([o, u]) => {
        if (cancelled) return;
        setOrders([...o.data].sort((a, b) => createdAtOf(b) - createdAtOf(a)));
        // toJSON exposes the id as `id`; orders store it as userId.
        setCustomers(Object.fromEntries(u.data.map((c) => [String(c.id ?? c._id), c])));
      })
      .catch((err) => !cancelled && setError(apiError(err, 'Could not load orders.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(
    () => Object.fromEntries(VIEWS.map((v) => [v.id, orders.filter(v.test).length])),
    [orders]
  );

  const visible = useMemo(() => {
    const test = VIEWS.find((v) => v.id === view).test;
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (!test(order)) return false;
      if (!term) return true;
      const c = customers[order.userId];
      return [orderNumber(order._id), order._id, c?.username, c?.email, order.payment?.receipt, order.payment?.phone]
        .some((f) => f && String(f).toLowerCase().includes(term));
    });
  }, [orders, customers, view, search]);

  const replaceOrder = (updated) => setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));

  const updateStatus = async (order, status) => {
    setSavingId(order._id);
    setError('');
    try {
      const { data } = await userRequest.put(`/orders/${order._id}`, { status });
      replaceOrder(data);
    } catch (err) {
      setError(apiError(err, `Could not update ${orderNumber(order._id)}.`));
    } finally {
      setSavingId(null);
    }
  };

  const openResolve = (order, resolution) => {
    setResolving({ order, resolution });
    setNote('');
    setResolveError('');
  };

  const confirmResolve = async () => {
    setBusy(true);
    setResolveError('');
    try {
      const { data } = await userRequest.post(`/orders/${resolving.order._id}/resolve-review`, {
        resolution: resolving.resolution,
        note: note.trim() || undefined,
      });
      replaceOrder(data.order);
      setNotice(data.warning || `${orderNumber(data.order._id)} marked ${resolving.resolution}.`);
      setResolving(null);
    } catch (err) {
      setResolveError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        description="Payment is settled by M-PESA; you move paid orders through shipping. Orders needing a decision are flagged."
      />

      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <FormMessage tone="info" className="mb-6">{notice}</FormMessage>}

      <Panel>
        <div className="mb-5 flex flex-col gap-4">
          <FilterChips
            options={VIEWS.map((v) => ({ id: v.id, label: v.label, count: counts[v.id] }))}
            value={view}
            onChange={(id) => setParams(id === 'all' ? {} : { view: id })}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Search order, customer, receipt or phone" />
        </div>

        {loading ? (
          <LoadingRows />
        ) : visible.length === 0 ? (
          <EmptyState title="No orders here" body={search ? 'Nothing matches that search.' : 'Try another view.'} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Date</Th>
                <Th>Customer</Th>
                <Th className="text-right">Total</Th>
                <Th>Payment</Th>
                <Th>Shipping</Th>
                <Th><span className="sr-only">Details</span></Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => {
                const open = expanded === order._id;
                const customer = customers[order.userId];
                const paid = paymentStatusOf(order) === 'paid';
                return (
                  <Fragment key={order._id}>
                    <tr className={cn(open && 'bg-surface')}>
                      <Td className="tnum font-semibold">{orderNumber(order._id)}</Td>
                      <Td className="whitespace-nowrap text-muted-foreground">{formatDate(createdAtOf(order))}</Td>
                      <Td className="max-w-[12rem] truncate">{customer?.username || <span className="text-muted-foreground">Deleted customer</span>}</Td>
                      <Td className="tnum text-right font-semibold">{formatKsh(order.amount)}</Td>
                      <Td><PaymentBadge order={order} /></Td>
                      <Td>
                        {/* Shipping something unpaid is the mistake this guards against. */}
                        {paid ? (
                          <select
                            aria-label={`Shipping status for ${orderNumber(order._id)}`}
                            value={order.status || 'pending'}
                            disabled={savingId === order._id}
                            onChange={(e) => updateStatus(order, e.target.value)}
                            className={cn(controlClass(false), 'h-9 w-auto py-0 pr-8 text-sm')}
                          >
                            {FULFILMENT_STEPS.map((s) => (
                              <option key={s} value={s}>{FULFILMENT[s].label}</option>
                            ))}
                          </select>
                        ) : (
                          <FulfilmentBadge status={order.status} />
                        )}
                      </Td>
                      <Td className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-expanded={open}
                          aria-label={open ? 'Hide details' : 'Show details'}
                          onClick={() => setExpanded(open ? null : order._id)}
                        >
                          <ChevronDown className={cn('h-4 w-4 transition-transform duration-fast', open && 'rotate-180')} />
                        </Button>
                      </Td>
                    </tr>
                    {open && (
                      <tr className="bg-surface">
                        <td colSpan={7} className="border-b border-line px-1 pb-5">
                          <OrderDetails order={order} customer={customer} onResolve={openResolve} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </Table>
        )}
      </Panel>

      <ConfirmDialog
        open={Boolean(resolving)}
        onClose={() => setResolving(null)}
        title={resolving?.resolution === 'paid' ? 'Mark as paid?' : 'Mark as refunded?'}
        description={
          resolving &&
          (resolving.resolution === 'paid'
            ? `${orderNumber(resolving.order._id)} moves to Processing and its items are held for shipping.`
            : `${orderNumber(resolving.order._id)} is cancelled and its items go back on sale. Return the money through M-PESA first.`)
        }
        confirmLabel={resolving?.resolution === 'paid' ? 'Mark paid' : 'Mark refunded'}
        onConfirm={confirmResolve}
        busy={busy}
        error={resolveError}
      >
        <Field label="Note (optional)" hint="Kept on the order, e.g. how the customer was contacted.">
          {({ id, describedBy }) => (
            <Textarea id={id} describedBy={describedBy} rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          )}
        </Field>
      </ConfirmDialog>
    </>
  );
};

export default Orders;
