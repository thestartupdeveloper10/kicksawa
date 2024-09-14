/* eslint-disable react/prop-types */
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext';
import { removeProductWishlist } from '../../redux/wishlistRedux';
import { addProduct } from '../../redux/cartRedux';

const FavoriteItem = ({ item, onRemove,theme }) => (
  <div className={`flex items-center px-2 py-4 border-b ${theme === 'dark' ? 'bg-[#130d14]' : 'border-gray-200 bg-gray-200'}`}>
    <img src={item.product.img[0]} alt={item.product.title} className="w-20 h-20 object-cover mr-4" />
    <div className="flex-grow">
      <h3 className="font-semibold">{item.product.title}</h3>
      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{item.product.brand}</p>
      <p className="font-bold">Ksh: {item.product.price.toFixed(2)}</p>
    </div>
    <div className="flex items-center space-x-2">
    <Link to={`/product/${item.product._id}`}>
      <button
       onClick={() => onRemove(item.product._id)}
        className={`p-2 rounded ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
      >
        <ShoppingBag size={20} />
      </button>
      </Link>
      <button
        onClick={() => onRemove(item.product._id)}
        className="p-2 text-red-500 hover:text-red-700"
      >
        <X size={20} />
      </button>
    </div>
  </div>
);

const FavoritesPage = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.currentUser);
  const wishlist = useSelector(state => state.wishlist);

  

  const userId = user?.id;
  const userWishlist = wishlist.wishlists[userId] || { products: [] };
  const favorites = userWishlist.products;


  const removeFromFavorites = (productId) => {
    console.log('Removing from favorites:', productId);
    dispatch(removeProductWishlist({ userId, productId }));
  };

  const addToCart = (item) => {
    console.log('Adding to cart:', item);
    dispatch(addProduct({ userId, product: { ...item, quantity: 1 } }));
    // Optionally, you could remove the item from favorites after adding to cart
    removeFromFavorites(item._id);
    console.log('item id',item._id)
  };

  return (
    <div className={`${theme === 'dark' ? ' text-white' : 'bg-white text-black'} min-h-screen transition-colors duration-300`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl justify-center font-bold mb-8 flex items-center">
          <Heart className={`mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} /> Your Favorites
        </h1>
        {favorites.length === 0 ? (
          <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>You haven't added any favorites yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map(item => (
             
              <FavoriteItem
                key={item._id}
                item={item}
                onRemove={removeFromFavorites}
                onAddToCart={addToCart}
                theme={theme}
              />
              // console.log("items are:",item.product.img[0])
            ))}
          </div>
        )}
        {favorites.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/products"
              className={`px-6 py-3 rounded ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FavoritesPage;