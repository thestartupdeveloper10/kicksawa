import React, { useState } from 'react';
import { Heart, ShoppingBag, ChevronDown } from 'lucide-react';

const SingleProductPage = () => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const product = {
    name: "Nike Air Force 1 '07",
    price: 110.00,
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball OG that puts a fresh spin on what you know best: durably stitched overlays, clean finishes and the perfect amount of flash to make you shine.",
    features: [
      "Full-grain leather in the upper adds a premium look and feel.",
      "Originally designed for performance hoops, Nike Air cushioning adds lightweight, all-day comfort.",
      "The padded, low-cut collar looks sleek and feels great.",
    ],
    images: [
      "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c25lYWtlcnN8ZW58MHwxfDB8fHww",
      "https://images.unsplash.com/photo-1654907118243-a0a62cefbf0a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c25lYWtlcnN8ZW58MHwxfDB8fHww",
      "https://images.unsplash.com/photo-1509442233604-131901ff8d40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNuZWFrZXJzfGVufDB8MXwwfHx8MA%3D%3D",
    ],
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row -mx-4">
        {/* Product Images */}
        <div className="md:w-1/2 px-4 mb-8 md:mb-0">
          <div className="grid grid-cols-2 gap-4">
            {product.images.map((image, index) => (
              <img key={index} src={image} alt={`${product.name} - View ${index + 1}`} className="w-full h-auto" />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 px-4">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold mb-6">${product.price.toFixed(2)}</p>
          
          <p className="mb-6">{product.description}</p>
          
          {/* Size Selection */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Select Size</label>
            <div className="flex flex-wrap -mx-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`m-2 px-4 py-2 border ${selectedSize === size ? 'border-black' : 'border-gray-300'} hover:border-black`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Quantity</label>
            <div className="flex items-center border border-gray-300">
              <button className="px-4 py-2 bg-gray-100" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span className="px-4 py-2">{quantity}</span>
              <button className="px-4 py-2 bg-gray-100" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Add to Cart and Wishlist Buttons */}
          <div className="flex space-x-4 mb-8">
            <button className="flex-1 bg-black text-white py-3 px-6 flex items-center justify-center hover:bg-gray-800">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Add to Bag
            </button>
            <button className="border border-black py-3 px-6 flex items-center justify-center hover:bg-gray-100">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Product Features */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Product Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;