import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { userRequest, apiError } from '../../services/requestMethods';
import {
  EmptyState, ErrorNote, FilterChips, LoadingRows, PageHeader, Panel, SearchInput, Table, Td, Th,
} from '@/components/admin';
import { Badge } from '@/components/ui/badge';
import { imageSrc } from '@/lib/image';
import { formatDate, formatKsh, realPhone, spendByUser } from '@/lib/format';

const VIEWS = [
  { id: 'all', label: 'All' },
  { id: 'buyers', label: 'Have ordered' },
  { id: 'admins', label: 'Admins' },
];

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('all');

  useEffect(() => {
    let cancelled = false;
    Promise.all([userRequest.get('/users'), userRequest.get('/orders')])
      .then(([u, o]) => {
        if (cancelled) return;
        setUsers([...u.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setOrders(o.data);
      })
      .catch((err) => !cancelled && setError(apiError(err, 'Could not load customers.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const spend = useMemo(() => spendByUser(orders), [orders]);

  const counts = {
    all: users.length,
    buyers: users.filter((u) => spend.get(u.id)?.orders > 0).length,
    admins: users.filter((u) => u.isAdmin).length,
  };

  const visible = users.filter((u) => {
    if (view === 'buyers' && !(spend.get(u.id)?.orders > 0)) return false;
    if (view === 'admins' && !u.isAdmin) return false;
    const term = search.trim().toLowerCase();
    return !term || [u.username, u.email, realPhone(u.phone)].some((f) => f?.toLowerCase().includes(term));
  });

  return (
    <>
      <PageHeader eyebrow="People" title="Customers" description="Everyone with an account. Spend counts paid orders only." />

      {error && <ErrorNote>{error}</ErrorNote>}

      <Panel>
        <div className="mb-5 flex flex-col gap-4">
          <FilterChips
            options={VIEWS.map((v) => ({ ...v, count: counts[v.id] }))}
            value={view}
            onChange={setView}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or phone" />
        </div>

        {loading ? (
          <LoadingRows />
        ) : visible.length === 0 ? (
          <EmptyState title="No one here" body={search ? 'Nothing matches that search.' : undefined} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>Joined</Th>
                <Th className="text-right">Orders</Th>
                <Th className="text-right">Spent</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => {
                const s = spend.get(u.id);
                return (
                  <tr key={u.id}>
                    <Td>
                      <Link to={`/customers/${u.id}`} className="flex items-center gap-3 hover:opacity-80">
                        <img src={imageSrc(u.profilePicture)} alt="" className="h-9 w-9 shrink-0 rounded-full bg-surface object-cover" loading="lazy" />
                        <span className="font-semibold">{u.username}</span>
                        {u.isAdmin && <Badge variant="solid">Admin</Badge>}
                      </Link>
                    </Td>
                    <Td>
                      <span className="block">{u.email}</span>
                      {realPhone(u.phone) && <span className="tnum block text-xs text-muted-foreground">{u.phone}</span>}
                    </Td>
                    <Td className="whitespace-nowrap text-muted-foreground">{formatDate(u.createdAt)}</Td>
                    <Td className="tnum text-right">{s?.orders ?? 0}</Td>
                    <Td className="tnum text-right font-semibold">{formatKsh(s?.spent ?? 0)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Panel>
    </>
  );
};

export default Customers;
