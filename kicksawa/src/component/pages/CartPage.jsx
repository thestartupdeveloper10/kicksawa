import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <div className="flex items-center py-4 border-b">
    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover mr-4" />
    <div className="flex-grow">
      <h3 className="font-semibold">{item.name}</h3>
      <p className="text-gray-600">Size: {item.size}</p>
      <p className="text-gray-600">Price: ${item.price.toFixed(2)}</p>
    </div>
    <div className="flex items-center">
      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1">
        <Minus size={16} />
      </button>
      <span className="mx-2">{item.quantity}</span>
      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1">
        <Plus size={16} />
      </button>
    </div>
    <button onClick={() => onRemove(item.id)} className="ml-4 text-red-500">
      <Trash2 size={20} />
    </button>
  </div>
);

const CartPage = () => {
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
              />
            ))}
          </div>
          <div className="md:w-1/3">
            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button className="w-full bg-black text-white py-3 mt-6 rounded hover:bg-gray-800">
                Proceed to Checkout
              </button>
              <button className="w-full border border-black text-black py-3 mt-4 rounded hover:bg-gray-100">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;