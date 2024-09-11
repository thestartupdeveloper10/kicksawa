import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SneakerItem from "./SneakerItem";
import { useTheme } from './ThemeContext'; // Import the useTheme hook

const PopularSneakersSection = () => {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme(); // Use the theme hook

  useEffect(() => {
    const fetchSneakers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products?category=streetwear');
        const popularSneakers = response.data.slice(0, 5).map(sneaker => ({
          id: sneaker._id,
          name: sneaker.title.toUpperCase(),
          description: sneaker.desc.length > 150 ? sneaker.desc.substring(0, 147) + '...' : sneaker.desc,
          image: sneaker.img[0], // Assuming the first image is the main one
          price:sneaker.price
        }));
        setSneakers(popularSneakers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching popular sneakers:', err);
        setError('Failed to load popular sneakers. Please try again later.');
        setLoading(false);
      }
    };
    fetchSneakers();
  }, []);

  if (loading) {
    return <div className={`text-center py-12 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Loading popular sneakers...</div>;
  }

  if (error) {
    return <div className={`text-center py-12 text-red-500 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>{error}</div>;
  }

  return (
    <section className={`py-12 px-4 ${theme === 'dark' ? ' text-white' : 'bg-white text-black'} transition-colors`}>
      <h2 className="text-2xl font-bold text-center mb-8">POPULAR PRODUCTS</h2>
      <div className="max-w-4xl mx-auto">
        {sneakers.map((sneaker, index) => (
          
          <SneakerItem key={sneaker.id} {...sneaker} isImageRight={index % 2 !== 0} theme={theme} />
        ))}
      </div>
    </section>
  );
};

export default PopularSneakersSection;