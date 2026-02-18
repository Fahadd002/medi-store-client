// components/home/TopSellers.tsx
import { HomeSeller } from "@/services/home.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Package, Star, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TopSellersProps {
  sellers: HomeSeller[];
}

export const TopSellers = ({ sellers }: TopSellersProps) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Top Sellers
          </h2>
          <p className="text-gray-500 mt-1">
            Trusted pharmacies and healthcare providers
          </p>
        </div>
        <Link href="/sellers">
          <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
            View All Sellers
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sellers.map((seller) => (
          <Link href={`/sellers/${seller.id}`} key={seller.id}>
            <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-emerald-200 p-6">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Seller Image */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                <div className="relative w-24 h-24 mx-auto">
                  {seller.image ? (
                    <img
                      src={seller.image}
                      alt={seller.name}
                      className="w-full h-full rounded-full object-cover border-4 border-emerald-100 group-hover:border-emerald-200 transition-colors"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center border-4 border-emerald-100 group-hover:border-emerald-200 transition-colors">
                      <Store className="h-10 w-10 text-emerald-600" />
                    </div>
                  )}
                </div>

                {/* Rating Badge */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white border-0 whitespace-nowrap">
                    <Star className="h-3 w-3 fill-white mr-1" />
                    4.8 (120+)
                  </Badge>
                </div>
              </div>

              {/* Seller Info */}
              <div className="text-center mt-4">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                  {seller.name}
                </h3>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-3">
                  <Package className="h-4 w-4" />
                  <span>{seller.medicineCount} Medicines</span>
                </div>

                {/* Location (Mock Data) */}
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span>Verified Seller</span>
                </div>
              </div>

              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};