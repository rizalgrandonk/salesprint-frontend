import { ratingToArray } from "@/lib/formater";
import { Fragment } from "react";
import { RiStarFill, RiStarHalfFill, RiStarLine } from "react-icons/ri";

export default function ProductRating({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  const ratingsArray = ratingToArray(rating);
  return (
    <div
      className={`flex items-center gap-1 text-lg text-yellow-500 ${
        className || ""
      }`}
    >
      {ratingsArray.map((item, index) => (
        <Fragment key={index}>
          {item > 0 && item < 1 && <RiStarHalfFill />}
          {item >= 1 && <RiStarFill />}
          {item <= 0 && <RiStarLine />}
        </Fragment>
      ))}
    </div>
  );
}
