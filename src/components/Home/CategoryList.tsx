import { Category } from "@/types/Category";
import CategoriesItem from "./CategoriesItem";

type CategoryListProps = {
  categories: Category[];
};

export default function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 auto-rows-[120px] lg:auto-rows-[240px] gap-3">
      {categories.map((category, index) => (
        <CategoriesItem key={category.id} category={category} index={index} />
      ))}
    </div>
  );
}
