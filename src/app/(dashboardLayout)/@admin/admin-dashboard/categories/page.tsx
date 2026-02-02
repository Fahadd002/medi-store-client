import { CategoriesTable } from "@/components/modules/categories/fetchCategories";


export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-1 space-y-8">
       <CategoriesTable />
      </div>
  );
}