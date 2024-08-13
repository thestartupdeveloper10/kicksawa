import ProductCard from "./ProductCard";

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