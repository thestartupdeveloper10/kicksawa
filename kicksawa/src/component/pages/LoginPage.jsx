import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import AuthLayout from '../components/AuthLayout';
import GoogleAuth from '../components/GoogleAuth';
import { loginFailure, loginStart, loginSuccess } from '../../redux/userRedux';
import { publicRequest } from '../../service/requestMethods';
import { Button } from '@/components/ui/button';
import { Field, FormMessage, Input } from '@/components/ui/field';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = Boolean(location.state?.expired);
  // Come back to wherever the guard interrupted, rather than always home.
  const from = location.state?.from;
  const returnTo = from ? `${from.pathname}${from.search || ''}` : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const response = await publicRequest.post('/auth/login', { email, password });
      dispatch(loginSuccess(response.data));
      navigate(returnTo, { replace: true });
    } catch (err) {
      dispatch(loginFailure());
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <>
          New here?{' '}
          <Link
            to="/signup"
            state={{ from }}
            className="font-semibold text-foreground underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {sessionExpired && !error && (
          <FormMessage tone="info">Your session expired. Please sign in again.</FormMessage>
        )}
        {error && <FormMessage>{error}</FormMessage>}

        <Field label="Email">
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              describedBy={describedBy}
              type="email"
              autoComplete="email"
              required
              invalid={invalid}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          )}
        </Field>

        <Field label="Password">
          {({ id, invalid, describedBy }) => (
            <div className="relative">
              <Input
                id={id}
                describedBy={describedBy}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                invalid={invalid}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color] duration-fast ease-swift hover:bg-surface hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.75} />
                ) : (
                  <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />
                )}
              </button>
            </div>
          )}
        </Field>

        <Button type="submit" size="lg" block disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
          {isLoading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-micro uppercase text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleAuth returnTo={returnTo} />
    </AuthLayout>
  );
};

export default LoginPage;
