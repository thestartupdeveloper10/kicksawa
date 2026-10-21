import { useState } from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import app from '../../service/firebase';
import { loginFailure, loginStart, loginSuccess } from '../../redux/userRedux';
import { publicRequest } from '../../service/requestMethods';
import { FormMessage } from '@/components/ui/field';
import { cn } from '@/lib/utils';

/** Closing the popup is a deliberate cancel, not an error worth reporting. */
const CANCELLED = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
]);

function GoogleAuth({ label = 'Continue with Google' }) {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    setLoading(true);
    setError('');
    dispatch(loginStart());

    try {
      const result = await signInWithPopup(auth, provider);
      const res = await publicRequest.post('auth/google', {
        name: result.user.displayName,
        email: result.user.email,
        googlePhotoUrl: result.user.photoURL,
      });

      if (res.status === 200) {
        dispatch(loginSuccess(res.data));
        navigate('/');
        return;
      }
      throw new Error('Unexpected response from sign-in');
    } catch (err) {
      console.error(err);
      dispatch(loginFailure());
      // The previous version swallowed every failure into console.log, so a
      // failed sign-in looked identical to nothing happening.
      if (!CANCELLED.has(err?.code)) {
        setError('Google sign-in did not complete. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={cn(
          'flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-line-strong',
          'text-sm font-semibold',
          'transition-[background-color,border-color,transform] duration-fast ease-swift',
          'hover:border-foreground hover:bg-surface active:scale-[0.96]',
          'disabled:pointer-events-none disabled:opacity-60'
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt=""
            aria-hidden="true"
            className="h-[18px] w-[18px]"
          />
        )}
        {loading ? 'Opening Google…' : label}
      </button>

      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
}

export default GoogleAuth;
