import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext'; // Import the useTheme hook

const CartItem = ({ item, onUpdateQuantity, onRemove, theme }) => (
  <div className={`flex items-center py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover mr-4" />
    <div className="flex-grow">
      <h3 className="font-semibold">{item.name}</h3>
      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Size: {item.size}</p>
      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Price: ${item.price.toFixed(2)}</p>
    </div>
    <div className="flex items-center">
      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className={`p-1 ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-200'} rounded`}>
        <Minus size={16} />
      </button>
      <span className="mx-2">{item.quantity}</span>
      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className={`p-1 ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-200'} rounded`}>
        <Plus size={16} />
      </button>
    </div>
    <button onClick={() => onRemove(item.id)} className="ml-4 text-red-500 hover:text-red-600">
      <Trash2 size={20} />
    </button>
  </div>
);

const CartPage = () => {
  const { theme } = useTheme(); // Use the theme hook
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Nike Air Force 1", size: "US 10", price: 110, quantity: 1, image: "/path-to-image.jpg" },
    { id: 2, name: "Adidas Ultraboost", size: "US 9", price: 180, quantity: 2, image: "/path-to-image.jpg" },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity > 0) {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  theme={theme}
                />
              ))}
            </div>
            <div className="md:w-1/3">
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} p-6 rounded-lg`}>
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
                <button className={`w-full ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-3 mt-6 rounded transition-colors`}>
                  Proceed to Checkout
                </button>
                <button className={`w-full border ${theme === 'dark' ? 'border-white text-white hover:bg-gray-800' : 'border-black text-black hover:bg-gray-100'} py-3 mt-4 rounded transition-colors`}>
                  Continue Shopping
                </button>
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