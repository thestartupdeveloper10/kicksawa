import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext'; // Import the useTheme hook

const ProductCard = ({ id, image, category, name, price }) => {
  const { theme } = useTheme(); // Use the theme hook

  return (
    <div className={`border ${theme === 'dark' ? 'border-gray-700 bg-[#130d14]' : 'border-gray-200 bg-white'} p-4 flex flex-col transition-colors`}>
      <div className="relative mb-4">
        <Link to={`/product/${id}`}>
          <img src={image} alt={name} className="w-full h-48 object-cover" />
        </Link>
        <div className="absolute z-50 top-2 right-2 flex space-x-2">
          <button className={`p-1 ${theme === 'dark' ? 'bg-[#130d14]' : 'bg-white'} rounded-full shadow`}>
            <Heart className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
          </button>
          <button className={`p-1 ${theme === 'dark' ? 'bg-[#130d14]' : 'bg-white'} rounded-full shadow`}>
            <ShoppingBag className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
          </button>
        </div>
      </div>
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1 capitalize`}>{category}</div>
      <h3 className={`font-semibold text-sm mb-2 flex-grow ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{name}</h3>
      <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Ksh: {price.toLocaleString()}</div>
    </div>
  );
};

export default ProductCard;