import React, { useState, useEffect } from 'react';
import { Heart, User, ShoppingBag, Search, Menu, X } from 'lucide-react';

const MenuItem = ({ href, children, onClick }) => (
  <a href={href} className="text-black hover:text-gray-600" onClick={onClick}>
    {children}
  </a>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuItems = ['HOME', 'SHOP', 'BRANDS', 'CONTACT'];

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
          <h1 className="text-2xl font-bold italic">Urban Cult.</h1>

          {/* Navigation links (desktop) */}
          {!isMobile && (
            <nav className="flex space-x-8">
              {menuItems.map((item) => (
                <MenuItem key={item} href="#">{item}</MenuItem>
              ))}
            </nav>
          )}

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Search className="w-6 h-6" />
            <Heart className="w-6 h-6" />
            <User className="w-6 h-6" />
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <nav className="fixed inset-0 bg-white z-40 flex items-center justify-center">
          <ul className="space-y-6 text-center">
            {menuItems.map((item) => (
              <li key={item}>
                <MenuItem href="#" onClick={toggleMenu}>{item}</MenuItem>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;