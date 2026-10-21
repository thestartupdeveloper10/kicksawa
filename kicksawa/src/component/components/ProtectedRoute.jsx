import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/userRedux';

// The token carries its own expiry and there is no refresh endpoint, so an
// expired one is worth nothing. Anything unreadable counts as signed out.
const isTokenValid = (token) => {
  if (!token) {
    return false;
  }
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const { exp } = JSON.parse(atob(padded));
    return typeof exp === 'number' && exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.currentUser?.token);
  const expired = Boolean(token) && !isTokenValid(token);

  // Drop the dead session so the rest of the UI stops showing them as signed in.
  useEffect(() => {
    if (expired) {
      dispatch(logout());
    }
  }, [expired, dispatch]);

  if (!isTokenValid(token)) {
    return <Navigate to="/login" state={{ from: location, expired }} replace />;
  }

  return children;
};

export default ProtectedRoute;
