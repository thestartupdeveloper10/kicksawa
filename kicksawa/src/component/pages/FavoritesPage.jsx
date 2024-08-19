import React, { useState } from 'react';
import { Heart, ShoppingBag, X } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext'; // Import the useTheme hook

const FavoriteItem = ({ item, onRemove, onAddToCart, theme }) => (
  <div className={`flex items-center py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover mr-4" />
    <div className="flex-grow">
      <h3 className="font-semibold">{item.name}</h3>
      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{item.category}</p>
      <p className="font-bold">${item.price.toFixed(2)}</p>
    </div>
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onAddToCart(item)}
        className={`p-2 rounded ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
      >
        <ShoppingBag size={20} />
      </button>
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-red-500 hover:text-red-700"
      >
        <X size={20} />
      </button>
    </div>
  </div>
);

const FavoritesPage = () => {
  const { theme } = useTheme(); // Use the theme hook
  const [favorites, setFavorites] = useState([
    { id: 1, name: "Nike Air Max 90", category: "Sneakers", price: 120, image: "/path-to-image1.jpg" },
    { id: 2, name: "Adidas Originals Hoodie", category: "Apparel", price: 80, image: "/path-to-image2.jpg" },
    { id: 3, name: "Puma RS-X", category: "Sneakers", price: 110, image: "/path-to-image3.jpg" },
  ]);

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const addToCart = (item) => {
    // This function would typically interact with your cart state or API
    console.log(`Added ${item.name} to cart`);
    // Optionally, you could remove the item from favorites after adding to cart
    // removeFromFavorites(item.id);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen transition-colors duration-300`}>
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
                key={item.id}
                item={item}
                onRemove={removeFromFavorites}
                onAddToCart={addToCart}
                theme={theme}
              />
            ))}
          </div>
        )}
        {favorites.length > 0 && (
          <div className="mt-8 text-center">
            <button
              className={`px-6 py-3 rounded ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              onClick={() => console.log("Navigate to shop")}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FavoritesPage;