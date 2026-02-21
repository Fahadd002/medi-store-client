"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getOrderById } from "@/actions/order.action";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  ShoppingBag,
  Star,
  MessageSquare,
  Reply,
  ThumbsUp,
  Shield
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import SellerReplyDialog from "@/components/modules/review/SellerReplyDialog";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  medicineId: string;
  quantity: number;
  price: number;
  medicine?: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    price: number;
    reviews?: Review[];
  };
}

interface Review {
  id: string;
  rating: number | null;
  comment: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<{
    id: string;
    customerName: string;
    comment: string;
  } | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getOrderById(orderId);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data) {
        setOrder(result.data);
      } else {
        setError("Order not found");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setError(error instanceof Error ? error.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleReplyClick = (review: Review, customerName: string) => {
    setSelectedReview({
      id: review.id,
      customerName,
      comment: review.comment || ""
    });
    setReplyDialogOpen(true);
  };

  const handleReplySuccess = () => {
    toast.success("Reply submitted successfully!");
    setReplyDialogOpen(false);
    // Refresh order data to show the new reply
    fetchOrder();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PLACED":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "PROCESSING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PLACED":
        return "Placed";
      case "PROCESSING":
        return "Processing";
      case "SHIPPED":
        return "Shipped";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const getAverageRating = (reviews?: Review[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const validReviews = reviews.filter(r => r.rating !== null);
    if (validReviews.length === 0) return 0;
    const total = validReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return total / validReviews.length;
  };

  // Check if a customer review has a seller reply
  const hasSellerReply = (reviews: Review[], customerReviewId: string) => {
    return reviews.some(review =>
      review.seller &&
      review.id !== customerReviewId
    );
  };

  // Find unreplied customer reviews
  const getUnrepliedReviews = (reviews?: Review[]) => {
    if (!reviews) return [];
    return reviews.filter(review =>
      review.customer &&
      !hasSellerReply(reviews, review.id)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-emerald-400 mx-auto mb-4 animate-pulse" />
              <p className="text-emerald-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-8">
        <div className="container mx-auto px-4">
          <Card className="border-red-200 p-8 text-center max-w-md mx-auto">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Order</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/seller-dashboard/orders")}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <Button onClick={fetchOrder}>
                <Package className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-8">
        <div className="container mx-auto px-4">
          <Card className="border-emerald-200 p-8 text-center max-w-md mx-auto">
            <Package className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">Order Not Found</h3>
            <p className="text-emerald-600 mb-4">The order you are looking for does not exist.</p>
            <Button
              onClick={() => router.push("/seller-dashboard/orders")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href={`/seller-dashboard/orders`}>
                  <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-emerald-900">Order Details</h1>
              </div>
              <p className="text-emerald-600">Order #{order.orderNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <Card className="border-emerald-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900">Order Status</h3>
                    <Badge className={`${getStatusColor(order.status)} font-medium`}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-emerald-900">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Order Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <p className="font-medium">{formatDate(order.updatedAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Items</p>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-emerald-600" />
                    <p className="font-medium">{order.items.length} items</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="border-emerald-200 p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const avgRating = getAverageRating(item.medicine?.reviews);
                  const unrepliedReviews = getUnrepliedReviews(item.medicine?.reviews);

                  return (
                    <div key={item.id} className="border border-emerald-100 rounded-lg p-4">
                      <div className="flex gap-4">
                        {item.medicine?.image ? (
                          <img
                            src={item.medicine.image}
                            alt={item.medicine.name}
                            className="h-20 w-20 object-cover rounded-lg border border-emerald-200"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-emerald-100 rounded-lg border border-emerald-200 flex items-center justify-center">
                            <Package className="h-10 w-10 text-emerald-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{item.medicine?.name}</h4>
                              {item.medicine?.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {item.medicine.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-emerald-900">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>

                          {/* Reviews Section */}
                          {item.medicine?.reviews && item.medicine.reviews.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-emerald-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium text-sm">{avgRating.toFixed(1)}</span>
                                  <span className="text-sm text-gray-500">
                                    ({item.medicine.reviews.length} review{item.medicine.reviews.length !== 1 ? 's' : ''})
                                  </span>
                                </div>
                                {unrepliedReviews.length > 0 && (
                                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                                    {unrepliedReviews.length} to reply
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-3">
                                {item.medicine.reviews.slice(0, 2).map((review) => {
                                  const isCustomerReview = !!review.customer;
                                  const isSellerReply = !!review.seller;
                                  const hasReply = hasSellerReply(item.medicine?.reviews || [], review.id);

                                  return (
                                    <div
                                      key={review.id}
                                      className={`rounded p-3 ${isSellerReply
                                          ? 'ml-6 bg-blue-50/50 border-l-4 border-blue-200'
                                          : 'bg-emerald-50/50'
                                        }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          {isCustomerReview ? (
                                            <>
                                              <User className="h-4 w-4 text-emerald-600" />
                                              <span className="font-medium text-sm">{review.customer?.name}</span>
                                              <Badge variant="outline" className="h-5 text-xs border-emerald-200 text-emerald-700">
                                                Customer
                                              </Badge>
                                            </>
                                          ) : isSellerReply ? (
                                            <>
                                              <Shield className="h-4 w-4 text-blue-600" />
                                              <span className="font-medium text-sm">{review.seller?.name}</span>
                                              <Badge variant="outline" className="h-5 text-xs border-blue-200 text-blue-700">
                                                Seller
                                              </Badge>
                                            </>
                                          ) : null}
                                        </div>
                                        {review.rating !== null && isCustomerReview && (
                                          <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-medium">{review.rating}</span>
                                          </div>
                                        )}
                                      </div>

                                      {review.comment && (
                                        <div className="mb-2">
                                          <p className="text-sm text-gray-700">{review.comment}</p>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500">
                                          {formatDate(review.createdAt)}
                                        </p>

                                        {isCustomerReview && !hasReply && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleReplyClick(review, review.customer?.name || "Customer")}
                                            className="h-7 text-xs text-emerald-700 hover:bg-emerald-100"
                                          >
                                            <Reply className="h-3 w-3 mr-1" />
                                            Reply
                                          </Button>
                                        )}

                                        {isSellerReply && (
                                          <Badge variant="outline" className="h-5 text-xs border-blue-200 text-blue-700">
                                            <ThumbsUp className="h-3 w-3 mr-1" />
                                            Replied
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* View More Reviews Button */}
                                {item.medicine.reviews.length > 2 && (
                                  <div className="flex justify-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-emerald-700 hover:bg-emerald-50"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      View all {item.medicine.reviews.length} reviews
                                    </Button>
                                  </div>
                                )}

                                {/* Reply to All Button if there are unreplied reviews */}
                                {unrepliedReviews.length > 0 && (
                                  <div className="pt-2 border-t border-emerald-100">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const firstUnreplied = unrepliedReviews[0];
                                        if (firstUnreplied) {
                                          handleReplyClick(
                                            firstUnreplied,
                                            firstUnreplied.customer?.name || "Customer"
                                          );
                                        }
                                      }}
                                      className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    >
                                      <Reply className="h-4 w-4 mr-2" />
                                      Reply to Review{unrepliedReviews.length > 1 ? ` (${unrepliedReviews.length} pending)` : ''}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-900">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Customer & Shipping Info */}
          <div className="space-y-6">
            <Card className="border-emerald-200 p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Customer Information
              </h3>
              {order.customer ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="font-medium">{order.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <p className="font-medium">{order.customer.email}</p>
                    </div>
                  </div>
                  {order.customer.phone && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        <p className="font-medium">{order.customer.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Customer information not available</p>
              )}
            </Card>

            {/* Shipping Information */}
            <Card className="border-emerald-200 p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Shipping Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <p className="font-medium">{order.shippingAddress}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <p className={`font-medium ${order.status === "DELIVERED" ? "text-green-600" :
                        order.status === "CANCELLED" ? "text-red-600" :
                          "text-emerald-700"
                      }`}>
                      {getStatusText(order.status)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Actions */}
            <Card className="border-emerald-200 p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Order Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Package className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
                <Button variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                {order.status === "DELIVERED" && (
                  <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Star className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Seller Reply Dialog */}
      <SellerReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        reviewId={selectedReview?.id || ''}
        customerName={selectedReview?.customerName || ''}
        customerComment={selectedReview?.comment || ''}
        onSuccess={handleReplySuccess}
      />
    </div>
  );
}