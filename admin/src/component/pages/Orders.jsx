import { Fragment, useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { userRequest } from "../../services/requestMethods";

const FULFILMENT_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const PAYMENT_FILTERS = [
  { id: 'paid', label: 'Paid' },
  { id: 'awaiting', label: 'Awaiting payment' },
  { id: 'review', label: 'Needs review' },
  { id: 'failed', label: 'Failed' },
  { id: 'all', label: 'All' },
];

const formatKsh = (value) => `Ksh ${Number(value || 0).toLocaleString('en-KE')}`;
const orderNumber = (id) => `#${String(id).slice(-8).toUpperCase()}`;
// Orders placed before payments were tracked have no payment record; they
// were only ever created after a successful payment.
const paymentStatusOf = (order) => order.payment?.status || 'paid';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'processing': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
    case 'shipped': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'delivered': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  }
};

const getPaymentColor = (status) => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'awaiting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case 'review': return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('paid');
  const [expanded, setExpanded] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [{ data: orderData }, { data: userData }] = await Promise.all([
          userRequest.get('/orders'),
          userRequest.get('/users'),
        ]);
        if (cancelled) return;
        // Orders only carry a userId, so names come from the user list.
        setCustomers(Object.fromEntries(userData.map((u) => [String(u._id), u])));
        setOrders(
          [...orderData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (err) {
        console.error('Failed to load orders', err);
        if (!cancelled) setError('Could not load orders. Check you are signed in as an admin.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const customerName = (order) => {
    const customer = customers[order.userId];
    return customer?.username || customer?.email || `User ${String(order.userId).slice(-6)}`;
  };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      if (paymentFilter !== 'all' && paymentStatusOf(order) !== paymentFilter) return false;
      if (!term) return true;
      const customer = customers[order.userId];
      return [
        orderNumber(order._id),
        String(order._id),
        customer?.username,
        customer?.email,
        order.payment?.receipt,
        order.payment?.phone,
      ].some((field) => field && String(field).toLowerCase().includes(term));
    });
  }, [orders, customers, searchTerm, paymentFilter]);

  const updateStatus = async (order, status) => {
    setSavingId(order._id);
    setError('');
    try {
      const { data } = await userRequest.put(`/orders/${order._id}`, { status });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? data : o)));
    } catch (err) {
      console.error('Failed to update order', err);
      setError(`Could not update ${orderNumber(order._id)}.`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Orders Management</h2>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search order, customer, receipt or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex flex-wrap gap-2">
              {PAYMENT_FILTERS.map((filter) => (
                <Button
                  key={filter.id}
                  variant={paymentFilter === filter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentFilter(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700 dark:text-gray-300">Order</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Date</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Total</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Payment</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-gray-500 dark:text-gray-400">Loading orders…</TableCell>
                </TableRow>
              )}
              {!loading && filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-gray-500 dark:text-gray-400">No orders match.</TableCell>
                </TableRow>
              )}
              {filteredOrders.map((order) => {
                const paymentStatus = paymentStatusOf(order);
                const isOpen = expanded === order._id;
                return (
                  <Fragment key={order._id}>
                    <TableRow>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{orderNumber(order._id)}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {new Date(order.createdAt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{customerName(order)}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{formatKsh(order.amount)}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentColor(paymentStatus)}>{paymentStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        {/* Shipping something unpaid is the mistake this guards against. */}
                        <select
                          value={order.status}
                          disabled={paymentStatus !== 'paid' || savingId === order._id}
                          onChange={(e) => updateStatus(order, e.target.value)}
                          title={paymentStatus !== 'paid' ? 'Only paid orders can be fulfilled' : undefined}
                          className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold disabled:opacity-60 ${getStatusColor(order.status)}`}
                        >
                          {FULFILMENT_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setExpanded(isOpen ? null : order._id)}>
                          {isOpen ? 'Hide Details' : 'View Details'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50 dark:bg-gray-900">
                          <div className="grid gap-6 py-2 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-2">
                            <div>
                              <p className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Items</p>
                              <ul className="space-y-1">
                                {order.products.map((line, index) => (
                                  <li key={`${line.productId}-${index}`}>
                                    {line.quantity} × {line.title || line.productId}
                                    {line.size && ` · size ${line.size}`}
                                    {line.color && (
                                      <span
                                        className="ml-1.5 inline-block h-3 w-3 rounded-full border border-gray-300 align-middle"
                                        style={{ backgroundColor: line.color }}
                                        title={line.color}
                                      />
                                    )}
                                    {line.unitPrice !== undefined && ` · ${formatKsh(line.unitPrice)} each`}
                                  </li>
                                ))}
                              </ul>
                              {order.subtotal !== undefined && (
                                <p className="mt-2">
                                  Subtotal {formatKsh(order.subtotal)} + delivery {formatKsh(order.deliveryFee)}
                                </p>
                              )}
                              <p className="mt-3 font-semibold text-gray-900 dark:text-gray-100">Deliver to</p>
                              <p>{order.address?.details || JSON.stringify(order.address)}</p>
                            </div>
                            <div>
                              <p className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Payment</p>
                              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                                <dt>Method</dt><dd>{order.payment?.method || 'mpesa'}</dd>
                                <dt>Receipt</dt><dd>{order.payment?.receipt || '—'}</dd>
                                <dt>Phone</dt><dd>{order.payment?.paidPhone || order.payment?.phone || '—'}</dd>
                                <dt>Amount paid</dt>
                                <dd>{order.payment?.paidAmount !== undefined ? formatKsh(order.payment.paidAmount) : '—'}</dd>
                                <dt>Paid at</dt>
                                <dd>{order.payment?.paidAt ? new Date(order.payment.paidAt).toLocaleString('en-KE') : '—'}</dd>
                                <dt>M-PESA says</dt><dd>{order.payment?.resultDesc || '—'}</dd>
                              </dl>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
