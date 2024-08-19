import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';

const UrbanCultureSection = () => {
  const { theme } = useTheme();

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className={`flex justify-center items-center py-16 px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <div className="flex flex-col md:flex-row max-w-6xl w-full shadow-2xl rounded-lg overflow-hidden">
        {/* Text content */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className={`w-full md:w-1/2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-black'} text-white p-8 flex flex-col justify-center`}
        >
          <motion.h2 variants={textVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            ELEVATE YOUR
          </motion.h2>
          <motion.h2 variants={textVariants} className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}>
            STYLE,
          </motion.h2>
          <motion.h2 variants={textVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            EMBRACE THE
          </motion.h2>
          <motion.h2 variants={textVariants} className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}>
            URBAN CULTURE
          </motion.h2>
          <motion.p 
            variants={textVariants}
            className="mt-6 text-gray-300 text-lg"
          >
            Discover the latest trends that define the streets. Be bold, be you.
          </motion.p>
          <motion.div variants={textVariants} className="mt-8">
            <Link
              to="/products"
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md ${
                theme === 'dark'
                  ? 'text-gray-900 bg-white hover:bg-gray-100'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-300`}
            >
              Shop Now
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </motion.div>
        </motion.div>
        {/* Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 relative"
          style={{minHeight: '400px'}}
        >
          <img 
            src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1305&q=80" 
            alt="Urban Culture Fashion" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-600'} opacity-20`}></div>
        </motion.div>
      </div>
    </section>
  );
};

export default UrbanCultureSection;