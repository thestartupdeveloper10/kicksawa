import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Search, ChevronDown, ChevronUp, ShoppingBag, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTheme } from '../components/ThemeContext';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct } from '../../redux/cartRedux';
import { addProductWishlist, removeProductWishlist } from '../../redux/wishlistRedux';

const ProductCard = ({ product, theme, onAddToCart, onToggleFavorite, isInCart, isInFavorites }) => (
  <div className={`${theme === 'dark' ? 'bg-[#130d14] text-white' : 'bg-white text-black'} shadow-lg rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105`}>
    <div className='bg-white'>
      <Link to={`/product/${product._id}`}>
        <img src={product.img[0]} alt={product.title} className="w-full h-48 object-contain" />
      </Link>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lg mb-2 capitalize">{product.title}</h3>
      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{product.brand}</p>
      <p className="font-semibold mb-2">Ksh: {product.price.toFixed(2)}</p>
      <div className="flex mb-4">
        {product.color.map((color, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded-full mr-2 border border-gray-300"
            style={{ backgroundColor: color }}
            title={color}
          ></div>
        ))}
      </div>
      <div className="flex justify-between">
        <button 
          onClick={() => onAddToCart(product)}
          className={`${
            theme === 'dark' 
              ? 'bg-white text-black hover:bg-gray-200' 
              : 'bg-black text-white hover:bg-gray-800'
          } px-4 py-2 rounded transition-colors flex items-center`}
        >
          <ShoppingBag size={16} className="mr-2" />
          {isInCart ? 'In Cart' : 'Add to Cart'}
        </button>
        <button 
          onClick={() => onToggleFavorite(product)}
          className={`${
            theme === 'dark' 
              ? 'text-white hover:bg-gray-700' 
              : 'text-black hover:bg-gray-200'
          } px-4 py-2 rounded transition-colors ${
            isInFavorites ? 'text-red-500' : ''
          }`}
        >
          <Heart size={16} fill={isInFavorites ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  </div>
);

const FilterSection = ({ title, options, selectedOptions, onOptionChange, theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        className={`flex justify-between items-center w-full py-2 px-4 ${theme === 'dark' ? 'bg-[#130d14] text-white' : 'bg-gray-100 text-black'} rounded transition-colors`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="mt-2 pl-4">
          {options.map(option => (
            <label key={option} className={`flex items-center mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => onOptionChange(option)}
                className="mr-2"
              />
              {title === "Colors" ? (
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                    style={{ backgroundColor: option }}
                  ></div>
                  {option}
                </div>
              ) : (
                option
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const BrandProductsPage = () => {
  const { brand } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.currentUser);
  const cart = useSelector(state => state.cart);
  const wishlist = useSelector(state => state.wishlist);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9);
  const { theme } = useTheme();

  console.log(brand)

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    priceRanges: [],
    colors: []
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/products?brand=${brand}`);
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, [brand]);

  useEffect(() => {
    const results = products.filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.categories.length === 0 || filters.categories.some(cat => product.categories.includes(cat))) &&
      (filters.priceRanges.length === 0 || filters.priceRanges.some(range => {
        const [min, max] = range.split('-').map(Number);
        return product.price >= min && (max === '+' || product.price <= max);
      })) &&
      (filters.colors.length === 0 || filters.colors.some(color => product.color.includes(color)))
    );
    setFilteredProducts(results);
    setCurrentPage(1);
  }, [searchTerm, filters, products]);

  const handleAddToCart = (product) => {
    if (!user) {
      // Handle user not logged in (e.g., redirect to login page)
      console.log('User not logged in');
      return;
    }
    dispatch(addProduct({ userId: user._id, product: { ...product, quantity: 1 } }));
  };

  const handleToggleFavorite = (product) => {
    if (!user) {
      // Handle user not logged in (e.g., redirect to login page)
      console.log('User not logged in');
      return;
    }
    const userId = user._id;
    const userWishlist = wishlist.wishlists[userId] || { products: [] };
    const isInWishlist = userWishlist.products.some(item => item._id === product._id);
    if (isInWishlist) {
      dispatch(removeProductWishlist({ userId, productId: product._id }));
    } else {
      dispatch(addProductWishlist({ userId, product }));
    }
  };

  const handleFilterChange = (filterType, option) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      if (updatedFilters[filterType].includes(option)) {
        updatedFilters[filterType] = updatedFilters[filterType].filter(item => item !== option);
      } else {
        updatedFilters[filterType] = [...updatedFilters[filterType], option];
      }
      return updatedFilters;
    });
  };

  if (loading) {
    return <div className={`text-center py-8 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Loading...</div>;
  }
  if (error) {
    return <div className={`text-center py-8 text-red-500 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>{error}</div>;
  }

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const categories = [...new Set(products.flatMap(product => product.categories))];
  const priceRanges = ["0-1000", "1001-2000", "2001-3000", "3001-4000", "4001+"];
  const colors = [...new Set(products.flatMap(product => product.color))];

  return (
    <div className={`${theme === 'dark' ? 'text-white' : 'bg-white text-black'} min-h-screen`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{brand} Products</h1>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-2 pl-10 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} rounded`}
            />
            <Search className="absolute left-3 top-2.5" size={20} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 pr-4 mb-4 md:mb-0">
            <FilterSection
              title="Categories"
              options={categories}
              selectedOptions={filters.categories}
              onOptionChange={(option) => handleFilterChange('categories', option)}
              theme={theme}
            />
            <FilterSection
              title="Price Ranges"
              options={priceRanges}
              selectedOptions={filters.priceRanges}
              onOptionChange={(option) => handleFilterChange('priceRanges', option)}
              theme={theme}
            />
            <FilterSection
              title="Colors"
              options={colors}
              selectedOptions={filters.colors}
              onOptionChange={(option) => handleFilterChange('colors', option)}
              theme={theme}
            />
          </div>

          <div className="md:w-3/4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  theme={theme}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  isInCart={cart.carts[user?._id]?.products[product._id] !== undefined}
                  isInFavorites={wishlist.wishlists[user?._id]?.products.some(item => item._id === product._id)}
                />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-8`}>No products found matching your criteria.</p>
            )}
            {filteredProducts.length > productsPerPage && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} rounded-md disabled:opacity-50 transition-colors`}
                >
                  <ChevronLeft size={20} />
                </button>
                {[...Array(Math.ceil(filteredProducts.length / productsPerPage)).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`mx-1 px-3 py-2 rounded-md ${
                      currentPage === number + 1 
                        ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white')
                        : (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700')
                    } transition-colors`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                  className={`mx-1 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} rounded-md disabled:opacity-50 transition-colors`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrandProductsPage;