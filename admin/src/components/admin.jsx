import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FormMessage, Input } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { FULFILMENT, PAYMENT, paymentStatusOf } from '@/lib/format';

/*
 * Admin layout pieces, built from the storefront's primitives so the panel
 * speaks the same visual language: uppercase display headings, eyebrow
 * labels, hairlines instead of boxes, pills for actions.
 */

export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      {eyebrow && (
        <p className="mb-2 text-eyebrow font-bold uppercase text-muted-foreground">{eyebrow}</p>
      )}
      <h1 className="font-display text-display-md font-black uppercase font-expanded">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

/** A titled section with a hairline frame. */
export const Panel = ({ title, action, children, className, bodyClassName }) => (
  <section className={cn('rounded-lg border border-line bg-background', className)}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        {title && <h2 className="text-[0.9375rem] font-bold uppercase font-wide">{title}</h2>}
        {action}
      </div>
    )}
    <div className={cn('p-5', bodyClassName)}>{children}</div>
  </section>
);

/** One number worth watching. Links through when there is something to act on. */
export const StatTile = ({ label, value, hint, to, tone }) => {
  const body = (
    <>
      <p className="text-eyebrow font-bold uppercase text-muted-foreground">{label}</p>
      <p
        className={cn(
          'tnum mt-3 font-display text-display-sm font-black font-wide',
          tone === 'alert' && 'text-brand'
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>}
    </>
  );
  const frame = 'block rounded-lg border border-line bg-background p-5';
  return to ? (
    <Link
      to={to}
      className={cn(frame, 'transition-[border-color] duration-fast ease-swift hover:border-foreground')}
    >
      {body}
    </Link>
  ) : (
    <div className={frame}>{body}</div>
  );
};

export const EmptyState = ({ title, body, action }) => (
  <div className="rounded-lg bg-surface px-6 py-12 text-center">
    <p className="font-bold uppercase font-wide">{title}</p>
    {body && <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const ErrorNote = ({ children }) => <FormMessage className="mb-6">{children}</FormMessage>;

/** Single-choice filter row, with optional counts. */
export const FilterChips = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2" role="group">
    {options.map((option) => {
      const active = option.id === value;
      return (
        <Button
          key={option.id}
          type="button"
          size="sm"
          variant={active ? 'solid' : 'outline'}
          aria-pressed={active}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {typeof option.count === 'number' && (
            <span className={cn('tnum text-xs', active ? 'opacity-70' : 'text-muted-foreground')}>
              {option.count}
            </span>
          )}
        </Button>
      );
    })}
  </div>
);

export const SearchInput = ({ value, onChange, placeholder, className }) => (
  <div className={cn('relative w-full max-w-sm', className)}>
    <Search
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      strokeWidth={2}
    />
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-10 pl-10"
    />
  </div>
);

/* Tables: eyebrow headers, hairline rows, tabular numbers. Scrolls sideways
   inside its frame on narrow screens rather than squeezing columns. `relative`
   keeps screen-reader-only header text (absolutely positioned) inside the
   scroller; without it that text widened the whole page on phones. */
export const Table = ({ children, className }) => (
  <div className={cn('relative -mx-5 overflow-x-auto px-5', className)}>
    <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
  </div>
);
export const Th = ({ children, className }) => (
  <th className={cn('border-b border-line pb-3 pr-4 text-eyebrow font-bold uppercase text-muted-foreground', className)}>
    {children}
  </th>
);
export const Td = ({ children, className, ...props }) => (
  <td className={cn('border-b border-line py-3.5 pr-4 align-middle', className)} {...props}>
    {children}
  </td>
);

export const LoadingRows = ({ rows = 5 }) => (
  <div className="space-y-3" aria-label="Loading">
    {Array.from({ length: rows }, (_, i) => (
      <Skeleton key={i} className="h-10 rounded-md" />
    ))}
  </div>
);

export const PaymentBadge = ({ order }) => {
  const status = paymentStatusOf(order);
  const meta = PAYMENT[status] ?? { label: status, variant: 'neutral' };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
};

export const FulfilmentBadge = ({ status = 'pending' }) => {
  const meta = FULFILMENT[status] ?? { label: status, variant: 'neutral' };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
};

/** "Are you sure?" with room for extra fields (e.g. a note). */
export const ConfirmDialog = ({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  tone = 'solid',
  onConfirm,
  busy,
  error,
  children,
}) => (
  <Dialog open={open} onClose={busy ? undefined : onClose} title={title} description={description}>
    {children}
    {error && <FormMessage className="mt-4">{error}</FormMessage>}
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
        Cancel
      </Button>
      <Button variant={tone} size="sm" onClick={onConfirm} disabled={busy}>
        {busy ? 'Working…' : confirmLabel}
      </Button>
    </div>
  </Dialog>
);
