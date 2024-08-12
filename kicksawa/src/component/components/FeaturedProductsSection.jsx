import { Heart, ShoppingBag } from 'lucide-react';

const ProductCard = ({ image, category, name, price }) => (
  <div className="border border-gray-200 p-4 flex flex-col">
    <div className="relative mb-4">
      <img src={image} alt={name} className="w-full h-48 object-contain" />
      <div className="absolute top-2 right-2 flex space-x-2">
        <button className="p-1 bg-white rounded-full shadow">
          <Heart className="w-5 h-5" />
        </button>
        <button className="p-1 bg-white rounded-full shadow">
          <ShoppingBag className="w-5 h-5" />
        </button>
      </div>
    </div>
    <div className="text-sm text-gray-500 mb-1">{category}</div>
    <h3 className="font-semibold text-sm mb-2 flex-grow">{name}</h3>
    <div className="font-bold">LKR {price.toLocaleString()}</div>
  </div>
);

const FeaturedProductsSection = () => {
  const products = [
    {
      image: "https://images.unsplash.com/photo-1516767254874-281bffac9e9a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "CATEGORY",
      name: "CRISTIANO RONALDO CR7 R...",
      price: 21000.00
    },
    {
      image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "CATEGORY",
      name: "NIKE AIR JORDAN 1 RETRO LOW G...",
      price: 21000.00
    },
    {
      image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "CATEGORY",
      name: "ADIDAS EEZAY FLIP-FLOPS 'CO...",
      price: 21000.00
    },
    {
      image: "https://images.unsplash.com/photo-1515555230216-82228b88ea98?q=80&w=1452&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "CATEGORY",
      name: "NIKE AIR JORDAN 1 MID SE 'OLYMP...",
      price: 21000.00
    }
  ];

  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-bold text-center mb-8">FEATURED</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;