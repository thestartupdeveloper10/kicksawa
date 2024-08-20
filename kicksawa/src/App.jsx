import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import Home from './component/pages/Home'
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

function App() {
  return (
    <ThemeProvider>
    <>

      <Router>
        <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/login' element={<LoginPage/>}></Route>
          <Route path='/signup' element={<SignUpPage/>}></Route>
          <Route path='/cart' element={<CartPage/>}></Route>
          <Route path='/favorites' element={<FavoritesPage/>}></Route>
          <Route path='/products' element={<ProductsPage/>}></Route>
          <Route path='/products/:id' element={<SingleProductPage/>}></Route>
          <Route path='/my-account' element={<UserProfilePage/>}></Route>
          <Route path='/contact-us' element={<ContactPage/>}></Route>
          <Route path='/brands' element={<BrandsPage/>}></Route>
          <Route path="/brand-products" element={<BrandProductsPage />} />
        </Routes>
      </Router>
    </>
    </ThemeProvider>
  )
}

export default App
