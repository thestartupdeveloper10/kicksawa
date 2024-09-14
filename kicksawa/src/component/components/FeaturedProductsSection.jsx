import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from "./ProductCard";
import { useTheme } from './ThemeContext'; // Import the useTheme hook
import { color } from 'framer-motion';
import ProductCardSkeleton from './ProductCardSkeleton';

const FeaturedProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme(); // Use the theme hook

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products?new=true');
        const featuredProducts = response.data.slice(0, 4).map(product => ({
          id: product._id,
          image: product.img[0], // Assuming the first image is the main one
          category: product.categories[0] || "CATEGORY", // Fallback to "CATEGORY" if none provided
          name: product.title,
          price: product.price,
          size: product.size[0],
          color: product.color[0],
          brand:product.brand
        }));
        setProducts(featuredProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products. Please try again later.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <ProductCardSkeleton></ProductCardSkeleton>
      <ProductCardSkeleton></ProductCardSkeleton>
      <ProductCardSkeleton></ProductCardSkeleton>
      <ProductCardSkeleton></ProductCardSkeleton>
    </div>;
  }

  if (error) {
    return <div className={`text-center py-12 text-red-500 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>{error}</div>;
  }

  return (
    <section className={`py-12 px-4 ${theme === 'dark' ? ' text-white' : 'bg-white text-black'} transition-colors`}>
      <h2 className="text-2xl font-bold text-center mb-8">FEATURED</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={index} {...product} theme={theme} />
          // console.log(product)
        ))}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;