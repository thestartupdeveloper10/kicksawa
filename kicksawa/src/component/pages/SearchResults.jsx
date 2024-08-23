
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const SearchResults = () => {
  const location = useLocation();
  const { results, query } = location.state || { results: [], query: '' };
  const { theme } = useTheme();

  return (
    <div>
        <Navbar/>
    <div className={`${theme === 'dark' ? ' text-white' : 'bg-white text-black'} min-h-screen p-8`}>
      <h1 className="text-3xl font-bold mb-8">Search Results for: {query}</h1>
      {results.length === 0 ? (
        <p>No results found for your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product) => (
            <div key={product._id} className={`${theme === 'dark' ? 'bg-[#130d14]' : 'bg-gray-100'} rounded-lg overflow-hidden shadow-lg`}>
             <div className='bg-white'>
              <img src={product.img[0]} alt={product.title} className="w-full h-48 object-contain" />
              </div>
              <div className="p-4">
                <h2 className="font-bold text-xl mb-2">{product.title}</h2>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{product.brand}</p>
                <p className="font-semibold">Ksh: {product.price.toFixed(2)}</p>
                <Link 
                  to={`/product/${product._id}`} 
                  className={`mt-4 inline-block px-4 py-2 rounded ${
                      theme === 'dark'
                        ? 'text-black bg-white hover:bg-gray-200'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                    } transition-colors`}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    <Footer/>
    </div>
  );
};

export default SearchResults;