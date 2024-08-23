import React from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className={`relative overflow-hidden ${theme === 'dark' ? '' : 'bg-gray-100'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <motion.main
            className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="sm:text-center lg:text-left">
              <motion.h1 
                className={`text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                variants={itemVariants}
              >
                <span className="block xl:inline">Step into Style with</span>{' '}
                <span className={`block ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} xl:inline`}>Label Safi</span>
              </motion.h1>
              <motion.p 
                className={`mt-3 text-base sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                variants={itemVariants}
              >
                Discover the latest trends in streetwear and elevate your style game. From iconic sneakers to cutting-edge fashion, we've got you covered.
              </motion.p>
              <motion.div 
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                variants={itemVariants}
              >
                <div className="rounded-md shadow">
                  <Link
                    to="/products"
                    className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md ${
                      theme === 'dark'
                        ? 'text-black bg-white hover:bg-gray-200'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                    } md:py-4 md:text-lg md:px-10 transition-colors duration-300`}
                  >
                    Shop Now
                    <ShoppingBag className="ml-2" size={20} />
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/brands"
                    className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md ${
                      theme === 'dark'
                        ? 'bg-[#130d14] text-white hover:bg-gray-900'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    } md:py-4 md:text-lg md:px-10 transition-colors duration-300`}
                  >
                    Explore Brands
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.main>
        </div>
      </div>
      <motion.div 
        className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Urban streetwear collection"
        />
      </motion.div>
    </div>
  );
};

export default HeroSection;