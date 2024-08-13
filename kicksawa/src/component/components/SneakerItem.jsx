import { Heart, ShoppingBag } from 'lucide-react';
const SneakerItem = ({ name, description, image, isImageRight }) => (
    <div className="flex flex-col md:flex-row items-center mb-12">
      {!isImageRight && (
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <img src={image} alt={name} className="w-full h-auto object-contain" />
        </div>
      )}
      <div className="w-full md:w-2/3 md:px-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-sm mb-4">{description}</p>
        <div className="flex space-x-4">
          <button className="flex items-center justify-center border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
            <Heart className="w-4 h-4 mr-2" />
            ADD TO WISHLIST
          </button>
          <button className="flex items-center justify-center border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
            <ShoppingBag className="w-4 h-4 mr-2" />
            ADD TO BAG
          </button>
        </div>
      </div>
      {isImageRight && (
        <div className="w-full md:w-1/3 mt-4 md:mt-0">
          <img src={image} alt={name} className="w-full h-auto object-contain" />
        </div>
      )}
    </div>
  );
  export default SneakerItem;