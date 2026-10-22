import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { login } from '../../redux/apiCalls';
import { isAdminSession } from '../../redux/userRedux';
import { Button } from '@/components/ui/button';
import { Field, FormMessage, Input } from '@/components/ui/field';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isFetching, error, currentUser } = useSelector((state) => state.user);

  if (isAdminSession(currentUser)) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await login(dispatch, { email, password })) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-display-md font-black uppercase leading-none tracking-tightest font-expanded">
            Kicksawa
          </p>
          <p className="mt-3 text-eyebrow font-bold uppercase text-muted-foreground">Admin sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-line bg-background p-6" noValidate>
          {error && <FormMessage>{error}</FormMessage>}

          <Field label="Email">
            {({ id, describedBy }) => (
              <Input
                id={id}
                describedBy={describedBy}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}
          </Field>

          <Field label="Password">
            {({ id, describedBy }) => (
              <div className="relative">
                <Input
                  id={id}
                  describedBy={describedBy}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}
          </Field>

          <Button type="submit" block disabled={isFetching}>
            {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
            {isFetching ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Customer accounts can&apos;t sign in here.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
