import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Function to check if user is authenticated
  const isAuthenticated = () => {
    const persistRoot = localStorage.getItem("persist:root");
    if (persistRoot) {
      const { user } = JSON.parse(persistRoot);
      if (user) {
        const { currentUser } = JSON.parse(user);
        return !!currentUser?.token;
      }
    }
    return false;
  };

  if (!isAuthenticated()) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;