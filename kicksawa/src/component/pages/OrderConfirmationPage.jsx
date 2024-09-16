import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmationPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`${theme === 'dark' ? 'bg-[#041922] text-white' : 'bg-white text-black'} min-h-screen`}>
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className={`max-w-md mx-auto ${theme === 'dark' ? 'bg-[#130d14]' : 'bg-gray-100'} p-8 rounded-lg shadow-lg`}>
          <div className="text-center">
            <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              to="/products"
              className={`block w-full text-center py-2 px-4 rounded ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition-colors`}
            >
              Continue Shopping
            </Link>
            <Link
              to="/my-account"
              className={`block w-full text-center py-2 px-4 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              } transition-colors`}
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;