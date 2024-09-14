import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Heart, ShoppingBag, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { addProduct } from '../../redux/cartRedux';
import { addProductWishlist, removeProductWishlist } from '../../redux/wishlistRedux';

const ProductCard = ({ product, theme, onAddToCart, onToggleFavorite, isFavorite }) => {
  const user = useSelector(state => state.user.currentUser);
  const wishlist = useSelector(state => state.wishlist);
  const cartlist = useSelector(state => state.cart);
  const userId = user?.id;
  const userWishlist = wishlist.wishlists[userId] || { products: [] };
  const userCartlist = cartlist.carts[userId] || { products: [] };
  const isInWishlist = userWishlist.products.some(item => item.product._id == product._id);
  const isInCartlist = userCartlist.products;

  const productIds = Object.entries(isInCartlist).map(([key, product]) => product._id);
  const alreadyInCart = productIds.includes(product._id);

  return (
    <div className={`${theme === 'dark' ? 'bg-[#130d14] text-white' : 'bg-white text-black'} shadow-lg rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105`}>
      <div className='bg-white'>
        <Link to={`/product/${product._id}`}>
          <img src={product.img[0]} alt={product.title} className="w-full h-48 object-contain" />
        </Link>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 capitalize">{product.title}</h3>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{product.brand}</p>
        <p className="font-semibold">Ksh: {product.price.toFixed(2)}</p>
        <div className="mt-4 flex justify-between">
          <Link to={`/product/${product._id}`}>
            <button
              className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-4 py-2 rounded transition-colors`}
            >
              <ShoppingBag size={16} className="inline mr-2" />
              {alreadyInCart ? 'In Cart' : 'Add to Cart'}
            </button>
          </Link>
          <button 
            onClick={() => onToggleFavorite(product)}
            className={`${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-200'} px-4 py-2 rounded transition-colors`}
          >
            <Heart className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'} ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterSection = ({ title, options, selectedOptions, onOptionChange, theme, isOpen, toggleOpen }) => {
  return (
    <div className="mb-4">
      <button
        className={`flex justify-between items-center w-full py-2 px-4 ${theme === 'dark' ? 'bg-[#130d14] text-white' : 'bg-gray-100 text-black'} rounded transition-colors`}
        onClick={toggleOpen}
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
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductsPage = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.user.currentUser);
  const userId = user?.id;
  const cart = useSelector(state => state.cart);
  const wishlist = useSelector(state => state.wishlist);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    brands: [],
    categories: [],
    priceRanges: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [openFilters, setOpenFilters] = useState({
    brands: false,
    categories: false,
    priceRanges: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/api/products");
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    console.log('Adding to cart:', { userId, product });
    dispatch(addProduct({ userId, product }));
  };

  const handleToggleFavorite = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const userWishlist = wishlist.wishlists[userId] || { products: [] };
    const isProductInWishlist = userWishlist.products.some(item => item.product._id == product._id);
    console.log('Toggling favorite:', { userId, product, isProductInWishlist });
    if (isProductInWishlist) {
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
    setCurrentPage(1);
  };

  const toggleFilterOpen = (filterType) => {
    setOpenFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  useEffect(() => {
    const applyFilters = () => {
      let result = products;
      if (filters.brands.length > 0) {
        result = result.filter(product => filters.brands.includes(product.brand));
      }
      if (filters.categories.length > 0) {
        result = result.filter(product => 
          product.categories.some(category => filters.categories.includes(category))
        );
      }
      if (filters.priceRanges.length > 0) {
        result = result.filter(product => {
          return filters.priceRanges.some(range => {
            const [min, max] = range.split('-').map(Number);
            return product.price >= min && (max === '+' || product.price <= max);
          });
        });
      }
      setFilteredProducts(result);
    };
    applyFilters();
  }, [filters, products]);

  const brands = [...new Set(products.map(product => product.brand))];
  const categories = [...new Set(products.flatMap(product => product.categories))];
  const priceRanges = ["2500-3500", "3501-4500", "4501-5500", "5501-6500", "6501+"];

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`${theme === 'dark' ? 'text-white' : 'bg-white text-black'} min-h-screen transition-colors duration-300`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 pr-8 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <FilterSection
              title="Brands"
              options={brands}
              selectedOptions={filters.brands}
              onOptionChange={(option) => handleFilterChange('brands', option)}
              theme={theme}
              isOpen={openFilters.brands}
              toggleOpen={() => toggleFilterOpen('brands')}
            />
            <FilterSection
              title="Categories"
              options={categories}
              selectedOptions={filters.categories}
              onOptionChange={(option) => handleFilterChange('categories', option)}
              theme={theme}
              isOpen={openFilters.categories}
              toggleOpen={() => toggleFilterOpen('categories')}
            />
            <FilterSection
              title="Price Range"
              options={priceRanges}
              selectedOptions={filters.priceRanges}
              onOptionChange={(option) => handleFilterChange('priceRanges', option)}
              theme={theme}
              isOpen={openFilters.priceRanges}
              toggleOpen={() => toggleFilterOpen('priceRanges')}
            />
          </div>
          <div className="md:w-3/4">
            {isLoading ? (
             <div className="flex items-center justify-center h-screen">
              <div className="relative">
                  <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
                  <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-500 animate-spin">
        
                  </div>
              </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProducts.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      theme={theme}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={wishlist.wishlists[userId]?.products.some(item => item._id === product._id)}
                    />
                  ))}
                </div>
                {filteredProducts.length === 0 && (
                  <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-8`}>No products found matching your filters.</p>
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
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;