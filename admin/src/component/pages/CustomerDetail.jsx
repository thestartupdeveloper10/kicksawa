import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { userRequest, apiError } from '../../services/requestMethods';
import {
  ConfirmDialog, EmptyState, ErrorNote, FulfilmentBadge, LoadingRows, PageHeader, Panel, PaymentBadge, StatTile,
  Table, Td, Th,
} from '@/components/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createdAtOf, formatDate, formatKsh, orderNumber, paymentStatusOf, realPhone,
} from '@/lib/format';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([userRequest.get(`/users/find/${id}`), userRequest.get(`/orders/find/${id}`)])
      .then(([u, o]) => {
        if (cancelled) return;
        setUser(u.data);
        setOrders([...o.data].sort((a, b) => createdAtOf(b) - createdAtOf(a)));
      })
      .catch((err) => !cancelled && setError(apiError(err, 'Could not load this customer.')));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const paid = useMemo(() => orders.filter((o) => paymentStatusOf(o) === 'paid'), [orders]);
  const spent = paid.reduce((sum, o) => sum + o.amount, 0);

  const confirmDelete = async () => {
    setBusy(true);
    setDeleteError('');
    try {
      await userRequest.delete(`/users/${id}`);
      navigate('/customers', { replace: true });
    } catch (err) {
      setDeleteError(apiError(err, 'Could not delete this account.'));
      setBusy(false);
    }
  };

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!user) return <LoadingRows rows={6} />;

  return (
    <>
      <Link to="/customers" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Customers
      </Link>
      <PageHeader
        eyebrow={user.isAdmin ? 'Admin account' : 'Customer'}
        title={user.username}
        description={`Joined ${formatDate(user.createdAt)}`}
        actions={
          !user.isAdmin && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleting(true)}>
              Delete account
            </Button>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Paid orders" value={paid.length} hint={`${orders.length} placed in total`} />
        <StatTile label="Spent" value={formatKsh(spent)} />
        <StatTile label="Average order" value={paid.length ? formatKsh(Math.round(spent / paid.length)) : '—'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Panel title="Profile">
          <div className="mb-5 flex items-center gap-4">
            <img src={user.profilePicture} alt="" className="h-16 w-16 rounded-full bg-surface object-cover" />
            {user.isAdmin && <Badge variant="solid">Admin</Badge>}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="min-w-0 break-words">
              <a href={`mailto:${user.email}`} className="underline underline-offset-4">{user.email}</a>
            </dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="tnum">{realPhone(user.phone) || '—'}</dd>
            <dt className="text-muted-foreground">Location</dt>
            <dd>{user.location && user.location !== 'Not Provided' ? user.location : '—'}</dd>
          </dl>
        </Panel>

        <Panel title="Orders">
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Date</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Payment</Th>
                  <Th>Shipping</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <Td className="tnum font-semibold">
                      <Link to={`/orders?open=${order._id}`} className="hover:underline">{orderNumber(order._id)}</Link>
                    </Td>
                    <Td className="whitespace-nowrap text-muted-foreground">{formatDate(createdAtOf(order))}</Td>
                    <Td className="tnum text-right font-semibold">{formatKsh(order.amount)}</Td>
                    <Td><PaymentBadge order={order} /></Td>
                    <Td><FulfilmentBadge status={order.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>
      </div>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title="Delete account?"
        description={`${user.username} won't be able to sign in, and their saved details are removed. Their ${orders.length} ${orders.length === 1 ? 'order stays' : 'orders stay'} in your records.`}
        confirmLabel="Delete account"
        tone="destructive"
        onConfirm={confirmDelete}
        busy={busy}
        error={deleteError}
      />
    </>
  );
};

export default CustomerDetail;
