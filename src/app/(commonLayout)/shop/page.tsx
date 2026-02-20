"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  Package,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  X,
  Pill,
  Sparkles,
  Zap,
  CheckCircle,
} from "lucide-react";
import { Skeleton } from "@/components/layout/skeleton";
import CategorySelectClient from "@/components/modules/categories/CategorySelectClient";
import { toast } from "sonner";
import { getMedicines } from "@/actions/medicine.action";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";

interface Medicine {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  manufacturer: string;
  expiryDate?: string;
  isActive: boolean;
  categoryId: string;
  photoUrl?: string;
  category: {
    id: string;
    name: string;
  };
  unit?: string;
  stock?: number;
  discountPercent?: number;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  seller?: {
    id: string;
    name: string;
  };
}

type SortOption = "name" | "createdAt" | "basePrice" | "basePrice_desc";

export default function ShopMedicinesPage() {
  const router = useRouter();
  const { cart: cartItems, addToCart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState("12");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * parseInt(limit);

      let sortOrder: "asc" | "desc" = "desc";
      let actualSortBy = sortBy;

      if (sortBy === "basePrice_desc") {
        actualSortBy = "basePrice";
        sortOrder = "desc";
      } else if (sortBy === "basePrice") {
        sortOrder = "asc";
      }

      const { data, error } = await getMedicines({
        search,
        categoryId: categoryFilter || undefined,
        page: page.toString(),
        limit,
        skip: skip.toString(),
        sortBy: actualSortBy,
        sortOrder,
        isActive: true,
      });

      if (error) throw new Error(error.message);

      if (data) {
        setMedicines(data.data || []);
        setTotalPages(data.pagination?.totalPage || 1);
      }
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
      toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, categoryFilter, sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        fetchMedicines();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, limit, categoryFilter, sortBy]);

  useEffect(() => {
    fetchMedicines();
  }, [page]);

  const toggleWishlist = (medicineId: string) => {
    setWishlist(prev => {
      const isInWishlist = prev.includes(medicineId);
      if (isInWishlist) {
        toast.info("Removed from wishlist");
        return prev.filter(id => id !== medicineId);
      } else {
        toast.info("Added to wishlist");
        return [...prev, medicineId];
      }
    });
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating)
              ? "text-yellow-500 fill-yellow-500"
              : i < rating
                ? "text-yellow-500 fill-yellow-500/50"
                : "text-gray-300"
              }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const viewProductDetail = (medicineId: string) => {
    router.push(`/shop/${medicineId}`);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Add items to proceed to checkout.");
      return;
    }

    router.push("/checkout");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Pill className="h-6 w-6 text-emerald-200" />
                <h1 className="text-2xl md:text-3xl font-bold">Shop Medicines</h1>
              </div>
              <p className="text-emerald-100 text-sm md:text-base max-w-2xl">
                Quality medicines from trusted brands. Fast delivery and expert guidance.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-emerald-200" />
                <span className="text-sm font-medium">100% Authentic</span>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                <Zap className="h-4 w-4 text-emerald-200" />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-200" />
                <span className="text-sm font-medium">Quality Assured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Trust Badges */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-emerald-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
            <div className="p-1.5 bg-emerald-100 rounded-md">
              <Truck className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Free Delivery</p>
              <p className="text-[10px] text-gray-500">Over ৳1000</p>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
            <div className="p-1.5 bg-emerald-100 rounded-md">
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Verified</p>
              <p className="text-[10px] text-gray-500">100% Authentic</p>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
            <div className="p-1.5 bg-emerald-100 rounded-md">
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">In Stock</p>
              <p className="text-[10px] text-gray-500">Ready to Ship</p>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
            <div className="p-1.5 bg-emerald-100 rounded-md">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Easy Returns</p>
              <p className="text-[10px] text-gray-500">30-Day Policy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-emerald-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-emerald-900">Filters</h3>
                <Filter className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                    Search Medicines
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-emerald-500 h-3.5 w-3.5" />
                    <Input
                      placeholder="Search by name or brand..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-9 text-sm cursor-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                    Category
                  </label>
                  <CategorySelectClient
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value)}
                    placeholder="All Categories"
                    disabled={false}
                    className="border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-9 text-sm cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-700 mb-1.5">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-9 text-sm cursor-pointer">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name" className="cursor-pointer text-sm">Name (A-Z)</SelectItem>
                      <SelectItem value="createdAt" className="cursor-pointer text-sm">Newest First</SelectItem>
                      <SelectItem value="basePrice" className="cursor-pointer text-sm">Price (Low to High)</SelectItem>
                      <SelectItem value="basePrice_desc" className="cursor-pointer text-sm">Price (High to Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Cart Summary */}
            <Card className="border-emerald-200 p-4 shadow-sm sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-emerald-900">Your Cart</h3>
                <div className="relative">
                  <ShoppingCart className="h-4 w-4 text-emerald-600" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                      {cartItems.length}
                    </span>
                  )}
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-4">
                  <ShoppingCart className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                  <p className="text-emerald-600 text-sm font-medium">Your cart is empty</p>
                  <p className="text-emerald-500 text-xs">Add items to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {cartItems.map((item) => {
                      const itemPrice = calculateDiscountedPrice(item.basePrice, item.discountPercent);
                      const totalPrice = itemPrice * item.quantity;

                      return (
                        <div key={item.id} className="border border-emerald-200 rounded-md p-2.5">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex-1">
                              <p className="font-medium text-xs text-gray-900 truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-500">{formatPrice(itemPrice)} each</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="h-5 w-5 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <X className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-6 w-6 p-0 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </Button>
                              <span className="text-xs font-medium text-gray-900 min-w-6 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-6 w-6 p-0 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                            <span className="text-xs font-semibold text-emerald-900">
                              {formatPrice(totalPrice)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-semibold text-emerald-600">Free</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold border-t border-emerald-200 pt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-emerald-700">{formatPrice(getTotalPrice())}</span>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full h-9 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-medium rounded-md cursor-pointer"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-900">Medicines</h2>
                <p className="text-emerald-600 text-xs">
                  {loading ? "Loading..." : `Showing ${medicines.length} products`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger className="border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-8 w-16 cursor-pointer text-xs">
                    <SelectValue placeholder="Show" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12" className="cursor-pointer text-xs">12</SelectItem>
                    <SelectItem value="24" className="cursor-pointer text-xs">24</SelectItem>
                    <SelectItem value="48" className="cursor-pointer text-xs">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: parseInt(limit) }, (_, i) => (
                  <Card key={i} className="border-emerald-200 overflow-hidden">
                    <div className="p-3">
                      <Skeleton className="h-40 w-full mb-3 rounded-md" />
                      <Skeleton className="h-3.5 w-3/4 mb-1.5" />
                      <Skeleton className="h-3 w-1/2 mb-3" />
                      <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : medicines.length === 0 ? (
              <Card className="border-emerald-200 p-8 text-center">
                <Search className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-emerald-900 mb-1.5">No medicines found</h3>
                <p className="text-emerald-600 text-sm">
                  {search || categoryFilter ? "Try adjusting your filters" : "No medicines available"}
                </p>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {medicines.map((medicine) => {
                    const discountedPrice = calculateDiscountedPrice(medicine.basePrice, medicine.discountPercent);
                    const isInWishlist = wishlist.includes(medicine.id);
                    const cartItem = cartItems.find(item => item.id === medicine.id);
                    const cartQuantity = cartItem?.quantity || 0;

                    return (
                      <Card key={medicine.id} className="group border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 overflow-hidden">

                        <div className="relative h-40 bg-emerald-50 overflow-hidden">
                          {medicine.photoUrl ? (
                            <img
                              src={medicine.photoUrl}
                              alt={medicine.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                              onClick={() => viewProductDetail(medicine.id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-emerald-300" />
                            </div>
                          )}

                          {/* Discount Badge */}
                          {medicine.discountPercent && medicine.discountPercent > 0 && (
                            <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold cursor-pointer px-1.5 py-0">
                              -{medicine.discountPercent}%
                            </Badge>
                          )}

                          {/* Wishlist Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleWishlist(medicine.id)}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/90 hover:bg-white shadow-sm cursor-pointer"
                          >
                            <Heart className={`h-3 w-3 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                          </Button>

                          {/* View Details Overlay */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => viewProductDetail(medicine.id)}
                              className="bg-white text-emerald-700 hover:bg-emerald-50 cursor-pointer text-xs h-7"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-3">
                          {/* Category */}
                          <div className="mb-1.5">
                            <Badge variant="outline" className="text-[10px] border-emerald-300 bg-emerald-50 text-emerald-700 cursor-pointer px-1.5 py-0">
                              {medicine.category.name}
                            </Badge>
                          </div>
                          <h3
                            className="font-semibold text-gray-900 text-sm mb-1 truncate cursor-pointer hover:text-emerald-600 transition-colors"
                            onClick={() => viewProductDetail(medicine.id)}
                          >
                            {medicine.name}
                          </h3>
                          <p className="text-[10px] text-gray-500 mb-2 truncate">{medicine.manufacturer}</p>

                          {/* Rating */}
                          {medicine.rating && (
                            <div className="flex items-center gap-1.5 mb-2">
                              {renderStars(medicine.rating)}
                              <span className="text-[10px] text-gray-500">
                                ({medicine.reviewsCount || 0})
                              </span>
                            </div>
                          )}

                          {/* Price */}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-base font-bold text-emerald-900">
                                {formatPrice(discountedPrice)}
                              </span>
                              {medicine.discountPercent && medicine.discountPercent > 0 && (
                                <span className="ml-1.5 text-xs text-gray-400 line-through">
                                  {formatPrice(medicine.basePrice)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500">per {medicine.unit || 'unit'}</span>
                          </div>

                          {cartQuantity > 0 ? (
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(medicine.id, cartQuantity - 1)}
                                  className="h-7 w-7 p-0 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-xs font-medium text-gray-900 min-w-6 text-center">
                                  {cartQuantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(medicine.id, cartQuantity + 1)}
                                  disabled={cartQuantity >= (medicine.stock || 0)}
                                  className="h-7 w-7 p-0 border-emerald-300 hover:bg-emerald-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeFromCart(medicine.id)}
                                className="h-7 cursor-pointer text-xs"
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart({
                                id: medicine.id,
                                name: medicine.name,
                                basePrice: medicine.basePrice,
                                discountPercent: medicine.discountPercent,
                                photoUrl: medicine.photoUrl,
                                unit: medicine.unit,
                                stock: medicine.stock,
                                sellerId: medicine.sellerId,
                                sellerName: medicine.seller?.name, 
                              })}
                              disabled={(medicine.stock || 0) <= 0}
                              className="w-full h-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <ShoppingCart className="h-3 w-3 mr-1.5" />
                              {(medicine.stock || 0) > 0 ? "Add to Cart" : "Out of Stock"}
                            </Button>
                          )}

                          {/* Stock Info */}
                          <div className="mt-2 text-[10px] text-gray-500 flex items-center justify-between">
                            <span>
                              Stock: {medicine.stock || 0} {medicine.unit || 'units'}
                            </span>
                            {(medicine.stock || 0) <= 10 && (medicine.stock || 0) > 0 && (
                              <span className="text-amber-600 font-medium">Low stock!</span>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-emerald-200">
                    <div className="text-xs text-emerald-700">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-7 px-3 text-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft className="h-3 w-3 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-7 px-3 text-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}