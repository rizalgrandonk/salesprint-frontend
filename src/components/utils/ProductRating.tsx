import { ratingToArray } from "@/lib/formater";
import { Fragment } from "react";
import { RiStarFill, RiStarHalfFill, RiStarLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

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
      className={twMerge(
        "flex items-center gap-0.5 text-lg text-yellow-500",
        className
      )}
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
