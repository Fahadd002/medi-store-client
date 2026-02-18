// components/home/CategorySection.tsx
import { HomeCategory } from "@/services/home.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Heart, 
  Brain, 
  Droplet, 
  Stethoscope,
  Baby,
  Thermometer,
  LucideIcon
} from "lucide-react";
import Link from "next/link";

interface CategorySectionProps {
  categories: HomeCategory[];
}

// Use LucideIcon type for all icon components
const iconMap: Record<string, LucideIcon> = {
  "Baby": Baby,
  "Cold & Flue": Thermometer,
  "Pain Relief": Heart,
  "Vitamins": Pill,
  "First Aid": Stethoscope,
  "Chronic Care": Brain,
  "Personal Care": Droplet,
};

export const CategorySection = ({ categories }: CategorySectionProps) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shop by Category
          </h2>
          <p className="text-gray-500 mt-1">
            Browse medicines by health concerns and categories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          // Get the icon from map or use Pill as default
          const Icon = iconMap[category.name] || Pill;
          
          return (
            <Link href={`/categories/${category.id}`} key={category.id}>
              <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-emerald-200">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                    <div className="relative w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Icon className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0">
                    {category.medicineCount} Items
                  </Badge>
                </div>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};