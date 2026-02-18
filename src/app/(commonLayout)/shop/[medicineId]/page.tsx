'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMedicineById } from '@/actions/medicine.action';
import Image from 'next/image';
import { Star, Package, Calendar, Building, User, ShoppingCart, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useCart } from '@/contexts/cart-context';

// Define types for the medicine data
interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  parentId: string | null; // Add this field
  customer: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
}

interface MedicineData {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  discountPercent: number;
  stock: number;
  manufacturer: string;
  expiryDate: string;
  isActive: boolean;
  photoUrl: string;
  unit: string;
  category?: Category;
  seller?: Seller;
  reviews: Review[];
  _count?: {
    reviews: number;
  };
  averageRating?: number;
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Type for the API response
interface ApiResponse {
  success: boolean;
  data?: MedicineData;
  error?: string;
}

const MedicineDetails = () => {
  const params = useParams();
  const id = params.medicineId as string;
  const [medicine, setMedicine] = useState<MedicineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get cart functions from context
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        const result = await getMedicineById(id);

        console.log('API Response:', result); // Debug log

        // Based on your console log, the data is nested: result.data.data
        if (result.data) {
          // The data is in result.data.data
          const apiResponse = result.data as ApiResponse;
          if (apiResponse.success && apiResponse.data) {
            setMedicine(apiResponse.data);
          } else {
            setError('Failed to fetch medicine details');
          }
        } else if (result.data) {
          // Try direct access
          setMedicine(result.data as MedicineData);
        } else {
          setError('Failed to fetch medicine details');
        }
      } catch (error) {
        console.error('Error fetching medicine:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMedicine();
  }, [id]);

  const calculateDiscountedPrice = (basePrice: number, discountPercent: number) => {
    return basePrice - (basePrice * discountPercent) / 100;
  };

  const getRatingPercentage = (rating: 1 | 2 | 3 | 4 | 5, medicineData: MedicineData | null) => {
    if (!medicineData || !medicineData.ratingDistribution || !medicineData._count || medicineData._count.reviews === 0) return 0;
    return (medicineData.ratingDistribution[rating] / medicineData._count.reviews) * 100;
  };

  // Safe date formatting function
  const formatDateSafe = (dateString: string | undefined | null): string => {
    if (!dateString) return 'Not specified';

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid date';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!medicine) return;

    if (!medicine.isActive || (medicine.stock || 0) <= 0) {
      toast.error('This medicine is out of stock');
      return;
    }

    addToCart({
      id: medicine.id,
      name: medicine.name,
      basePrice: medicine.basePrice,
      discountPercent: medicine.discountPercent,
      photoUrl: medicine.photoUrl,
      unit: medicine.unit,
      stock: medicine.stock,
      sellerId: medicine.seller?.id || '',
      sellerName: medicine.seller?.name,
    });

    toast.success(`${medicine.name} added to cart`);
  };

  // Handle quantity update
  const handleQuantityUpdate = (newQuantity: number) => {
    if (!medicine) return;

    if (newQuantity < 1) {
      removeFromCart(medicine.id);
      toast.success(`${medicine.name} removed from cart`);
    } else {
      updateQuantity(medicine.id, newQuantity);
      toast.info(`${medicine.name} quantity updated to ${newQuantity}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Medicine not found'}</p>
        </div>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice(medicine.basePrice || 0, medicine.discountPercent || 0);
  const categoryName = medicine.category?.name || 'Uncategorized';
  const sellerName = medicine.seller?.name || 'Unknown Seller';
  const sellerEmail = medicine.seller?.email || 'No email provided';
  const sellerPhone = medicine.seller?.phone || 'No phone provided';
  const sellerImage = medicine.seller?.image;
  const averageRating = medicine.averageRating || 0;
  const reviewCount = medicine._count?.reviews || 0;
  const ratingDistribution = medicine.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // Check if medicine is in cart
  const cartItem = cart.find(item => item.id === medicine.id);
  const cartQuantity = cartItem?.quantity || 0;

  // Filter reviews where parentId is null (main reviews, not replies)
  const mainReviews = medicine.reviews?.filter(review => review.parentId === null) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="relative h-96 w-full mb-4">
                {medicine.photoUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={medicine.photoUrl}
                      alt={medicine.name}
                      fill
                      className="object-contain rounded-lg"
                      unoptimized={true}
                      onError={() => {
                        // Handle image loading errors
                        console.error('Failed to load image:', medicine.photoUrl);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {categoryName}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${medicine.isActive
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                    }`}>
                    {medicine.isActive ? 'Available' : 'Out of Stock'}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900">{medicine.name}</h1>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(averageRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {averageRating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed">{medicine.description}</p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Manufacturer:</span>
                    <span className="font-medium">{medicine.manufacturer}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Unit:</span>
                    <span className="font-medium">{medicine.unit}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Expiry:</span>
                    <span className="font-medium">
                      {formatDateSafe(medicine.expiryDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-medium ${(medicine.stock || 0) > 10 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {medicine.stock || 0} items
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            {medicine.seller && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    {sellerImage ? (
                      <Image
                        src={sellerImage}
                        alt={sellerName}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{sellerName}</h3>
                    <p className="text-gray-600">{sellerEmail}</p>
                    <p className="text-gray-600">{sellerPhone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Pricing, Reviews, and Actions */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${discountedPrice.toFixed(2)}
                    </span>
                    {(medicine.discountPercent || 0) > 0 && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          ${(medicine.basePrice || 0).toFixed(2)}
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                          {medicine.discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">Inclusive of all taxes</p>
                </div>

                {/* Cart Controls */}
                {cartQuantity > 0 ? (
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityUpdate(cartQuantity - 1)}
                        className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 text-lg font-semibold">
                        {cartQuantity}
                      </span>
                      <button
                        onClick={() => handleQuantityUpdate(cartQuantity + 1)}
                        disabled={cartQuantity >= (medicine.stock || 0)}
                        className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(medicine.id);
                        toast.success(`${medicine.name} removed from cart`);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!medicine.isActive || (medicine.stock || 0) <= 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition duration-300 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>
                      {!medicine.isActive || (medicine.stock || 0) <= 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </span>
                  </button>
                )}

                <div className="pt-4 border-t">
                  <h3 className="font-bold text-gray-900 mb-2">Delivery Information</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Free delivery on orders above 1000 taka</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Estimated delivery: 2-3 business days</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Easy returns within 7 days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>

              <div className="flex items-center mb-6">
                <div className="text-center mr-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(averageRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {reviewCount} reviews
                  </div>
                </div>

                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center mb-1">
                      <div className="w-10 text-sm text-gray-600">{rating} star</div>
                      <div className="flex-1 mx-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{
                              width: `${getRatingPercentage(
                                rating as 1 | 2 | 3 | 4 | 5,
                                medicine
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-10 text-sm text-gray-600 text-right">
                        {ratingDistribution[rating as keyof typeof ratingDistribution]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List*/}
            {mainReviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews ({mainReviews.length})</h3>
                <div className="space-y-6">
                  {mainReviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {review.customer?.image ? (
                              <Image
                                src={review.customer.image}
                                alt={review.customer?.name || 'Anonymous'}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{review.customer?.name || 'Anonymous'}</h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < (review.rating || 0)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDateSafe(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;