import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../components/AuthLayout';
import GoogleAuth from '../components/GoogleAuth';
import { publicRequest } from '../../service/requestMethods';
import { Button } from '@/components/ui/button';
import { Field, FormMessage, Input } from '@/components/ui/field';

const MIN_PASSWORD = 8;

const SignUpPage = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const set = (key) => (event) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
    // Clear a field's error as soon as it is edited, rather than making the
    // reader hunt for what is still wrong after a failed submit.
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const validate = () => {
    const errors = {};
    if (values.name.trim().length < 2) errors.name = 'Tell us what to call you.';
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email address.';
    if (values.password.length < MIN_PASSWORD) {
      errors.password = `Use at least ${MIN_PASSWORD} characters.`;
    }
    if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      await publicRequest.post('/auth/register', {
        username: values.name,
        email: values.email,
        password: values.password,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'We could not create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join Us"
      subtitle="Create an account to save favourites and track orders."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-foreground underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <FormMessage>{error}</FormMessage>}

        <Field label="Name" error={fieldErrors.name}>
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              describedBy={describedBy}
              autoComplete="name"
              required
              invalid={invalid}
              value={values.name}
              onChange={set('name')}
              placeholder="Your name"
            />
          )}
        </Field>

        <Field label="Email" error={fieldErrors.email}>
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              describedBy={describedBy}
              type="email"
              required
              autoComplete="email"
              invalid={invalid}
              value={values.email}
              onChange={set('email')}
              placeholder="you@example.com"
            />
          )}
        </Field>

        <Field
          label="Password"
          error={fieldErrors.password}
          hint={`At least ${MIN_PASSWORD} characters.`}
        >
          {({ id, invalid, describedBy }) => (
            <div className="relative">
              <Input
                id={id}
                describedBy={describedBy}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                invalid={invalid}
                value={values.password}
                onChange={set('password')}
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

        <Field label="Confirm Password" error={fieldErrors.confirmPassword}>
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              describedBy={describedBy}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              invalid={invalid}
              value={values.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="••••••••"
            />
          )}
        </Field>

        <Button type="submit" size="lg" block disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
          {isLoading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-micro uppercase text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleAuth label="Sign up with Google" />
    </AuthLayout>
  );
};

export default SignUpPage;
