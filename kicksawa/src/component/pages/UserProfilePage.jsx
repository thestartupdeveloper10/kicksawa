import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Mail, MapPin, Phone, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { updateUser } from '../../redux/userRedux';
import { storage } from '../../service/firebase';
import { userRequest } from '../../service/requestMethods';
import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Field, FormMessage, Input } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/products';
import { cn } from '@/lib/utils';

const FIELDS = [
  { key: 'name', label: 'Name', icon: User, type: 'text', autoComplete: 'name' },
  { key: 'email', label: 'Email', icon: Mail, type: 'email', autoComplete: 'email' },
  { key: 'phone', label: 'Phone', icon: Phone, type: 'tel', autoComplete: 'tel' },
  { key: 'location', label: 'Location', icon: MapPin, type: 'text', autoComplete: 'address-level2' },
];

/** Order status drives a token-based badge instead of hardcoded pastel pairs,
 *  which were unreadable in dark mode. */
const STATUS_VARIANT = {
  pending: 'outline',
  processing: 'outline',
  shipped: 'solid',
  delivered: 'success',
  cancelled: 'brand',
};

/** Until it is paid, an order's payment is its status; after that, shipping is. */
const PAYMENT_LABEL = {
  awaiting: { label: 'awaiting payment', variant: 'outline' },
  review: { label: 'payment under review', variant: 'brand' },
  refunded: { label: 'refunded', variant: 'neutral' },
};

const OrderRow = ({ order }) => {
  const status = String(order.status || 'pending').toLowerCase();
  const payment = PAYMENT_LABEL[order.payment?.status];
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line py-4">
      <div className="min-w-0">
        <p className="tnum truncate text-[0.9375rem] font-semibold">
          #{String(order._id).slice(-8).toUpperCase()}
        </p>
        <p className="tnum mt-0.5 text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString('en-KE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
      <div className="flex items-center gap-5">
        {payment ? (
          <Badge variant={payment.variant}>{payment.label}</Badge>
        ) : (
          <Badge variant={STATUS_VARIANT[status] ?? 'neutral'}>{status}</Badge>
        )}
        <span className="tnum text-[0.9375rem] font-semibold">{formatPrice(order.amount)}</span>
      </div>
    </li>
  );
};

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [user, setUser] = useState(currentUser);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  // Kept separate from `error`: a failed fetch must not be reported as
  // "no orders yet", which tells the reader something untrue about their account.
  const [ordersError, setOrdersError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await userRequest.get(`orders/find/${currentUser.id}`);
        // A failed payment never became an order the customer has; showing
        // it would read as something they bought.
        const placed = (Array.isArray(data) ? data : []).filter(
          (order) => order.payment?.status !== 'failed'
        );
        if (!cancelled) setOrders(placed);
      } catch (err) {
        console.error('Failed to load orders', err);
        if (!cancelled) setOrdersError('We could not load your orders right now.');
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentUser.id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await userRequest.put(`/users/${currentUser.id}`, {
        username: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        profilePicture: user.profilePic,
      });
      // Keep the token and the field names the rest of the app reads.
      const saved = {
        ...currentUser,
        name: data.username,
        email: data.email,
        phone: data.phone,
        location: data.location,
        profilePic: data.profilePicture,
      };
      dispatch(updateUser(saved));
      setUser(saved);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      setError('We could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const fileRef = ref(storage, `avatars/${currentUser.id}-${Date.now()}-${file.name}`);
      // Long cache metadata, so the browser keeps the avatar between visits.
      await uploadBytes(fileRef, file, { cacheControl: 'public, max-age=31536000, immutable', contentType: file.type });
      const imageUrl = await getDownloadURL(fileRef);
      setUser((prev) => ({ ...prev, profilePic: imageUrl }));
    } catch (err) {
      console.error('Avatar upload failed', err);
      setError('We could not upload that image.');
    } finally {
      setUploading(false);
    }
  };

  const cancelEdit = () => {
    setUser(currentUser);
    setEditing(false);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main" className="flex-1">
        <Section padding="md">
          <Container width="default">
            <SectionHeader as="h1" eyebrow="Account" title="My Account" />

            {error && (
              <FormMessage className="mb-8">{error}</FormMessage>
            )}

            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Profile */}
              <div className="lg:col-span-5">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt=""
                        className="h-24 w-24 rounded-full object-cover img-outline"
                      />
                    ) : (
                      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-surface">
                        <User className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                      </span>
                    )}

                    {editing && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        aria-label="Change profile photo"
                        className={cn(
                          'absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full',
                          'bg-foreground text-background ring-4 ring-background',
                          'transition-transform duration-fast ease-swift active:scale-[0.96]',
                          'disabled:opacity-60'
                        )}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                        ) : (
                          <Camera className="h-4 w-4" strokeWidth={2} />
                        )}
                      </button>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-display text-display-sm font-extrabold uppercase capitalize font-wide">
                      {user.name || 'Your Profile'}
                    </h2>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="mt-9 space-y-5">
                  {FIELDS.map(({ key, label, icon: Icon, type, autoComplete }) =>
                    editing ? (
                      <Field key={key} label={label}>
                        {({ id, describedBy }) => (
                          <Input
                            id={id}
                            describedBy={describedBy}
                            type={type}
                            autoComplete={autoComplete}
                            value={user[key] || ''}
                            onChange={(e) =>
                              setUser((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                          />
                        )}
                      </Field>
                    ) : (
                      <div key={key} className="flex items-start gap-3 border-b border-line pb-4">
                        <Icon
                          className="h-[18px] w-[18px] shrink-0 translate-y-1 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                        <div className="min-w-0">
                          <p className="text-micro uppercase text-muted-foreground">{label}</p>
                          <p className="truncate text-[0.9375rem]">
                            {user[key] || <span className="text-subtle-foreground">Not provided</span>}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-8 flex gap-3">
                  {editing ? (
                    <>
                      <Button onClick={handleSave} disabled={saving || uploading}>
                        {saving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
                        {saving ? 'Saving…' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      Edit Details
                    </Button>
                  )}
                </div>
              </div>

              {/* Orders */}
              <div className="lg:col-span-7">
                <h2 className="mb-5 font-display text-display-sm font-extrabold uppercase font-wide">
                  Order History
                </h2>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : ordersError ? (
                  <div className="border-t border-line py-14 text-center">
                    <p className="font-semibold">Orders unavailable</p>
                    <p className="mt-1 text-sm text-muted-foreground">{ordersError}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="border-t border-line py-14 text-center">
                    <p className="font-semibold">No orders yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your orders will appear here once you check out.
                    </p>
                  </div>
                ) : (
                  <ul className="border-t border-line">
                    {orders.map((order) => (
                      <OrderRow key={order._id} order={order} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
