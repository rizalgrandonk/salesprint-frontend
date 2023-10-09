import { ratingToArray } from "@/lib/formater";
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
      {ratingsArray.map((item) => {
        if (item > 0 && item < 1) {
          return <RiStarHalfFill />;
        }
        if (item >= 1) {
          return <RiStarFill />;
        }
        return <RiStarLine />;
      })}
    </div>
  );
}
