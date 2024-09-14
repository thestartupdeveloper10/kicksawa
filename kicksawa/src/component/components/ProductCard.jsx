import { Heart, ShoppingBag,ShoppingBasket } from 'lucide-react';
import { Link,useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct } from '../../redux/cartRedux';
import { addProductWishlist, removeProductWishlist } from '../../redux/wishlistRedux';

const ProductCard = ({ id, image, category, name, price,size,color,brand }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.currentUser);
  const wishlist = useSelector(state => state.wishlist);
  const navigate = useNavigate();
  const cartlist = useSelector(state => state.cart);

  console.log('The wishlist has the following products:', wishlist.wishlists);

  const userId = user?.id;
  const userWishlist = wishlist.wishlists[userId] || { products: [] };
  const userCartlist = cartlist.carts[userId] || { products: [] };
  const isInWishlist = userWishlist.products.some(item => item.product._id ==id);
  const isInCartlist =userCartlist.products

  const productIds = Object.entries(isInCartlist).map(([key, product]) => product._id);
  const alreadyInCart = productIds.includes(id);



  const handleAddToWishlist = () => {
    if (!user) {
      navigate('/login');
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
      navigate('/login');
      return;
    }
    console.log('Adding to bag:', { id, name, category, image, price,size,color,brand });
    dispatch(addProduct({ userId, product: { _id: id, title: name, categories: [category], img: [image], price, quantity: 1 ,size: [size],color: [color],brand} }));
  };

  return (
    <div className={`border ${theme === 'dark' ? 'border-gray-700 bg-[#130d14]' : 'border-gray-200 bg-white'} p-4 flex flex-col transition-colors`}>
      <div className="relative mb-4">
        <div className='bg-white w-full'>
          <Link to={`/product/${id}`}>
            <img src={image} alt={name} className="w-full h-48 object-contain" />
          </Link>
        </div>
        <div className="absolute z-30 top-2 right-2 flex space-x-2">
          <button 
            onClick={handleAddToWishlist}
            className={`p-1 ${theme === 'dark' ? 'bg-[#130d14]' : 'bg-white'} rounded-full shadow`}
          >
            <Heart className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'} ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          <Link to={`/product/${id}`}>
          <button
            className={`p-1 ${theme === 'dark' ? 'bg-[#130d14]' : 'bg-white'} rounded-full shadow`}
          >
            {alreadyInCart ? <ShoppingBasket className={`w-5 h-5 ${theme === 'dark' ? 'text-[#d2691e]' : 'text-[#d2691e]'}`} /> : <ShoppingBag className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />}
          </button>
          </Link>
        </div>
      </div>
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1 capitalize`}>{category}</div>
      <h3 className={`font-semibold text-sm mb-2 flex-grow capitalize ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{name}</h3>
      <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Ksh: {price.toLocaleString()}</div>
    </div>
  );
};

export default ProductCard;