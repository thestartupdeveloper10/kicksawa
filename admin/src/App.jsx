import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './component/pages/Layout';
import Dashboard from './component/pages/Dashboard';
import Users from './component/pages/Users';
import Products from './component/pages/Products';
import Orders from './component/pages/Orders';
import UserDetail from './component/pages/UserDetail';
import ProductDetail from './component/pages/ProductDetail';
import Profile from './component/pages/Profile';
import AddEditProduct from './component/pages/AddEditProduct';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/add" element={<AddEditProduct />} />
          <Route path="/products/edit/:id" element={<AddEditProduct />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;