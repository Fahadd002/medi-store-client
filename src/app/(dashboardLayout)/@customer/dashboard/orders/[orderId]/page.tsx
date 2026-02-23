"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Home,
  XCircle,
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  ShoppingBag,
  User,
  MessageSquare,
  FileText,
  Box,
  Trash2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { getOrderById, cancelOrder } from "@/actions/order.action";
import { checkReviewEligibility, deleteReview } from "@/actions/review.action";
import { toast } from "sonner";
import ReviewDialog from "@/components/modules/review/ReviewDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Swal from "sweetalert2";

interface OrderItem {
  medicineId: string;
  quantity: number;
  price: number;
  medicine?: {
    id: string;
    name: string;
    photoUrl?: string;
    description?: string;
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
  customer?: { id: string; name: string; email: string };
  seller?: { id: string; name: string; email: string };
}

interface EligibilityStatus {
  eligible: boolean;
  alreadyReviewed: boolean;
  existingReview?: { id: string; rating: number; comment: string; createdAt: string };
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [eligibilityMap, setEligibilityMap] = useState<Record<string, EligibilityStatus>>({});
  const [selectedMedicine, setSelectedMedicine] = useState<{ id: string, name: string } | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<{ id: string; medicineName: string; rating: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchOrderDetails(); }, [orderId]);
  useEffect(() => {
    if (window.location.hash === "#reviews" && reviewsSectionRef.current) {
      setTimeout(() => {
        reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        setActiveTab("reviews");
      }, 100);
    }
  }, [order, loading]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await getOrderById(orderId);
      if (result.data) {
        setOrder(result.data);
        if (result.data.status === "DELIVERED") await checkEligibilityForItems(result.data.items);
      } else if (result.error) toast.error(result.error.message);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast.error("Failed to load order details");
    } finally { setLoading(false); }
  };

  const checkEligibilityForItems = async (items: OrderItem[]) => {
    try {
      const eligibilityResults: Record<string, EligibilityStatus> = {};
      for (const item of items) {
        if (item.medicineId) {
          const result = await checkReviewEligibility(orderId, item.medicineId);
          if (result.data) eligibilityResults[item.medicineId] = result.data;
        }
      }
      setEligibilityMap(eligibilityResults);
    } catch (error) { console.error("Failed to check review eligibility:", error); }
  };

  const handleDeleteReview = (review: EligibilityStatus['existingReview'], medicineName: string) => {
    if (review) {
      setReviewToDelete({ id: review.id, medicineName, rating: review.rating });
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      setDeleting(true);
      const result = await deleteReview(reviewToDelete.id);
      if (result.error) { toast.error(result.error.message); return; }
      toast.success("Review deleted successfully!");
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
      if (order) await checkEligibilityForItems(order.items);
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review. Please try again.");
    } finally { setDeleting(false); }
  };

  const canCancelOrder = () => {
    if (!order) return false;
    const cancellableStatuses = ["PLACED", "PROCESSING"];
    return cancellableStatuses.includes(order.status);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        html: `
          <div class="text-left">
            <p class="mb-2">Cancel <strong>Order #${order.orderNumber}</strong>?</p>
            <div class="bg-red-50 p-2 rounded border border-red-100 mb-2 text-sm">
              <p class="mb-1"><strong>Status:</strong> ${getStatusText(order.status)}</p>
              <p class="mb-1"><strong>Items:</strong> ${order.items.length} item${order.items.length !== 1 ? 's' : ''}</p>
              <p><strong>Total:</strong> ${formatPrice(order.totalAmount)}</p>
            </div>
            <p class="text-red-600 text-sm font-medium">This action cannot be undone!</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, cancel order!',
        cancelButtonText: 'No, keep order',
        reverseButtons: true,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            setCancelling(true);
            const result = await cancelOrder(order.id);
            if (result.error) throw new Error(result.error.message);
            return result;
          } catch (error) {
            Swal.showValidationMessage(`Failed to cancel order: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } finally { setCancelling(false); }
        },
        allowOutsideClick: () => !Swal.isLoading()
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: 'Cancelled!',
          html: `
            <div class="text-center">
              <div class="mx-auto mb-3 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p class="mb-1 text-sm"><strong>Order #${order.orderNumber}</strong> has been cancelled.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'OK'
        });
        fetchOrderDetails();
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      Swal.fire({ title: 'Error!', text: 'Failed to cancel order. Please try again.', icon: 'error', confirmButtonColor: '#dc2626', confirmButtonText: 'OK' });
    }
  };

  const handleQuickCancel = () => {
    if (!order) return;
    Swal.fire({
      title: 'Cancel Order?',
      text: `Cancel Order #${order.orderNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      reverseButtons: true
    }).then((result) => { if (result.isConfirmed) handleCancelOrder(); });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PLACED": return <Package className="h-4 w-4 text-blue-500" />;
      case "PROCESSING": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "SHIPPED": return <Truck className="h-4 w-4 text-purple-500" />;
      case "DELIVERED": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CANCELLED": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PLACED": return "Order Placed";
      case "PROCESSING": return "Processing";
      case "SHIPPED": return "Shipped";
      case "DELIVERED": return "Delivered";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      case "SHIPPED": return "bg-purple-100 text-purple-800 border-purple-200";
      case "PROCESSING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PLACED": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatShortDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const handleReviewClick = (medicine: { id: string, name: string }) => { setSelectedMedicine(medicine); setReviewDialogOpen(true); };
  const handleReviewSuccess = () => { toast.success("Review submitted successfully!"); setReviewDialogOpen(false); if (order) checkEligibilityForItems(order.items); };
  
  const scrollToReviews = () => {
    setActiveTab("reviews");
    setTimeout(() => { reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" }); router.push(`/dashboard/orders/${orderId}#reviews`, { scroll: false }); }, 100);
  };

  const getPendingReviewsCount = () => {
    if (!order || order.status !== "DELIVERED") return 0;
    let count = 0;
    order.items.forEach(item => { const eligibility = eligibilityMap[item.medicineId]; if (eligibility && !eligibility.alreadyReviewed) count++; });
    return count;
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Package className="h-10 w-10 text-emerald-400 mx-auto mb-3 animate-pulse" />
            <p className="text-emerald-600 text-sm">Loading order details...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-4">
      <div className="container mx-auto px-4">
        <Card className="border-emerald-200 p-6 text-center max-w-md mx-auto">
          <Package className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-emerald-800 mb-2">Order Not Found</h3>
          <p className="text-emerald-600 mb-4 text-sm">The order you are looking for does not exist.</p>
          <Link href="/dashboard/orders">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <ArrowLeft className="h-3 w-3 mr-2" /> Back to Orders
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );

  const pendingReviewsCount = getPendingReviewsCount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-4">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Link href="/dashboard/orders">
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2">
                    <ArrowLeft className="h-3 w-3 mr-1" /> Back
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-emerald-900">Order #{order.orderNumber}</h1>
                  <p className="text-emerald-600 text-sm">Order Details</p>
                </div>
                <div className="flex gap-2">
                  {order.status === "DELIVERED" && pendingReviewsCount > 0 && (
                    <Button onClick={scrollToReviews} size="sm" className="bg-amber-500 hover:bg-amber-600 h-8">
                      <Star className="h-3 w-3 mr-1" /> Reviews ({pendingReviewsCount})
                    </Button>
                  )}
                  {canCancelOrder() && (
                    <Button onClick={handleQuickCancel} disabled={cancelling} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50 h-8">
                      <XCircle className="h-3 w-3 mr-1" /> {cancelling ? "Cancelling..." : "Cancel"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-8">
                <Home className="h-3 w-3 mr-1" /> Home
              </Button>
            </Link>
          </div>

          {/* Order Summary Card */}
          <Card className="border-emerald-200 p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-medium text-gray-700">Date</span>
                </div>
                <p className="font-semibold text-sm">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <ShoppingBag className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-medium text-gray-700">Total</span>
                </div>
                <p className="font-bold text-emerald-900">{formatPrice(order.totalAmount)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {getStatusIcon(order.status)}
                  <span className="text-xs font-medium text-gray-700">Status</span>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-sm ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="font-semibold">{getStatusText(order.status)}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-medium text-gray-700">Payment</span>
                </div>
                <p className="font-semibold text-sm">{order.paymentMethod.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Box className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-medium text-gray-700">Items</span>
                </div>
                <p className="font-semibold text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="items" className="text-sm">
              <ShoppingBag className="h-3 w-3 mr-1" /> Items
            </TabsTrigger>
            <TabsTrigger value="details" className="text-sm">
              <FileText className="h-3 w-3 mr-1" /> Details
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-sm relative" onClick={scrollToReviews}>
              <Star className="h-3 w-3 mr-1" /> Reviews
              {pendingReviewsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingReviewsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Order Items Tab */}
          <TabsContent value="items" className="space-y-4">
            <Card className="border-emerald-200">
              <div className="p-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="border border-emerald-100 rounded-lg p-3 hover:border-emerald-200 transition-all">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {item.medicine?.photoUrl ? (
                            <img src={item.medicine.photoUrl} alt={item.medicine.name} className="h-16 w-16 object-cover rounded border border-emerald-200" />
                          ) : (
                            <div className="h-16 w-16 bg-emerald-100 rounded border border-emerald-200 flex items-center justify-center">
                              <Package className="h-8 w-8 text-emerald-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-sm">{item.medicine?.name || `Medicine ${item.medicineId}`}</h3>
                              {item.medicine?.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.medicine.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-xs mt-2">
                                <div className="bg-emerald-50 px-2 py-1 rounded">
                                  <span className="font-medium text-emerald-700">Qty: {item.quantity}</span>
                                </div>
                                <div className="bg-emerald-50 px-2 py-1 rounded">
                                  <span className="font-medium text-emerald-700">Price: {formatPrice(item.price)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-emerald-900">{formatPrice(item.price * item.quantity)}</div>
                              <Link href={`/shop/${item.medicineId}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                View Product →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Order Summary</h4>
                      <p className="text-xs text-gray-600">Including all items and charges</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-900">{formatPrice(order.totalAmount)}</div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Order Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-emerald-200">
                <div className="p-4 border-b border-emerald-100">
                  <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Shipping Information
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Shipping Address</p>
                      <p className="text-gray-900 p-2 bg-emerald-50 rounded border border-emerald-100 text-sm">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Order Timeline</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Order Placed</span>
                          <span className="text-gray-900 font-medium">{formatShortDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Last Updated</span>
                          <span className="text-gray-900 font-medium">{formatShortDate(order.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                {order.customer && (
                  <Card className="border-emerald-200">
                    <div className="p-4 border-b border-emerald-100">
                      <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                        <User className="h-4 w-4" /> Customer Information
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Full Name</p>
                        <p className="text-gray-900">{order.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Email Address</p>
                        <p className="text-gray-900">{order.customer.email}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {order.seller && (
                  <Card className="border-emerald-200">
                    <div className="p-4 border-b border-emerald-100">
                      <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                        <User className="h-4 w-4" /> Seller Information
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Seller Name</p>
                        <p className="text-gray-900">{order.seller.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Contact Email</p>
                        <p className="text-gray-900">{order.seller.email}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <div ref={reviewsSectionRef} id="reviews" className="scroll-mt-20">
              <Card className="border-emerald-200">
                <div className="p-4 border-b border-emerald-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="font-bold text-emerald-900 flex items-center gap-2">
                        <Star className="h-5 w-5" /> Product Reviews
                      </h2>
                      <p className="text-emerald-600 text-sm">Share your feedback on the products</p>
                    </div>
                    {pendingReviewsCount > 0 && (
                      <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                        {pendingReviewsCount} item{pendingReviewsCount !== 1 ? 's' : ''} pending
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {order.status !== "DELIVERED" ? (
                    <div className="text-center py-6">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-700 mb-2">Order Not Yet Delivered</h3>
                      <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
                        You can only review products after your order has been delivered. Current status: {getStatusText(order.status)}.
                      </p>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="font-semibold">{getStatusText(order.status)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-emerald-900 mb-1">Your Review Progress</h4>
                            <p className="text-emerald-700 text-sm">
                              {pendingReviewsCount === 0 ? "You've reviewed all items!" : `${pendingReviewsCount} item${pendingReviewsCount !== 1 ? 's' : ''} left to review.`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="text-xl font-bold text-emerald-900">{order.items.length - pendingReviewsCount}</div>
                              <div className="text-xs text-emerald-600">Reviewed</div>
                            </div>
                            <div className="h-8 w-px bg-emerald-200"></div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-emerald-900">{order.items.length}</div>
                              <div className="text-xs text-emerald-600">Total</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item, index) => {
                          const eligibility = eligibilityMap[item.medicineId];
                          const hasReviewed = eligibility?.alreadyReviewed;
                          const existingReview = eligibility?.existingReview;

                          return (
                            <div key={index} className="border border-emerald-100 rounded-lg p-3 hover:border-emerald-200 transition-all">
                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3">
                                    {item.medicine?.photoUrl ? (
                                      <img src={item.medicine.photoUrl} alt={item.medicine.name} className="h-12 w-12 object-cover rounded border border-emerald-200" />
                                    ) : (
                                      <div className="h-12 w-12 bg-emerald-100 rounded border border-emerald-200 flex items-center justify-center">
                                        <Package className="h-6 w-6 text-emerald-400" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h3 className="font-bold text-gray-900 text-sm">{item.medicine?.name || `Medicine ${item.medicineId}`}</h3>
                                      <div className="flex items-center gap-2 text-xs mt-1">
                                        <div className="text-gray-600">Qty: {item.quantity}</div>
                                        <div className="font-medium text-emerald-900">{formatPrice(item.price * item.quantity)}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3 pt-3 border-t border-emerald-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded ${hasReviewed ? 'bg-green-100' : 'bg-amber-100'}`}>
                                          {hasReviewed ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Star className="h-4 w-4 text-amber-600" />}
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900 text-sm">{hasReviewed ? "Reviewed" : "Review pending"}</p>
                                          <p className="text-xs text-gray-600">
                                            {hasReviewed ? `Reviewed on ${formatShortDate(existingReview?.createdAt || '')}` : "Share your experience"}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        {hasReviewed ? (
                                          <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                              {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-3 w-3 ${i < (existingReview?.rating || 0) ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} />
                                              ))}
                                            </div>
                                            <div className="flex gap-1">
                                              <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-7 px-2" asChild>
                                                <Link href={`/shop/${item.medicineId}`}>View</Link>
                                              </Button>
                                              <Button variant="outline" size="sm" onClick={() => handleDeleteReview(existingReview, item.medicine?.name || `Medicine ${item.medicineId}`)} className="border-red-300 text-red-700 hover:bg-red-50 h-7 px-2">
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <Button onClick={() => handleReviewClick({ id: item.medicineId, name: item.medicine?.name || `Medicine ${item.medicineId}` })} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7">
                                            <Star className="h-3 w-3 mr-1" /> Review
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    {existingReview?.comment && (
                                      <div className="mt-2 p-2 bg-emerald-50 rounded border border-emerald-100">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3 text-emerald-500" />
                                            <span className="font-medium text-emerald-900 text-xs">Your Review</span>
                                          </div>
                                          <Button variant="ghost" size="sm" onClick={() => handleDeleteReview(existingReview, item.medicine?.name || `Medicine ${item.medicineId}`)} className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-2.5 w-2.5 mr-1" /> Delete
                                          </Button>
                                        </div>
                                        <p className="text-gray-700 text-sm mb-1">{existingReview.comment}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                          <span>Rating: {existingReview.rating}/5</span>
                                          <span>{formatShortDate(existingReview.createdAt)}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Card className="border-emerald-200 bg-amber-50">
                        <div className="p-3">
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 bg-amber-100 rounded">
                              <Star className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-amber-900 text-sm mb-1">Review Guidelines</h4>
                              <ul className="space-y-1 text-amber-800 text-xs">
                                <li className="flex items-start gap-1"><span>•</span> <span>Be honest about your experience</span></li>
                                <li className="flex items-start gap-1"><span>•</span> <span>Focus on product quality and value</span></li>
                                <li className="flex items-start gap-1"><span>•</span> <span>Help other customers make decisions</span></li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Review Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-lg font-bold text-red-900">Delete Review</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-gray-700 text-sm">
                Are you sure you want to delete your review for <span className="font-semibold text-red-700">{reviewToDelete?.medicineName}</span>?
                <div className="mt-3 p-3 bg-red-50 rounded border border-red-100">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="font-medium">Rating: {reviewToDelete?.rating}/5</span>
                  </div>
                  <p className="text-gray-600 text-xs">This action cannot be undone.</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleting} className="order-2 sm:order-1 flex-1 border-gray-300 hover:bg-gray-50 h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReview} disabled={deleting} className="order-1 sm:order-2 flex-1 bg-red-600 hover:bg-red-700 text-white h-9">
              {deleting ? (
                <>
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete Review
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        medicineId={selectedMedicine?.id || ''}
        medicineName={selectedMedicine?.name || ''}
        orderId={orderId}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}