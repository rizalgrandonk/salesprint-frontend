import { Product } from "@/types/Product";
import Carousel from "react-multi-carousel";
import CustomCarouselDot from "../utils/CustomCarouselDot";
import FeaturedProductsItem from "./FeaturedProductsItem";

type FeaturedProductsCarouselProps = {
  products: Product[];
};

const FeaturedProductsCarousel = ({
  products,
}: FeaturedProductsCarouselProps) => {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <div className="relative pb-8">
      <Carousel
        draggable
        swipeable
        customDot={<CustomCarouselDot />}
        responsive={responsive}
        showDots={true}
        autoPlay={true}
        autoPlaySpeed={5000}
        arrows={false}
        renderDotsOutside
        infinite
      >
        {products.map((product) => (
          <FeaturedProductsItem key={product.id} product={product} />
        ))}
      </Carousel>
    </div>
  );
};

export default FeaturedProductsCarousel;
