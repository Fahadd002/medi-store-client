// app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyOrders } from "@/actions/order.action";
import { 
  Package,
  Clock,
  CheckCircle,
  Truck,
  Home,
  XCircle,
  MapPin,
  Calendar,
  ShoppingBag,
  Eye,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderItem {
  medicineId: string;
  quantity: number;
  price: number;
  medicine?: {
    id: string;
    name: string;
    photoUrl?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await getMyOrders();
      
      if (result.data) {
        setOrders(result.data);
      } else if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PLACED":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "PROCESSING":
        return <Package className="h-4 w-4 text-yellow-500" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4 text-purple-500" />;
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
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
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PLACED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFilteredOrders = () => {
    if (filter === "all") return orders;
    return orders.filter(order => order.status === filter);
  };

  const getItemCount = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <Package className="h-16 w-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
                <div className="absolute -inset-4 bg-emerald-100 rounded-full blur-xl opacity-30 animate-pulse"></div>
              </div>
              <p className="text-emerald-600 font-medium">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">My Orders</h1>
              <p className="text-emerald-600">Track and manage all your orders</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-emerald-200 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-900">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </Card>
            <Card className="border-emerald-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === "DELIVERED").length}
              </div>
              <div className="text-sm text-gray-600">Delivered</div>
            </Card>
            <Card className="border-emerald-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === "PROCESSING" || o.status === "SHIPPED").length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </Card>
            <Card className="border-emerald-200 p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === "CANCELLED").length}
              </div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              className={filter === "all" ? "bg-emerald-600 hover:bg-emerald-700" : "border-emerald-300 text-emerald-700"}
              onClick={() => setFilter("all")}
            >
              All Orders
            </Button>
            <Button
              variant={filter === "DELIVERED" ? "default" : "outline"}
              className={filter === "DELIVERED" ? "bg-green-600 hover:bg-green-700" : "border-green-300 text-green-700"}
              onClick={() => setFilter("DELIVERED")}
            >
              Delivered
            </Button>
            <Button
              variant={filter === "PROCESSING" ? "default" : "outline"}
              className={filter === "PROCESSING" ? "bg-yellow-600 hover:bg-yellow-700" : "border-yellow-300 text-yellow-700"}
              onClick={() => setFilter("PROCESSING")}
            >
              Processing
            </Button>
            <Button
              variant={filter === "SHIPPED" ? "default" : "outline"}
              className={filter === "SHIPPED" ? "bg-purple-600 hover:bg-purple-700" : "border-purple-300 text-purple-700"}
              onClick={() => setFilter("SHIPPED")}
            >
              Shipped
            </Button>
            <Button
              variant={filter === "CANCELLED" ? "default" : "outline"}
              className={filter === "CANCELLED" ? "bg-red-600 hover:bg-red-700" : "border-red-300 text-red-700"}
              onClick={() => setFilter("CANCELLED")}
            >
              Cancelled
            </Button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="border-emerald-200 p-12 text-center max-w-md mx-auto">
            <div className="relative inline-block mb-6">
              <Package className="h-20 w-20 text-emerald-300 mx-auto" />
              <div className="absolute -inset-6 bg-emerald-100 rounded-full blur-2xl opacity-30"></div>
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">
              {filter === "all" ? "No Orders Yet" : `No ${filter.toLowerCase()} orders`}
            </h3>
            <p className="text-emerald-600 mb-6">
              {filter === "all" 
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : `You don't have any ${filter.toLowerCase()} orders at the moment.`
              }
            </p>
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700 px-8">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border-emerald-200 overflow-hidden hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
                {/* Order Header - Clickable Area */}
                <Link href={`/orders/${order.id}`} className="block">
                  <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-white hover:from-emerald-50 hover:to-emerald-50/30 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-3">
                          <Badge className={`${getStatusColor(order.status)} font-medium`}>
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </div>
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            {getItemCount(order.items)} item{getItemCount(order.items) !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-emerald-900">
                          Order #{order.orderNumber}
                        </h3>
                        {order.seller && (
                          <p className="text-sm text-gray-600 mt-1">
                            Seller: <span className="font-medium">{order.seller.name}</span>
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between lg:justify-end gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-900 mb-1">
                            {formatPrice(order.totalAmount)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-emerald-600">
                            <span>View Details</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Order Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Shipping Address */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Shipping Address</h4>
                          <p className="text-gray-700">{order.shippingAddress}</p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                              {item.medicine?.photoUrl ? (
                                <img
                                  src={item.medicine.photoUrl}
                                  alt={item.medicine.name}
                                  className="h-12 w-12 object-cover rounded-lg border border-emerald-200"
                                />
                              ) : (
                                <div className="h-12 w-12 bg-white rounded-lg border border-emerald-200 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-emerald-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 line-clamp-1">
                                  {item.medicine?.name || `Medicine ${item.medicineId}`}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                  <span>Qty: {item.quantity}</span>
                                  <span className="font-semibold text-emerald-900">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {order.items.length > 2 && (
                            <div className="text-center">
                              <p className="text-sm text-gray-500">
                                +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="space-y-4">
                      <Link href={`/orders/${order.id}`} className="block">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                          <Eye className="h-4 w-4 mr-2" />
                          View Order Details
                        </Button>
                      </Link>

                      {order.status === "DELIVERED" && (
                        <Link 
                          href={`/orders/${order.id}#reviews`} 
                          className="block"
                        >
                          <Button variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Leave Reviews
                          </Button>
                        </Link>
                      )}

                      {order.status === "PLACED" && (
                        <Button 
                          variant="outline" 
                          className="w-full border-red-300 text-red-700 hover:bg-red-50"
                          // Add cancel order functionality here
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </Button>
                      )}

                      {order.status === "DELIVERED" && (
                        <Link href={`/`} className="block">
                          <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Buy Again
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        {orders.length > 0 && (
          <div className="mt-12">
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/30 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 mb-2">Need help with your orders?</h3>
                  <p className="text-emerald-700">
                    Contact our support team for any order-related questions or issues.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-emerald-300 text-emerald-700">
                    Contact Support
                  </Button>
                  <Link href="/">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}