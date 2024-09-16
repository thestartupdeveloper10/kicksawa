import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';

function PaymentForm({ onSuccess, cartTotal }) {
  const { theme } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3000/api/checkout/initiate-payment', { 
        phoneNumber, 
        amount: cartTotal 
      });
      setMessage('Payment initiated. Please check your phone for the STK push.');
      console.log(response.data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-[#130d14] text-white' : 'bg-white text-black'} p-6 rounded-lg`}>
      <h2 className="text-2xl font-bold mb-6">Complete Your Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phoneNumber" className="block mb-1 font-medium">Phone Number:</label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g., 254712345678"
            required
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Amount to Pay:</label>
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            KES {cartTotal.toFixed(2)}
          </p>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-medium ${
            theme === 'dark' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Processing...' : 'Pay with M-PESA'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 p-3 rounded ${
          message.includes('error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default PaymentForm;