/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Heart, User, ShoppingBag, Search, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const MenuItem = ({ href, children, onClick }) => (
  <Link to={href} className="text-black hover:text-gray-600" onClick={onClick}>
    {children}
  </Link>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuItems = ['SHOP', 'BRANDS', 'CONTACT'];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is the 'lg' breakpoint in Tailwind
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <header className="bg-white text-black sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Menu button (mobile only) */}
          {isMobile && (
            <button onClick={toggleMenu} className="z-50 relative">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

          {/* Logo */}
          <Link to='/'>
          <h1 className="text-2xl font-bold italic">KICKsawa.</h1>
          </Link>
          {/* Navigation links (desktop) */}
          {!isMobile && (
            <nav className="flex space-x-8">
              {menuItems.map((item) => (
                <MenuItem key={item} href={item.toLowerCase()==='shop'?'/products':`/${item.toLowerCase()}`}>{item}</MenuItem>
              ))}
            </nav>
          )}

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Search className="w-6 h-6" />
            <Link to='/favorites'>
            <Heart className="w-6 h-6" />
            </Link>
            <Link to="/login">
            <User className="w-6 h-6" />
            </Link>
            <Link to='/cart'>
            <ShoppingBag className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <nav className="fixed inset-0 bg-white z-40 flex items-center justify-center">
          <ul className="space-y-6 text-center">
            {menuItems.map((item) => (
              <li key={item}>
                <MenuItem href={item.toLowerCase()==='shop'?'/products':`/${item.toLowerCase()}`} onClick={toggleMenu}>{item}</MenuItem>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;