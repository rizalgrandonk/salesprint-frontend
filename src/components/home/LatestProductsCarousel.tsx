import { Product } from "@/types/Product";
import { useState } from "react";
import Carousel from "react-multi-carousel";
import CustomCarouselDot from "../utils/CustomCarouselDot";
import LatestProductsItem from "./LatestProductsItem";

type LatestProductsCarouselProps = {
  products: Product[];
};

const LatestProductsCarousel = ({ products }: LatestProductsCarouselProps) => {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
    },
    tablet: {
      breakpoint: { max: 1024, min: 655 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 655, min: 0 },
      items: 1,
    },
  };

  const groupedProducts = groupObjects(products).sort(
    (a, b) => b.length - a.length
  );

  return (
    <div className="relative pb-8">
      <Carousel
        draggable
        swipeable
        customDot={<CustomCarouselDot />}
        showDots
        responsive={responsive}
        autoPlay={true}
        autoPlaySpeed={5000}
        arrows={false}
        renderDotsOutside
        infinite
      >
        {groupedProducts.map((prods, index) => (
          <div key={index}>
            {prods.map((product, index) => (
              <LatestProductsItem key={product.id} product={product} />
            ))}
          </div>
        ))}
      </Carousel>
    </div>
  );
};

function groupObjects<T>(inputArray: T[], by: number = 2): T[][] {
  const pairedArray: T[][] = [];
  let currentPair: T[] = [];

  for (const obj of inputArray) {
    if (currentPair.length < by) {
      currentPair.push(obj);
    } else {
      pairedArray.push(currentPair);
      currentPair = [obj];
    }
  }

  if (currentPair.length > 0) {
    pairedArray.push(currentPair);
  }

  return pairedArray;
}

export default LatestProductsCarousel;
