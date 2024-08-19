import React, { useState, useEffect } from 'react';
import { Heart, User, ShoppingBag, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext'; // Import the useTheme hook

const MenuItem = ({ href, children, onClick }) => {
  const { theme } = useTheme();
  return (
    <Link
      to={href}
      className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const menuItems = ['SHOP', 'BRANDS', 'CONTACT'];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <header className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} sticky top-0 z-50 transition-colors`}>
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
            <h1 className="md:text-2xl text-xl font-bold italic">LABELsafi.</h1>
          </Link>
          {/* Navigation links (desktop) */}
          {!isMobile && (
            <nav className="flex space-x-8">
              {menuItems.map((item) => (
                <MenuItem key={item} href={item.toLowerCase() === 'shop' ? '/products' : `/${item.toLowerCase()}`}>{item}</MenuItem>
              ))}
            </nav>
          )}
          {/* Icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
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
            <button onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <nav className={`fixed inset-0 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} z-40 flex items-center justify-center transition-colors`}>
          <ul className="space-y-6 text-center">
            {menuItems.map((item) => (
              <li key={item}>
                <MenuItem href={item.toLowerCase() === 'shop' ? '/products' : `/${item.toLowerCase()}`} onClick={toggleMenu}>{item}</MenuItem>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;