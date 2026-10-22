import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { userRequest, apiError } from '../../services/requestMethods';
import {
  EmptyState, ErrorNote, LoadingRows, PageHeader, Panel, PaymentBadge, StatTile,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  createdAtOf, formatDate, formatKsh, isTracked, LOW_STOCK, orderNumber,
} from '@/lib/format';

const DAY_MS = 24 * 60 * 60 * 1000;

/** 30 consecutive days ending today (Nairobi), zero-filled, so a quiet day reads as zero, not a gap. */
const last30Days = (byDay) => {
  const index = new Map(byDay.map((d) => [d.date, d]));
  const days = [];
  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * DAY_MS).toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
    days.push({ date, revenue: index.get(date)?.revenue ?? 0, orders: index.get(date)?.orders ?? 0 });
  }
  return days;
};

const shortDay = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });

const compactKsh = (value) =>
  value >= 1000 ? `${(value / 1000).toLocaleString('en-KE', { maximumFractionDigits: 1 })}k` : String(value);

/** Crosshair tooltip: the date, then the value in primary ink. */
const RevenueTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-background px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{formatDate(`${day.date}T12:00:00`)}</p>
      <p className="tnum mt-0.5 font-semibold">{formatKsh(day.revenue)}</p>
      <p className="tnum text-xs text-muted-foreground">
        {day.orders} {day.orders === 1 ? 'order' : 'orders'}
      </p>
    </div>
  );
};

const RevenueChart = ({ days }) => {
  const [asTable, setAsTable] = useState(false);
  const total = days.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <Panel
      title="Paid revenue, last 30 days"
      action={
        <Button variant="link" size="sm" onClick={() => setAsTable(!asTable)}>
          {asTable ? 'Show chart' : 'Show table'}
        </Button>
      }
    >
      {total === 0 ? (
        <EmptyState title="No paid orders yet" body="Revenue appears here once orders are paid." />
      ) : asTable ? (
        <div className="max-h-[280px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-eyebrow font-bold uppercase text-muted-foreground">
                <th className="pb-2">Day</th>
                <th className="pb-2 text-right">Orders</th>
                <th className="pb-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {[...days].reverse().map((d) => (
                <tr key={d.date} className="border-t border-line">
                  <td className="py-1.5">{shortDay(d.date)}</td>
                  <td className="py-1.5 text-right">{d.orders}</td>
                  <td className="py-1.5 text-right">{formatKsh(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[280px] text-foreground">
          <ResponsiveContainer width="100%" height="100%">
            {/* Bars, not a line: each day is its own total, and a curve drawn
                between them invents in-between values that never happened. */}
            <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
              {/* Recessive grid: horizontal hairlines only. */}
              <CartesianGrid vertical={false} stroke="hsl(var(--line))" />
              <XAxis
                dataKey="date"
                tickFormatter={shortDay}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--line))' }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tickFormatter={compactKsh}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={44}
                allowDecimals={false}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'hsl(var(--surface))' }} />
              <Bar
                dataKey="revenue"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      userRequest.get('/orders/summary'),
      userRequest.get('/orders'),
      userRequest.get('/products'),
      userRequest.get('/contact'),
    ])
      .then(([s, o, p, m]) => {
        if (cancelled) return;
        setSummary(s.data);
        setOrders([...o.data].sort((a, b) => createdAtOf(b) - createdAtOf(a)));
        setProducts(p.data);
        setMessages(m.data);
      })
      .catch((err) => !cancelled && setError(apiError(err, 'Could not load the dashboard.')));
    return () => {
      cancelled = true;
    };
  }, []);

  const days = useMemo(() => (summary ? last30Days(summary.revenueByDay) : []), [summary]);

  // Every tracked size at or below the threshold, lowest first.
  const lowStock = useMemo(
    () =>
      products
        .filter(isTracked)
        .flatMap((p) => p.stock.filter((e) => e.quantity <= LOW_STOCK).map((e) => ({ product: p, ...e })))
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 6),
    [products]
  );

  const change = summary && summary.revenuePrev30 > 0
    ? Math.round(((summary.revenue30 - summary.revenuePrev30) / summary.revenuePrev30) * 100)
    : null;

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}
        title="Dashboard"
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summary ? (
          <>
            <StatTile
              label="Revenue, 30 days"
              value={formatKsh(summary.revenue30)}
              hint={
                change === null
                  ? `${summary.orders30} paid ${summary.orders30 === 1 ? 'order' : 'orders'}`
                  : `${summary.orders30} paid orders · ${change >= 0 ? '+' : ''}${change}% vs previous 30`
              }
            />
            <StatTile
              label="To ship"
              value={summary.toShip}
              hint="Paid, not yet shipped"
              to="/orders?view=toship"
            />
            <StatTile
              label="Needs review"
              value={summary.needsReview}
              hint="Payments that need a decision"
              to="/orders?view=review"
              tone={summary.needsReview > 0 ? 'alert' : undefined}
            />
            <StatTile
              label="Awaiting payment"
              value={summary.awaitingPayment}
              hint="M-PESA prompt sent, not yet paid"
              to="/orders?view=awaiting"
            />
            <StatTile
              label="Low or sold-out sizes"
              value={summary.lowStockSizes + summary.soldOutSizes}
              hint={`${summary.soldOutSizes} sold out · ${summary.pairsOnHand} pairs on hand`}
              to="/products?view=low"
              tone={summary.soldOutSizes > 0 ? 'alert' : undefined}
            />
            <StatTile
              label="Customers"
              value={summary.customers}
              hint={`${summary.newCustomers30} new in 30 days`}
              to="/customers"
            />
          </>
        ) : (
          Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[124px] rounded-lg" />)
        )}
      </div>

      <div className="mt-6">
        {summary ? <RevenueChart days={days} /> : <Skeleton className="h-[352px] rounded-lg" />}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          title="Latest orders"
          action={<Link to="/orders" className="text-sm font-semibold underline underline-offset-4">All orders</Link>}
          className="xl:col-span-2"
        >
          {!summary ? (
            <LoadingRows rows={4} />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <ul className="divide-y divide-line">
              {orders.slice(0, 6).map((order) => (
                <li key={order._id}>
                  <Link
                    to={`/orders?open=${order._id}`}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 hover:opacity-80"
                  >
                    <span className="min-w-0">
                      <span className="tnum font-semibold">{orderNumber(order._id)}</span>
                      <span className="ml-3 text-sm text-muted-foreground">{formatDate(createdAtOf(order))}</span>
                    </span>
                    <span className="flex items-center gap-4">
                      <PaymentBadge order={order} />
                      <span className="tnum w-24 text-right font-semibold">{formatKsh(order.amount)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel
            title="Running low"
            action={<Link to="/products?view=low" className="text-sm font-semibold underline underline-offset-4">Stock</Link>}
          >
            {!summary ? (
              <LoadingRows rows={3} />
            ) : lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">Every tracked size has more than {LOW_STOCK} pairs.</p>
            ) : (
              <ul className="space-y-2.5 text-sm">
                {lowStock.map((row) => (
                  <li key={`${row.product._id}-${row.size}`} className="flex items-baseline justify-between gap-3">
                    <Link to={`/products/${row.product._id}`} className="min-w-0 truncate hover:underline">
                      {row.product.title}
                      {row.size && <span className="text-muted-foreground"> · {row.size}</span>}
                    </Link>
                    <span className={`tnum shrink-0 font-semibold ${row.quantity === 0 ? 'text-brand' : ''}`}>
                      {row.quantity === 0 ? 'Sold out' : `${row.quantity} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Messages"
            action={<Link to="/messages" className="text-sm font-semibold underline underline-offset-4">Inbox</Link>}
          >
            {!summary ? (
              <LoadingRows rows={2} />
            ) : messages.filter((m) => !m.handled).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing waiting for a reply.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {messages.filter((m) => !m.handled).slice(0, 3).map((m) => (
                  <li key={m._id}>
                    <Link to={`/messages?open=${m._id}`} className="block hover:opacity-80">
                      <span className="font-semibold">{m.subject}</span>
                      <span className="block truncate text-muted-foreground">
                        {m.name} · {formatDate(createdAtOf(m))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
