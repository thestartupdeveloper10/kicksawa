import { Truck, ShieldCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-12 pb-4">
      <div className="container mx-auto px-4">
        {/* Top section with logo and features */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <h2 className="text-3xl font-bold italic mb-4 md:mb-0">Urban Cult.</h2>
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

        <hr className="border-gray-300 mb-8" />

        {/* Main footer content */}
        <div className="flex flex-wrap -mx-4">
          {/* Go To Section */}
          <div className="w-full md:w-1/4 px-4 mb-8">
            <h3 className="font-bold mb-4">GO TO</h3>
            <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm hover:underline">HOME</Link>
                  </li>
                  <li>
                  <Link to="/products" className="text-sm hover:underline">SHOP</Link>
                  </li>
                  <li>
                  <Link to="/brands" className="text-sm hover:underline">BRANDS</Link>
                  </li>
                  <li>
                  <Link to="/user" className="text-sm hover:underline">MY ACCOUNT</Link>  
                  </li>
                  <li>
                  <Link to="/contact" className="text-sm hover:underline">CONTACT US</Link>  
                  </li>
            </ul>
          </div>

          {/* Information Section */}
          <div className="w-full md:w-1/4 px-4 mb-8">
            <h3 className="font-bold mb-4">INFORMATION</h3>
            <ul className="space-y-2">
              {['ABOUT US', 'FAQ PAGE', 'PRIVACY POLICY', 'TERMS & CONDITIONS', 'REFUND & RETURN POLICY'].map((item) => (
                <li key={item}><a href="#" className="text-sm hover:underline">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Our Brands Section */}
          <div className="w-full md:w-1/4 px-4 mb-8">
            <h3 className="font-bold mb-4">OUR BRANDS</h3>
            <ul className="space-y-2">
              {['ADIDAS', 'ADIDAS ORIGINALS', 'NIKE', 'HUGO BOSS', 'VERSACE'].map((item) => (
                <li key={item}><a href="#" className="text-sm hover:underline">{item}</a></li>
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
                className="w-full px-3 py-2 border border-gray-300 mb-2"
              />
              <button type="submit" className="w-full bg-black text-white py-2 hover:bg-gray-800">
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Bottom section with copyright */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <p className="text-sm text-center">© 2023 URBAN CULTURE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;