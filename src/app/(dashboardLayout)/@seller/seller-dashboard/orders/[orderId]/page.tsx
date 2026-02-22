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
  Shield,
  ChevronDown,
  ChevronUp
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
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getOrderById(orderId);

      if (result.error) throw new Error(result.error.message);
      if (!result.data) throw new Error("Order not found");

      setOrder(result.data);
    } catch (error) {
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
    fetchOrder();
  };

  const toggleReview = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      PLACED: <Package className="h-4 w-4 text-blue-500" />,
      PROCESSING: <Clock className="h-4 w-4 text-yellow-500" />,
      SHIPPED: <Truck className="h-4 w-4 text-purple-500" />,
      DELIVERED: <CheckCircle className="h-4 w-4 text-green-500" />,
      CANCELLED: <XCircle className="h-4 w-4 text-red-500" />
    };
    return icons[status as keyof typeof icons] || <Package className="h-4 w-4 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PLACED: "bg-blue-100 text-blue-800 border-blue-200",
      PROCESSING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
      DELIVERED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatPrice = (price: number) => `৳${price.toFixed(2)}`;
  const formatDate = (dateString: string) => format(new Date(dateString), 'MMM dd, yyyy hh:mm a');

  const getAverageRating = (reviews?: Review[]) => {
    if (!reviews?.length) return 0;
    const validReviews = reviews.filter(r => r.rating !== null);
    if (!validReviews.length) return 0;
    return validReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / validReviews.length;
  };

  const hasSellerReply = (reviews: Review[], customerReviewId: string) => {
    return reviews.some(review => review.seller && review.id !== customerReviewId);
  };

  const getUnrepliedReviews = (reviews?: Review[]) => {
    return reviews?.filter(review => review.customer && !hasSellerReply(reviews, review.id)) || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Package className="h-12 w-12 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6 text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error || "Order not found"}</p>
            <Button onClick={() => router.push("/seller-dashboard/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/seller-dashboard/orders">
              <Button variant="ghost" size="sm" className="text-emerald-700">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-emerald-900">Order #{order.orderNumber}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold">Order Status</h3>
                    <Badge className={`${getStatusColor(order.status)} mt-1`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-emerald-900">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order Date</p>
                  <p className="font-medium flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Payment</p>
                  <p className="font-medium mt-1">{order.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Items ({order.items.length})
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const avgRating = getAverageRating(item.medicine?.reviews);
                  const unrepliedReviews = getUnrepliedReviews(item.medicine?.reviews);
                  const reviews = item.medicine?.reviews?.filter(r => !r.seller) || [];

                  return (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-emerald-100 rounded flex-shrink-0 flex items-center justify-center">
                          {item.medicine?.image ? (
                            <img src={item.medicine.image} alt={item.medicine.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <Package className="h-8 w-8 text-emerald-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{item.medicine?.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-700">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>

                          {/* Reviews */}
                          {reviews.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs font-medium">{avgRating.toFixed(1)}</span>
                                  <span className="text-xs text-gray-500">({reviews.length})</span>
                                </div>
                                {unrepliedReviews.length > 0 && (
                                  <Badge variant="outline" className="text-amber-600 border-amber-200 text-[10px]">
                                    {unrepliedReviews.length} pending
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-2">
                                {reviews.slice(0, expandedReviews.has(item.id) ? undefined : 1).map((review) => {
                                  const hasReply = hasSellerReply(item.medicine?.reviews || [], review.id);
                                  const reply = item.medicine?.reviews?.find(r => r.seller && r.id !== review.id);

                                  return (
                                    <div key={review.id} className="bg-gray-50 rounded p-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <User className="h-3 w-3 text-emerald-600" />
                                          <span className="text-xs font-medium">{review.customer?.name}</span>
                                          <Badge variant="outline" className="text-[8px] h-4 px-1">Customer</Badge>
                                        </div>
                                        {review.rating && (
                                          <div className="flex items-center gap-1">
                                            <Star className="h-2 w-2 text-yellow-500 fill-yellow-500" />
                                            <span className="text-xs">{review.rating}</span>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-700 mb-2">{review.comment}</p>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500">{formatDate(review.createdAt)}</span>
                                        
                                        {!hasReply && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleReplyClick(review, review.customer?.name || "Customer")}
                                            className="h-6 text-[10px] text-emerald-700"
                                          >
                                            <Reply className="h-2 w-2 mr-1" /> Reply
                                          </Button>
                                        )}
                                      </div>

                                      {/* Seller Reply */}
                                      {reply && (
                                        <div className="mt-2 ml-4 p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Shield className="h-3 w-3 text-blue-600" />
                                            <span className="text-xs font-medium">{reply.seller?.name}</span>
                                            <Badge variant="outline" className="text-[8px] h-4 px-1 border-blue-200 text-blue-700">
                                              Seller
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-gray-700">{reply.comment}</p>
                                          <p className="text-[10px] text-gray-500 mt-1">{formatDate(reply.createdAt)}</p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {reviews.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleReview(item.id)}
                                    className="w-full text-xs h-7"
                                  >
                                    {expandedReviews.has(item.id) ? (
                                      <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                                    ) : (
                                      <>View {reviews.length - 1} More <ChevronDown className="h-3 w-3 ml-1" /></>
                                    )}
                                  </Button>
                                )}

                                {unrepliedReviews.length > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const first = unrepliedReviews[0];
                                      handleReplyClick(first, first.customer?.name || "Customer");
                                    }}
                                    className="w-full text-xs border-emerald-300 h-7"
                                  >
                                    <Reply className="h-3 w-3 mr-1" />
                                    Reply to {unrepliedReviews.length} pending
                                  </Button>
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
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-emerald-900">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" /> Customer
              </h3>
              {order.customer && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-3 w-3" /> {order.customer.email}
                  </p>
                  {order.customer.phone && (
                    <p className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-3 w-3" /> {order.customer.phone}
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* Shipping Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Shipping
              </h3>
              <p className="text-sm text-gray-700 mb-3">{order.shippingAddress}</p>
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon(order.status)}
                <span className={order.status === "DELIVERED" ? "text-green-600" : "text-emerald-700"}>
                  {order.status}
                </span>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Actions</h3>
              <div className="space-y-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-8 text-sm">
                  <Package className="h-3 w-3 mr-2" /> Track Order
                </Button>
                <Button variant="outline" className="w-full border-emerald-300 h-8 text-sm">
                  <MessageSquare className="h-3 w-3 mr-2" /> Contact Support
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

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