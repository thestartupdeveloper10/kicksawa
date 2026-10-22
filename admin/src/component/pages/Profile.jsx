import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { userRequest, apiError } from '../../services/requestMethods';
import { updateUser } from '../../redux/userRedux';
import { ErrorNote, LoadingRows, PageHeader, Panel } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Field, FormMessage, Input } from '@/components/ui/field';
import { realPhone } from '@/lib/format';

const MIN_PASSWORD = 8;

const Profile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    userRequest
      .get(`/users/find/${currentUser.id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setForm({
          username: data.username || '',
          email: data.email || '',
          phone: realPhone(data.phone) || '',
          location: data.location && data.location !== 'Not Provided' ? data.location : '',
        });
      })
      .catch((err) => !cancelled && setLoadError(apiError(err, 'Could not load your profile.')));
    return () => {
      cancelled = true;
    };
  }, [currentUser.id]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMessage(null);
    try {
      const { data } = await userRequest.put(`/users/${currentUser.id}`, {
        username: form.username,
        email: form.email,
        phone: form.phone,
        location: form.location,
      });
      dispatch(updateUser({ name: data.username, email: data.email, phone: data.phone, location: data.location }));
      setProfileMessage({ tone: 'success', text: 'Profile saved.' });
    } catch (err) {
      setProfileMessage({ tone: 'error', text: apiError(err, 'Could not save your profile.') });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (passwords.next.length < MIN_PASSWORD) {
      setPasswordMessage({ tone: 'error', text: `Use at least ${MIN_PASSWORD} characters.` });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordMessage({ tone: 'error', text: 'The new passwords do not match.' });
      return;
    }
    setChanging(true);
    try {
      await userRequest.put(`/users/${currentUser.id}`, {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordMessage({ tone: 'success', text: 'Password changed.' });
    } catch (err) {
      setPasswordMessage({ tone: 'error', text: apiError(err, 'Could not change your password.') });
    } finally {
      setChanging(false);
    }
  };

  if (loadError) return <ErrorNote>{loadError}</ErrorNote>;
  if (!form) return <LoadingRows rows={6} />;

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" description="Your admin account. Admin rights are granted in the database, not here." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Details">
          <form onSubmit={saveProfile} className="space-y-5">
            {profileMessage && <FormMessage tone={profileMessage.tone}>{profileMessage.text}</FormMessage>}
            <Field label="Name">
              {({ id }) => <Input id={id} value={form.username} onChange={set('username')} required minLength={2} maxLength={50} autoComplete="name" />}
            </Field>
            <Field label="Email">
              {({ id }) => <Input id={id} type="email" value={form.email} onChange={set('email')} required autoComplete="email" />}
            </Field>
            <Field label="Phone">
              {({ id }) => <Input id={id} type="tel" value={form.phone} onChange={set('phone')} maxLength={30} autoComplete="tel" />}
            </Field>
            <Field label="Location">
              {({ id }) => <Input id={id} value={form.location} onChange={set('location')} maxLength={100} />}
            </Field>
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save details'}</Button>
          </form>
        </Panel>

        <Panel title="Password">
          <form onSubmit={changePassword} className="space-y-5">
            {passwordMessage && <FormMessage tone={passwordMessage.tone}>{passwordMessage.text}</FormMessage>}
            <Field label="Current password">
              {({ id }) => (
                <Input id={id} type="password" autoComplete="current-password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} required />
              )}
            </Field>
            <Field label="New password" hint={`At least ${MIN_PASSWORD} characters.`}>
              {({ id, describedBy }) => (
                <Input id={id} describedBy={describedBy} type="password" autoComplete="new-password" value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} required />
              )}
            </Field>
            <Field label="Confirm new password">
              {({ id }) => (
                <Input id={id} type="password" autoComplete="new-password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} required />
              )}
            </Field>
            <Button type="submit" size="sm" disabled={changing}>{changing ? 'Changing…' : 'Change password'}</Button>
          </form>
        </Panel>
      </div>
    </>
  );
};

export default Profile;
