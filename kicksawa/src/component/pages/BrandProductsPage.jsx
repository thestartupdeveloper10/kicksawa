import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTheme } from '../components/ThemeContext'; // Import the useTheme hook

const ProductCard = ({ product, theme }) => (
  <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-lg rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105`}>
    <img src={product.img[0]} alt={product.title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-lg mb-2">{product.title}</h3>
      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{product.brand}</p>
      <p className="font-semibold">${product.price.toFixed(2)}</p>
    </div>
  </div>
);

const BrandProductsPage = () => {
  const { brandName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9);
  const { theme } = useTheme(); // Use the theme hook

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/products?brand=${brandName}`);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, [brandName]);

  console.log(products)

  if (loading) {
    return <div className={`text-center py-8 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Loading...</div>;
  }
  if (error) {
    return <div className={`text-center py-8 text-red-500 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>{error}</div>;
  }

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{brandName} Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProducts.map(product => (
            <ProductCard key={product._id} product={product} theme={theme} />
          ))}
        </div>
        {products.length === 0 && (
          <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-8`}>No products found for this brand.</p>
        )}
        {products.length > productsPerPage && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} rounded-md disabled:opacity-50`}
            >
              <ChevronLeft size={20} />
            </button>
            {[...Array(Math.ceil(products.length / productsPerPage)).keys()].map(number => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={`mx-1 px-3 py-2 rounded-md ${
                  currentPage === number + 1 
                    ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white')
                    : (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700')
                }`}
              >
                {number + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(products.length / productsPerPage)}
              className={`mx-1 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} rounded-md disabled:opacity-50`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BrandProductsPage;