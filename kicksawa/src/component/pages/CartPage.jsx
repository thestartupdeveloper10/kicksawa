import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext';
import { updateProductQuantity, removeProduct } from '../../redux/cartRedux';

const CartItem = ({ item, onUpdateQuantity, onRemove, theme }) => (
  <div className={`flex items-center py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
    <Link to={`/product/${item._id}`}>
    <img src={item.img[0]} alt={item.title} className="w-20 h-20 object-cover mr-4" />
    </Link>
    <div className="flex-grow">
      <h3 className="font-semibold">{item.title}</h3>
      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Brand: {item.brand}</p>
      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Price: Ksh: {item.price.toFixed(2)}</p>
      <div className="flex items-center mt-2">
        <span className={`mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Color:</span>
        <div 
          className="w-6 h-6 rounded-full border border-gray-300" 
          style={{ backgroundColor: item.selectedColor }}
          title={item.selectedColor}
        ></div>
      </div>
      {item.selectedSize && (
        <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Size: {item.selectedSize}</p>
      )}
    </div>
    <div className="flex items-center">
      <button onClick={() => onUpdateQuantity(item._id, item.quantity - 1)} className={`p-1 ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-200'} rounded`}>
        <Minus size={16} />
      </button>
      <span className="mx-2">{item.quantity}</span>
      <button onClick={() => onUpdateQuantity(item._id, item.quantity + 1)} className={`p-1 ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-200'} rounded`}>
        <Plus size={16} />
      </button>
    </div>
    <button onClick={() => onRemove(item._id)} className="ml-4 text-red-500 hover:text-red-600">
      <Trash2 size={20} />
    </button>
  </div>
);

const CartPage = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.user.currentUser);
  const cart = useSelector(state => state.cart);

  console.log('CartPage - Cart state:', cart);

  const userId = user ? user._id : 'undefined';
  const userCart = cart.carts[userId] || { products: {}, quantity: 0, total: 0 };
  const cartItems = Object.values(userCart.products);

  console.log('CartPage - User cart:', userCart);
  console.log('CartPage - Cart items:', cartItems);

  const updateQuantity = (id, newQuantity) => {
    console.log('Updating quantity:', { id, newQuantity });
    if (newQuantity > 0) {
      dispatch(updateProductQuantity({ userId, productId: id, quantity: newQuantity }));
    }
  };

  const removeItem = (id) => {
    console.log('Removing item:', id);
    dispatch(removeProduct({ userId, productId: id }));
  };

  const subtotal = userCart.total;
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;

  console.log('CartPage - Subtotal:', subtotal);
  console.log('CartPage - Tax:', tax);
  console.log('CartPage - Total:', total);

  const handleCheckout = () => {
    console.log('Proceeding to checkout');
    // Implement checkout logic here
    // navigate('/checkout');
  };

  return (
    <div className={`${theme === 'dark' ? ' text-white' : 'bg-white text-black'} min-h-screen`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="mb-4">Your cart is empty.</p>
            <Link to="/products" className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-2 px-4 rounded transition-colors`}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              {cartItems.map(item => (
                <CartItem
                  key={item._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  theme={theme}
                />
              ))}
            </div>
            <div className="md:w-1/3">
              <div className={`${theme === 'dark' ? 'bg-[#130d14]' : 'bg-gray-100'} p-6 rounded-lg`}>
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t border-gray-300">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className={`w-full ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-3 mt-6 rounded transition-colors`}
                >
                  Proceed to Checkout
                </button>
                <Link to="/products" className={`w-full border ${theme === 'dark' ? 'border-white text-white hover:bg-gray-800' : 'border-black text-black hover:bg-gray-100'} py-3 mt-4 rounded transition-colors text-center block`}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;