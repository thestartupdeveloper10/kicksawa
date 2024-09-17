import { Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct } from '../../redux/cartRedux';
import { addProductWishlist, removeProductWishlist } from '../../redux/wishlistRedux';

const SneakerItem = ({ id, name, description, image,price, isImageRight, theme }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.currentUser);
  const wishlist = useSelector(state => state.wishlist);
  const cartlist = useSelector(state => state.cart);
  const navigate = useNavigate();



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
      dispatch(removeProductWishlist({ userId, productId: id }));
    } else {
      dispatch(addProductWishlist({ userId, product: { _id: id, title: name, desc: description, img: [image],price:price } }));
    }
  };

  const handleAddToBag = () => {
    if (!user) {
      console.log('User not logged in. Redirect to login page.');
      // Implement logic to redirect to login page or show login modal
      return;
    }
    console.log('Adding to bag:', { id, name, description, image });
    dispatch(addProduct({ userId, product: { _id: id, title: name, desc: description, img: [image], quantity: 1 } }));
  };

  if (!id || !name) {
    console.error('SneakerItem: Missing required props');
    return null; // Or you could return a placeholder component
  }

  return (
    <div className={`flex flex-col md:flex-row items-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      {!isImageRight && (
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <Link to={`/product/${id}`}>
            <img src={image} alt={name} className="w-full h-auto object-contain" />
          </Link>
        </div>
      )}
      <div className="w-full md:w-2/3 md:px-6">
        <Link to={`/product/${id}`}>
          <h3 className="text-2xl font-bold mb-2">{name}</h3>
        </Link>
        <p className="text-sm mb-4">{description}</p>
        <div className="flex space-x-4">
          <button 
            onClick={handleAddToWishlist}
            className={`flex items-center justify-center border ${theme === 'dark' ? 'border-white hover:bg-white hover:text-black' : 'border-black hover:bg-black hover:text-white'} px-4 py-2 transition-colors`}
          >
            <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
            {isInWishlist ? 'REMOVE FROM WISHLIST' : 'ADD TO WISHLIST'}
          </button>
          <Link to={`/product/${id}`}>
          <button
            className={`flex items-center justify-center border ${theme === 'dark' ? 'border-white hover:bg-white hover:text-black' : 'border-black hover:bg-black hover:text-white'} px-4 py-2 transition-colors`}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {alreadyInCart ? 'IN CART' : 'ADD TO CART'}
          </button>
          </Link>
        </div>
      </div>
      {isImageRight && (
        <div className="w-full md:w-1/3 mt-4 md:mt-0">
          <Link to={`/product/${id}`}>
            <img src={image} alt={name} className="w-full h-auto object-contain" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default SneakerItem;