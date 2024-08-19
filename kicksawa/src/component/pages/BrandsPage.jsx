import React from 'react';
import { Link } from 'react-router-dom';
import nike from '../../assets/imgs/nike.svg'
import adidas from '../../assets/imgs/adidas.svg'
import puma from '../../assets/imgs/puma.svg'
import newbalance from '../../assets/imgs/new.svg'
import reebok from '../../assets/imgs/reebok.svg'
import underarmor from '../../assets/imgs/under-armour.svg'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTheme } from '../components/ThemeContext'; // Import the useTheme hook

const BrandCard = ({ brand, theme }) => (
  <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-lg rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105`}>
    <div className={`h-40 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center p-4`}>
      <img src={brand.logo} alt={`${brand.name} logo`} className={`max-h-full max-w-full object-contain ${theme === 'dark' ? 'filter invert' : ''}`} />
    </div>
    <div className="p-4">
      <h3 className="font-bold text-xl mb-2">{brand.name}</h3>
      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>{brand.description}</p>
      <Link to={`/products/${brand.name}`} className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-semibold hover:underline`}>
        View Products
      </Link>
    </div>
  </div>
);

const BrandsPage = () => {
  const { theme } = useTheme(); // Use the theme hook

  // This would typically come from your backend or state management
  const brands = [
    {
      id: 1,
      name: "Nike",
      logo: nike,
      description: "Just Do It. Nike offers innovative products, experiences and services to inspire athletes."
    },
    {
      id: 2,
      name: "Adidas",
      logo: adidas,
      description: "Through sport, we have the power to change lives. Adidas designs for and with athletes of all kinds."
    },
    {
      id: 3,
      name: "Puma",
      logo: puma,
      description: "Forever Faster. Puma's mission is to be the fastest sports brand in the world."
    },
    {
      id: 4,
      name: "Under Armour",
      logo: underarmor,
      description: "Under Armour makes you better. Innovative performance apparel, footwear, and accessories."
    },
    {
      id: 5,
      name: "New Balance",
      logo: newbalance,
      description: "Fearlessly Independent. New Balance is driven to make excellent products for athletes and everyday people."
    },
    {
      id: 6,
      name: "Reebok",
      logo: reebok,
      description: "Be More Human. Reebok is dedicated to inspiring and enabling athletic activity."
    },
  ];

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Brands</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map(brand => (
            <BrandCard key={brand.id} brand={brand} theme={theme} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrandsPage;