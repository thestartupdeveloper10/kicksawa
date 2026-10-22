import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';

import { userRequest, apiError } from '../../services/requestMethods';
import { EmptyState, ErrorNote, FilterChips, LoadingRows, PageHeader, Panel, SearchInput } from '@/components/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createdAtOf, formatDateTime } from '@/lib/format';

const VIEWS = [
  { id: 'open', label: 'To answer', test: (m) => !m.handled },
  { id: 'handled', label: 'Handled', test: (m) => m.handled },
  { id: 'all', label: 'All', test: () => true },
];

const Messages = () => {
  const [params] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('open');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(params.get('open'));
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    userRequest
      .get('/contact')
      .then(({ data }) => !cancelled && setMessages(data))
      .catch((err) => !cancelled && setError(apiError(err, 'Could not load messages.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(
    () => Object.fromEntries(VIEWS.map((v) => [v.id, messages.filter(v.test).length])),
    [messages]
  );

  const visible = useMemo(() => {
    const test = VIEWS.find((v) => v.id === view).test;
    const term = search.trim().toLowerCase();
    return messages.filter(
      (m) => test(m) && (!term || [m.name, m.email, m.subject, m.message].some((f) => f?.toLowerCase().includes(term)))
    );
  }, [messages, view, search]);

  const setHandled = async (message, handled) => {
    setSavingId(message._id);
    setError('');
    try {
      const { data } = await userRequest.patch(`/contact/${message._id}`, { handled });
      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
    } catch (err) {
      setError(apiError(err, 'Could not update that message.'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Messages"
        description="Sent from the Contact page. Reply by email, then mark the message handled."
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      <Panel>
        <div className="mb-5 flex flex-col gap-4">
          <FilterChips options={VIEWS.map((v) => ({ ...v, count: counts[v.id] }))} value={view} onChange={setView} />
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or text" />
        </div>

        {loading ? (
          <LoadingRows />
        ) : visible.length === 0 ? (
          <EmptyState
            title={view === 'open' && !search ? 'Inbox zero' : 'No messages here'}
            body={view === 'open' && !search ? 'Every message has been handled.' : undefined}
          />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((m) => {
              const open = openId === m._id;
              return (
                <li key={m._id} className={cn(open && '-mx-5 bg-surface px-5')}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : m._id)}
                    className="flex w-full items-start gap-4 py-4 text-left"
                  >
                    <span
                      aria-hidden="true"
                      className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', m.handled ? 'bg-transparent' : 'bg-brand')}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className={cn('truncate', !m.handled && 'font-semibold')}>{m.subject}</span>
                        <span className="tnum shrink-0 text-xs text-muted-foreground">{formatDateTime(createdAtOf(m))}</span>
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {m.name} · {m.email}
                      </span>
                      {!open && <span className="mt-1 block truncate text-sm text-muted-foreground">{m.message}</span>}
                    </span>
                  </button>
                  {open && (
                    <div className="pb-5 pl-6">
                      <p className="whitespace-pre-line text-sm leading-relaxed">{m.message}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button asChild size="sm">
                          <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>
                            <Mail className="h-4 w-4" /> Reply by email
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={savingId === m._id}
                          onClick={() => setHandled(m, !m.handled)}
                        >
                          {m.handled ? 'Mark as not handled' : 'Mark handled'}
                        </Button>
                        {m.handled && <Badge variant="neutral">Handled</Badge>}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
};

export default Messages;
