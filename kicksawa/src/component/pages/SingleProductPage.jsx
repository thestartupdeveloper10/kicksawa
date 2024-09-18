import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext';
import { addProduct } from '../../redux/cartRedux';
import { addProductWishlist, removeProductWishlist } from '../../redux/wishlistRedux';
import { grid } from 'ldrs';
import { publicRequest } from '@/service/requestMethods';
grid.register()

const SingleProductPage = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.currentUser);
  const cart = useSelector(state => state.cart);
  const wishlist = useSelector(state => state.wishlist);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await publicRequest.get(`products/find/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const isInWishlist = user && wishlist.wishlists[user.id]?.products.some(item => item._id === id);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }
    dispatch(addProduct({
      userId: user.id,
      product: {
        ...product,
        quantity,
        selectedSize,
        selectedColor
      }
    }));
  };

  const handleToggleWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      dispatch(removeProductWishlist({ userId: user.id, productId: id }));
    } else {
      dispatch(addProductWishlist({ userId: user.id, product }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
          <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
        <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-500 animate-spin">
        </div>
    </div>
</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-8">Product not found.</div>;
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row -mx-4">
          {/* Product Images */}
          <div className="md:w-1/2 px-4 mb-8 md:mb-0">
            <div className="grid grid-cols-2 gap-4">
              {product.img.map((image, index) => (
                <img key={index} src={image} alt={`${product.title} - View ${index + 1}`} className="w-full h-auto" />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 px-4">
            <h1 className="text-3xl font-bold mb-4 capitalize">{product.title}</h1>
            <p className="text-2xl font-semibold mb-6">Ksh: {product.price.toFixed(2)}</p>

            <p className="mb-6">{product.desc}</p>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">Select Size</label>
              <div className="flex flex-wrap -mx-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    className={`m-2 px-4 py-2 border ${selectedSize === size ? (theme === 'dark' ? 'border-white bg-white text-black' : 'border-black bg-black text-white') : 'border-gray-300'} hover:border-black`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">Select Color</label>
              <div className="flex flex-wrap -mx-2">
                {product.color.map((color) => (
                  <button
                    key={color}
                    className={`m-2 w-10 h-10 rounded-full border-2 flex items-center justify-center ${selectedColor === color ? 'border-black' : 'border-gray-300'} hover:border-black`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  >
                    {selectedColor === color && <Check className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold">Quantity</label>
              <div className="flex items-center border border-gray-300">
                <button className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="px-4 py-2">{quantity}</span>
                <button className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Add to Cart and Wishlist Buttons */}
            <div className="flex space-x-4 mb-8">
              <button 
                onClick={handleAddToCart}
                className={`flex-1 ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-3 px-6 flex items-center justify-center`}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Bag
              </button>
              <button 
                onClick={handleToggleWishlist}
                className={`border py-3 px-6 flex items-center justify-center 
                ${theme === 'dark' ? 'border-white text-white hover:bg-gray-700' : 'border-black text-black hover:bg-gray-100'}
                ${isInWishlist ? 'bg-red-500 border-red-500 text-white' : ''}
              `}
              >
                <Heart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Categories</h2>
              <div className="flex flex-wrap">
                {product.categories.map((category, index) => (
                  <span key={index} className={`mr-2 mb-2 px-3 py-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full text-sm`}>
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* In Stock Status */}
            <div className="mb-6">
              <p className={`font-semibold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SingleProductPage;