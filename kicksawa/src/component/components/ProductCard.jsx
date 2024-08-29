import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct } from '../../redux/cartRedux';
import { addProductWishlist, removeProductWishlist } from '../../redux/wishlistRedux';

const ProductCard = ({ id, image, category, name, price }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.currentUser);
  const wishlist = useSelector(state => state.wishlist);

  const userId = user?._id;
  const userWishlist = wishlist.wishlists[userId] || { products: [] };
  const isInWishlist = userWishlist.products.some(item => item._id === id);

  console.log('ProductCard - Props:', { id, image, category, name, price });
  console.log('ProductCard - Is in wishlist:', isInWishlist);

  const handleAddToWishlist = () => {
    if (!user) {
      console.log('User not logged in. Redirect to login page.');
      // Implement logic to redirect to login page or show login modal
      return;
    }
    if (isInWishlist) {
      console.log('Removing from wishlist:', id);
      dispatch(removeProductWishlist({ userId, productId: id }));
    } else {
      console.log('Adding to wishlist:', { id, name, category, image, price });
      dispatch(addProductWishlist({ userId, product: { _id: id, title: name, categories: [category], img: [image], price } }));
    }
  };

  const handleAddToBag = () => {
    if (!user) {
      console.log('User not logged in. Redirect to login page.');
      // Implement logic to redirect to login page or show login modal
      return;
    }
    console.log('Adding to bag:', { id, name, category, image, price });
    dispatch(addProduct({ userId, product: { _id: id, title: name, categories: [category], img: [image], price, quantity: 1 } }));
  };

  return (
    <div className={`border ${theme === 'dark' ? 'border-gray-700 bg-[#130d14]' : 'border-gray-200 bg-white'} p-4 flex flex-col transition-colors`}>
      <div className="relative mb-4">
        <div className='bg-white w-full'>
          <Link to={`/product/${id}`}>
            <img src={image} alt={name} className="w-full h-48 object-contain" />
          </Link>
        </div>
        <div className="absolute z-50 top-2 right-2 flex space-x-2">
          <button 
            onClick={handleAddToWishlist}
            className={`p-1 ${theme === 'dark' ? 'bg-[#130d14]' : 'bg-white'} rounded-full shadow`}
          >
            <Heart className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'} ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleAddToBag}
            className={`p-1 ${theme === 'dark' ? 'bg-[#130d14]' : 'bg-white'} rounded-full shadow`}
          >
            <ShoppingBag className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
          </button>
        </div>
      </div>
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1 capitalize`}>{category}</div>
      <h3 className={`font-semibold text-sm mb-2 flex-grow capitalize ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{name}</h3>
      <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Ksh: {price.toLocaleString()}</div>
    </div>
  );
};

export default ProductCard;