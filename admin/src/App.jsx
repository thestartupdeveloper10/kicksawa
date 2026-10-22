import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdminSession } from './redux/userRedux';
import Layout from './component/pages/Layout';
import Dashboard from './component/pages/Dashboard';
import Users from './component/pages/Users';
import Products from './component/pages/Products';
import Orders from './component/pages/Orders';
import UserDetail from './component/pages/UserDetail';
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
    <Router>
      <Layout>
        <Routes>
        <Route path="/login" element={<AdminLogin/>} />
          <Route path="/" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
          <Route path="/users" element={<RequireAdmin><Users /></RequireAdmin>} />
          <Route path="/users/:id" element={<RequireAdmin><UserDetail /></RequireAdmin>} />
          <Route path="/products" element={<RequireAdmin><Products /></RequireAdmin>} />
          <Route path="/products/:id" element={<RequireAdmin><ProductDetail /></RequireAdmin>} />
          <Route path="/products/add" element={<RequireAdmin><AddEditProduct /></RequireAdmin>} />
          <Route path="/products/edit/:id" element={<RequireAdmin><AddEditProduct /></RequireAdmin>} />
          <Route path="/orders" element={<RequireAdmin><Orders /></RequireAdmin>} />
          <Route path="/profile" element={<RequireAdmin><Profile /></RequireAdmin>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;