import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './component/pages/Home';
import LoginPage from './component/pages/LoginPage';
import SignUpPage from './component/pages/SignUpPage';
import CartPage from './component/pages/CartPage';
import FavoritesPage from './component/pages/FavoritesPage';
import ProductsPage from './component/pages/ProductsPage';
import SingleProductPage from './component/pages/SingleProductPage';
import UserProfilePage from './component/pages/UserProfilePage';
import ContactPage from './component/pages/ContactPage';
import BrandsPage from './component/pages/BrandsPage';
import BrandProductsPage from './component/pages/BrandProductsPage';
import { ThemeProvider } from './component/components/ThemeContext';
import SearchResults from './component/pages/SearchResults';
import OrderConfirmationPage from './component/pages/OrderConfirmationPage';
import ProtectedRoute from './component/components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/products' element={<ProductsPage />} />
          <Route path='/product/:id' element={<SingleProductPage />} />
          <Route path='/contact-us' element={<ContactPage />} />
          <Route path='/brands' element={<BrandsPage />} />
          <Route path="/products/:brand" element={<BrandProductsPage />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Protected Routes */}
          <Route path='/cart' element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path='/favorites' element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path='/my-account' element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;