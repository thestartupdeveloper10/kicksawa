/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useState, useCallback } from 'react';
import { Trash2, Plus, Minus, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext';
import { updateProductQuantity, removeProduct, clearCart } from '../../redux/cartRedux';
import PaymentForm from '../components/PaymentForm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CartItem = React.memo(({ item, onUpdateQuantity, onRemove, theme, isUpdating }) => (
  <div className={`flex items-center py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
    <Link to={`/product/${item._id}`}>
      <img src={item.img[0]} alt={item.title} className="w-20 h-20 object-cover mr-4" />
    </Link>
    <div className="flex-grow pl-3 md:pl-0">
      <h3 className="font-semibold text-sm md:text-balance">{item.title}</h3>
      <p className={theme === 'dark' ? 'text-gray-400 text-sm md:text-balance' : 'text-gray-600 text-sm md:text-balance'}>Brand: {item.brand}</p>
      <p className={theme === 'dark' ? 'text-gray-400 text-sm md:text-balance' : 'text-gray-600 text-sm md:text-balance'}>Price: Ksh: {item.price.toFixed(2)}</p>
      <div className="flex items-center mt-2">
        <span className={`mr-2 ${theme === 'dark' ? 'text-gray-400 text-sm md:text-balance' : 'text-gray-600 text-sm md:text-balance'}`}>Color:</span>
        <div 
          className="w-6 h-6 rounded-full border border-gray-300" 
          style={{ backgroundColor: item.selectedColor }}
          title={item.selectedColor}
        ></div>
      </div>
      {item.selectedSize && (
        <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400 text-sm md:text-balance' : 'text-gray-600 text-sm md:text-balance'}`}>Size: {item.selectedSize}</p>
      )}
    </div>
    <div className="flex items-center">
      <button 
        onClick={() => onUpdateQuantity(item._id, item.quantity - 1)} 
        className={`p-1 ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-200'} rounded`}
        disabled={isUpdating}
      >
        <Minus size={16} />
      </button>
      <span className="mx-2">{item.quantity}</span>
      <button 
        onClick={() => onUpdateQuantity(item._id, item.quantity + 1)} 
        className={`p-1 ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-200'} rounded`}
        disabled={isUpdating}
      >
        <Plus size={16} />
      </button>
    </div>
    <button 
      onClick={() => onRemove(item._id)} 
      className="ml-4 text-red-500 hover:text-red-600"
      disabled={isUpdating}
    >
      <Trash2 size={20} />
    </button>
  </div>
));

const Modal = ({ isOpen, onClose, children, theme }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className={`${theme === 'dark' ? 'bg-[#130d14] text-white' : 'bg-white text-black'} p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative`}>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

const CartPage = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.user.currentUser);
  const cart = useSelector(state => state.cart);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const userId = user ? user.id : 'undefined';
  const userCart = cart.carts[userId] || { products: {}, quantity: 0, total: 0 };
  const cartItems = Object.values(userCart.products);

  const updateQuantity = useCallback(async (id, newQuantity) => {
    if (newQuantity > 0) {
      setIsUpdating(true);
      setError(null);
      try {
        await dispatch(updateProductQuantity({ userId, productId: id, quantity: newQuantity }));
      } catch (err) {
        setError('Failed to update quantity. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    }
  }, [dispatch, userId]);

  const removeItem = useCallback(async (id) => {
    setIsUpdating(true);
    setError(null);
    try {
      await dispatch(removeProduct({ userId, productId: id }));
    } catch (err) {
      setError('Failed to remove item. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch, userId]);

  const handleClearCart = useCallback(async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await dispatch(clearCart({ userId }));
    } catch (err) {
      setError('Failed to clear cart. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch, userId]);

  const subtotal = userCart.total;
  const delivery = 200;
  const total = subtotal + delivery;

  const handleCheckout = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    dispatch(clearCart({ userId }));
    navigate('/order-confirmation');
  };

  return (
    <div className={`${theme === 'dark' ? ' text-white' : 'bg-white text-black'} min-h-screen`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        {error && (
          <Alert className="mb-4 bg-red-100 border-red-400">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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
                  isUpdating={isUpdating}
                />
              ))}
            </div>
            <div className="md:w-1/3">
              <div className={`${theme === 'dark' ? 'bg-[#130d14]' : 'bg-gray-100'} p-6 rounded-lg`}>
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>Ksh: {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery Fee</span>
                  <span>Ksh: {delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t border-gray-300">
                  <span>Total</span>
                  <span>Ksh: {total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className={`w-full ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-3 mt-6 rounded transition-colors`}
                  disabled={isUpdating}
                >
                  Proceed to Checkout
                </button>
                <Link to="/products" className={`w-full border ${theme === 'dark' ? 'border-white text-white hover:bg-gray-800' : 'border-black text-black hover:bg-gray-100'} py-3 mt-4 rounded transition-colors text-center block`}>
                  Continue Shopping
                </Link>
                <button 
                  onClick={handleClearCart}
                  className={`w-full ${theme === 'dark' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'} py-3 mt-4 rounded transition-colors`}
                  disabled={isUpdating}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} theme={theme}>
        <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
        <PaymentForm onSuccess={handlePaymentSuccess} cartTotal={total} />
      </Modal>
      <Footer />
    </div>
  );
};

export default CartPage;