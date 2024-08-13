import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Heart, ShoppingBag } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const ProductCard = ({ product }) => (
  <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105">
    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-2">{product.brand}</p>
      <p className="font-semibold">${product.price.toFixed(2)}</p>
      <div className="mt-4 flex justify-between">
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          <ShoppingBag size={16} className="inline mr-2" />
          Add to Cart
        </button>
        <button className="text-black px-4 py-2 rounded hover:bg-gray-200">
          <Heart size={16} />
        </button>
      </div>
    </div>
  </div>
);

const FilterSection = ({ title, options, selectedOptions, onOptionChange }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        className="flex justify-between items-center w-full py-2 px-4 bg-gray-100 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="mt-2 pl-4">
          {options.map(option => (
            <label key={option} className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => onOptionChange(option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    brands: [],
    categories: [],
    priceRanges: []
  });

  // Simulated product data - replace with actual API call
  useEffect(() => {
    const fetchProducts = async () => {
      // Simulated API call
      const data = [
        { id: 1, name: "Air Max 90", brand: "Nike", category: "Sneakers", price: 120, image: "/path-to-image.jpg" },
        { id: 2, name: "Ultraboost", brand: "Adidas", category: "Running", price: 180, image: "/path-to-image.jpg" },
        { id: 3, name: "Classic Leather", brand: "Reebok", category: "Casual", price: 75, image: "/path-to-image.jpg" },
        // Add more products...
      ];
      setProducts(data);
      setFilteredProducts(data);
    };
    fetchProducts();
  }, []);

  const handleFilterChange = (filterType, option) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      if (updatedFilters[filterType].includes(option)) {
        updatedFilters[filterType] = updatedFilters[filterType].filter(item => item !== option);
      } else {
        updatedFilters[filterType] = [...updatedFilters[filterType], option];
      }
      return updatedFilters;
    });
  };

  useEffect(() => {
    const applyFilters = () => {
      let result = products;
      if (filters.brands.length > 0) {
        result = result.filter(product => filters.brands.includes(product.brand));
      }
      if (filters.categories.length > 0) {
        result = result.filter(product => filters.categories.includes(product.category));
      }
      if (filters.priceRanges.length > 0) {
        result = result.filter(product => {
          return filters.priceRanges.some(range => {
            const [min, max] = range.split('-').map(Number);
            return product.price >= min && product.price <= max;
          });
        });
      }
      setFilteredProducts(result);
    };
    applyFilters();
  }, [filters, products]);

  const brands = ["Nike", "Adidas", "Reebok", "Puma", "New Balance"];
  const categories = ["Sneakers", "Running", "Casual", "Sports"];
  const priceRanges = ["0-50", "51-100", "101-150", "151-200", "201+"];

  return (
    <div>
      <Navbar/>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 pr-8">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <FilterSection
            title="Brands"
            options={brands}
            selectedOptions={filters.brands}
            onOptionChange={(option) => handleFilterChange('brands', option)}
          />
          <FilterSection
            title="Categories"
            options={categories}
            selectedOptions={filters.categories}
            onOptionChange={(option) => handleFilterChange('categories', option)}
          />
          <FilterSection
            title="Price Range"
            options={priceRanges}
            selectedOptions={filters.priceRanges}
            onOptionChange={(option) => handleFilterChange('priceRanges', option)}
          />
        </div>
        <div className="md:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-600 mt-8">No products found matching your filters.</p>
          )}
        </div>
      </div>
    </div>
    <Footer/>
    </div>
  );
};

export default ProductsPage;