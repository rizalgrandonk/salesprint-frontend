import { Product } from "@/types/Product";
import { PropsWithChildren } from "react";
import Carousel from "react-multi-carousel";
import CustomCarouselDot from "../utils/CustomCarouselDot";

const StoreBannersCarousel = ({ children }: PropsWithChildren) => {
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
    <div className="relative">
      <Carousel
        draggable
        swipeable
        customDot={<CustomCarouselDot />}
        responsive={responsive}
        showDots={true}
        autoPlay={true}
        autoPlaySpeed={5000}
        arrows
        infinite
        dotListClass="py-4"
      >
        {children}
      </Carousel>
    </div>
  );
};

export default StoreBannersCarousel;
