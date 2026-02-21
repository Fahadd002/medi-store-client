// components/home/FeaturedMedicines.tsx
"use client";

import { useState } from "react";
import { HomeMedicine } from "@/services/home.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Star,
  Heart,
  Eye,
  Package,
  ArrowRight,
  Shield,
  Truck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FeaturedMedicinesProps {
  medicines: HomeMedicine[];
}

export const FeaturedMedicines = ({ medicines }: FeaturedMedicinesProps) => {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (medicineId: string) => {
    setWishlist(prev => {
      if (prev.includes(medicineId)) {
        toast.info("Removed from wishlist");
        return prev.filter(id => id !== medicineId);
      } else {
        toast.success("Added to wishlist");
        return [...prev, medicineId];
      }
    });
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : i < rating
                  ? "text-yellow-400 fill-yellow-400/50"
                  : "text-gray-300"
              }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Featured Medicines
          </h2>
          <p className="text-gray-500 mt-1">
            Most popular and trusted medicines
          </p>
        </div>
        <Link href="/medicines">
          <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
            View All Medicines
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {medicines.map((medicine) => {
          const discountedPrice = calculateDiscountedPrice(medicine.basePrice, medicine.discountPercent);
          const isInWishlist = wishlist.includes(medicine.id);

          return (
            <Card
              key={medicine.id}
              className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-200"
            >
              {/* Image Section */}
              <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-gray-50 overflow-hidden">
                {medicine.photoUrl ? (
                  <img
                    src={medicine.photoUrl}
                    alt={medicine.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-emerald-300" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {medicine.discountPercent && medicine.discountPercent > 0 && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white border-0">
                      -{medicine.discountPercent}%
                    </Badge>
                  )}
                  {medicine.stock <= 10 && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                      Low Stock
                    </Badge>
                  )}
                </div>

                {/* Wishlist Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleWishlist(medicine.id)}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md"
                >
                  <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                </Button>

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push(`/medicines/${medicine.id}`)}
                    className="bg-white text-gray-900 hover:bg-emerald-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Quick View
                  </Button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4">
                {/* Category & Seller */}
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {medicine.category.name}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    by {medicine.seller.name}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {medicine.name}
                </h3>

                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {medicine.description}
                </p>

                {/* Rating */}
                <div className="mb-3">
                  {renderStars(medicine.averageRating)}
                </div>

                {/* Price */}
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <span className="text-xl font-bold text-emerald-700">
                      {formatPrice(discountedPrice)}
                    </span>
                    {medicine.discountPercent && medicine.discountPercent > 0 && (
                      <span className="ml-2 text-xs text-gray-400 line-through">
                        {formatPrice(medicine.basePrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">per {medicine.unit || 'unit'}</span>
                </div>

                {/* Delivery Info */}
                <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    <span>Free</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Authentic</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    toast.success(`${medicine.name} added to cart`);
                    // Add to cart logic here
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};