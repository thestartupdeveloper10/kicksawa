import SneakerItem from "./SneakerItem";

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