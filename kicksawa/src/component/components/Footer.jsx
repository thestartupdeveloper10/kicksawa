import React from 'react';
import { Truck, ShieldCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext'; // Import the useTheme hook
import Footer_Nav from './Footer_Nav';

const Footer = () => {
  const { theme } = useTheme(); // Use the theme hook

  return (
    <footer className={`${theme === 'dark' ? 'bg-[#041922] text-white' : 'bg-[#f9f6ee] text-black'} pt-12 pb-4 transition-colors`}>
      <div className="container mx-auto px-4">
        {/* Top section with logo and features */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <h2 className="text-3xl font-bold italic mb-4 md:mb-0">Label Safi.</h2>
          <div className="flex flex-wrap justify-end space-x-4 md:space-x-8">
            <div className="flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              <span className="text-sm">ISLANDWIDE DELIVERY</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2" />
              <span className="text-sm">SECURE PAYMENTS</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              <span className="text-sm">TOP BRANDS</span>
            </div>
          </div>
        </div>
        <hr className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} mb-8`} />
        {/* Main footer content */}
        <div className="flex flex-wrap -mx-4">
          {/* Go To Section */}
          <div className="w-full md:w-1/4 px-4 mb-8">
            <h3 className="font-bold mb-4">GO TO</h3>
            <ul className="space-y-2">
              <Footer_Nav theme={theme}/>
            </ul>
          </div>
          {/* Information Section */}
          <div className="w-full md:w-1/4 px-4 mb-8">
            <h3 className="font-bold mb-4">INFORMATION</h3>
            <ul className="space-y-2">
              {['ABOUT US', 'FAQ PAGE', 'PRIVACY POLICY', 'TERMS & CONDITIONS', 'REFUND & RETURN POLICY'].map((item) => (
                <li key={item}>
                  <a href="#" className={`text-sm hover:underline ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Our Brands Section */}
          <div className="w-full md:w-1/4 px-4 mb-8">
            <h3 className="font-bold mb-4">OUR TOP BRANDS</h3>
            <ul className="space-y-2">
              {['Adidas', 'Puma', 'Nike', 'Under Armour', 'New Balance','Reebok'].map((item) => (
                <li key={item}>
                  <Link to={`/products/${item}`} className={`text-sm uppercase hover:underline ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Newsletter Section */}
          <div className="w-full md:w-1/4 px-4 mb-8">
            <h3 className="font-bold mb-4">Get E-mail updates about our latest shop and special offers.</h3>
            <form className="mt-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className={`w-full px-3 py-2 border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-black'} mb-2`}
              />
              <button type="submit" className={`w-full ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-2 transition-colors`}>
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
        {/* Bottom section with copyright */}
        <div className={`mt-8 pt-8 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
          <p className="text-sm text-center">© 2023 URBAN CULTURE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;