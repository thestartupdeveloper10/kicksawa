import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdminSession } from './redux/userRedux';
import Layout from './component/pages/Layout';
import Dashboard from './component/pages/Dashboard';
import Customers from './component/pages/Customers';
import CustomerDetail from './component/pages/CustomerDetail';
import Products from './component/pages/Products';
import Orders from './component/pages/Orders';
import Messages from './component/pages/Messages';
import ProductDetail from './component/pages/ProductDetail';
import Profile from './component/pages/Profile';
import AddEditProduct from './component/pages/AddEditProduct';
import AdminLogin from './component/pages/AdminLogin';

// Every page but the login needs an unexpired admin session. The API checks
// this too; the guard just stops the panel rendering for anyone else.
const RequireAdmin = ({ children }) => {
  const user = useSelector((state) => state.user.currentUser);
  return isAdminSession(user) ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    // Opt into React Router 7's behaviour now; both are safe for these routes
    // and it silences the upgrade warnings.
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route element={<RequireAdmin><Layout /></RequireAdmin>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<AddEditProduct />} />
          <Route path="/products/edit/:id" element={<AddEditProduct />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          {/* Old links */}
          <Route path="/users" element={<Navigate to="/customers" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
