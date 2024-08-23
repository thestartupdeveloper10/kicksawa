import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const SneakerItem = ({ id, name, description, image, isImageRight, theme }) => (
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
        <button className={`flex items-center justify-center border ${theme === 'dark' ? 'border-white hover:bg-white hover:text-black' : 'border-black hover:bg-black hover:text-white'} px-4 py-2 transition-colors`}>
          <Heart className="w-4 h-4 mr-2" />
          ADD TO WISHLIST
        </button>
        <button className={`flex items-center justify-center border ${theme === 'dark' ? 'border-white hover:bg-white hover:text-black' : 'border-black hover:bg-black hover:text-white'} px-4 py-2 transition-colors`}>
          <ShoppingBag className="w-4 h-4 mr-2" />
          ADD TO BAG
        </button>
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

export default SneakerItem;