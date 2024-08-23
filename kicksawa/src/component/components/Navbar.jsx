import { useState, useEffect } from 'react';
import { Heart, User, ShoppingBag, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import axios from 'axios';

const MenuItem = ({ href, children, onClick }) => {
  const { theme } = useTheme();
  return (
    <Link
      to={href}
      className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors text-sm md:text-base`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const menuItems = ['SHOP', 'BRANDS', 'CONTACT'];

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const response = await axios.get(`http://localhost:3000/api/products?search=${encodeURIComponent(searchQuery.trim())}`);
        navigate('/search', { state: { results: response.data, query: searchQuery.trim() } });
        setIsSearchOpen(false);
        setSearchQuery('');
      } catch (error) {
        console.error('Error performing search:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  return (
    <header className={`${theme === 'dark' ? 'bg-[#041922] text-white' : 'bg-[#f9f6ee] text-black'} sticky top-0 z-50 transition-colors`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center py-3 md:py-4">
          {/* Logo */}
          <Link to='/' className="flex-shrink-0 mr-4">
            <h1 className="text-xl md:text-2xl font-bold italic">LABELsafi.</h1>
          </Link>
          
          {/* Navigation links (desktop) */}
          <nav className="hidden md:flex space-x-4 lg:space-x-8">
            {menuItems.map((item) => (
              <MenuItem key={item} href={item.toLowerCase() === 'shop' ? '/products' : `/${item.toLowerCase()}`}>{item}</MenuItem>
            ))}
          </nav>
          
          {/* Icons and Search */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} rounded-full py-1 px-3 pr-8 focus:outline-none w-full md:w-auto`}
                />
                <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="p-1">
                <Search className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
            <Link to='/favorites' className="p-1">
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link to="/login" className="p-1">
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link to='/cart' className="p-1">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <button onClick={toggleTheme} className="p-1">
              {theme === 'dark' ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>

          {/* Menu button (mobile only) */}
          <button onClick={toggleMenu} className="md:hidden p-1 ml-2">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className={`md:hidden ${theme === 'dark' ? 'bg-[#041922]' : 'bg-[#f9f6ee]'} transition-colors`}>
          <ul className="py-4 px-4 space-y-4">
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