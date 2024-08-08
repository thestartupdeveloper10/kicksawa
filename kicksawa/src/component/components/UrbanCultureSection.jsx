import React from 'react';

const UrbanCultureSection = () => {
  return (
    <section className="flex justify-center items-center py-16 px-4">
      <div className="flex flex-col md:flex-row max-w-6xl w-full shadow-lg">
        {/* Text content */}
        <div className="w-full md:w-1/2 bg-black text-white p-8 flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            ELEVATE YOUR
          </h2>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-stroke text-transparent">
            STYLE,
          </h2>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            EMBRACE THE
          </h2>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-stroke text-transparent">
            URBAN CULTURE
          </h2>
        </div>

        {/* Image placeholder */}
        <div className="w-full md:w-1/2 bg-gray-200 relative" style={{minHeight: '300px'}}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 text-lg">Product Image</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrbanCultureSection;