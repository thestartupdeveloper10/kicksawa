import adidas from '../../assets/imgs/adidas.svg'
import nike from '../../assets/imgs/nike.svg'
import givenchy from '../../assets/imgs/givenchy.svg'
import bvlgari from '../../assets/imgs/bvlgari.svg'

const ExclusiveBrandsSection = () => {
  const brands = [
    { name: 'Adidas', logo: adidas },
    { name: 'Bvlgari', logo: bvlgari },
    { name: 'Givenchy', logo: nike },
    { name: 'Nike', logo: givenchy },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12">EXCLUSIVE BRANDS</h2>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 lg:gap-20">
          {brands.map((brand) => (
            <div key={brand.name} className="w-1/2 sm:w-1/4 flex justify-center">
              <img 
                src={brand.logo} 
                alt={`${brand.name} logo`} 
                className="h-12 md:h-16 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExclusiveBrandsSection;