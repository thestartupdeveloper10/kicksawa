import { useState } from 'react';
import { Heart, User, ShoppingBag, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/userRedux';
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.currentUser);
  const cart = useSelector(state => state.cart);
  const wishlist = useSelector(state => state.wishlist);

  const userId = user?.id;
  const userCart = cart?.carts?.[userId] || { products: {}, quantity: 0, total: 0 };
  const userWishlist = wishlist?.wishlists?.[userId] || { products: [] };

  const cartItemCount = Object.values(userCart.products).length;
  const wishlistItemCount = userWishlist.products.length;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
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
      }
    }
  };

  const handleLogout = () => {
    console.log('Logging out user');
    dispatch(logout());
    navigate('/');
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
            <Link to='/favorites' className="p-1 relative">
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {wishlistItemCount}
                </span>
              )}
            </Link>
            <div className="relative">
              <button onClick={toggleUserMenu} className="p-1">
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              {isUserMenuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5`}>
                  {user ? (
                    <>
                      <p className={`px-4 py-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                        Hello, <span className='font-bold'>{user.email}</span>
                      </p>
                      {user.profilePic && (
                        <Link to="/my-account" className={`flex gap-3 items-center block px-4 py-2 text-sm ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                          <img src={user.profilePic} alt="" className='h-7 w-7 object-contain rounded-full' />
                          <h1>Profile</h1>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>
            <Link to='/cart' className="p-1 relative">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
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
            {user && (
              <>
                <li>
                  <MenuItem href="/my-account" onClick={toggleMenu}>Profile</MenuItem>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors text-sm md:text-base`}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;