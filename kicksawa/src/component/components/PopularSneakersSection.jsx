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

const PopularSneakersSection = () => {
  const sneakers = [
    {
      name: "AIR FORCE 1",
      description: "The Air Force 1 '07 'Triple White' sneakers showcase a clean and classic design. With an all-white colorway, these iconic kicks offer a versatile and timeless opti...",
      image: "https://cdn.pixabay.com/photo/2020/07/15/18/21/shoe-5408627_960_720.png"
    },
    {
      name: "YEEZY BOOST 350",
      description: "The Yeezy Boost 350 V2 'Synth Reflective' sneakers bring a touch of luxury and style to your footwear collection. With a sleek reflective design, these Yeez...",
      image: "https://cdn.pixabay.com/photo/2024/05/14/16/14/ai-generated-8761573_960_720.jpg"
    },
    {
      name: "STAN SMITH",
      description: "The adidas Stan Smith sneakers are a timeless classic. With a clean and minimalistic design, these iconic shoes offer a versatile and stylish option for s...",
      image: "https://cdn.pixabay.com/photo/2017/09/20/11/47/sneakers-2768263_960_720.png"
    },
    {
      name: "AIR JORDAN 1 LOW",
      description: "The Wmns Air Jordan 1 Low 'Panda' sneakers offer a striking and stylish design. With a black and white colorway inspired by the iconic panda bear, these lo...",
      image: "https://cdn.pixabay.com/photo/2020/07/15/18/24/footwear-5408636_960_720.png"
    },
    {
      name: "AIR JORDAN 1",
      description: "Instead of the usual two-tone color blocking, the Air Jordan 1 Retro High OG 'Phantom' makes use of contrast stitching in black and red to distinguish th...",
      image: "https://cdn.pixabay.com/photo/2016/11/21/15/54/countryside-1846093_960_720.jpg"
    }
  ];

  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-bold text-center mb-8">POPULAR SNEAKERS</h2>
      <div className="max-w-4xl mx-auto">
        {sneakers.map((sneaker, index) => (
          <SneakerItem key={index} {...sneaker} isImageRight={index % 2 !== 0} />
        ))}
      </div>
    </section>
  );
};

export default PopularSneakersSection;