/* eslint-disable react/prop-types */
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
const ProductCard = ({ image, category, name, price }) => (
    <div className="border border-gray-200 p-4 flex flex-col">
      <div className="relative mb-4">
        <Link to='/products/:id'>
        <img src={image} alt={name} className="w-full h-48 object-contain" />
        </Link>
        <div className="absolute z-50 top-2 right-2 flex space-x-2">
          <button className="p-1 bg-white rounded-full shadow">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-1 bg-white rounded-full shadow">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-1">{category}</div>
      <h3 className="font-semibold text-sm mb-2 flex-grow">{name}</h3>
      <div className="font-bold">LKR {price.toLocaleString()}</div>
    </div>
  );

  export default ProductCard;