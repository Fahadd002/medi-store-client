"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyOrders } from "@/actions/order.action";
import { 
  Package,
  Clock,
  CheckCircle,
  Truck,
  Home,
  XCircle
} from "lucide-react";
import Link from "next/link";

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
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await getMyOrders();
      if (result.data) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PLACED":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "PROCESSING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-emerald-400 mx-auto mb-4 animate-pulse" />
              <p className="text-emerald-600">Loading orders...</p>
            </div>
          </div>
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
              <h1 className="text-2xl font-bold text-emerald-900 mb-2">My Orders</h1>
              <p className="text-emerald-600">Track and manage your orders</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="border-emerald-200 p-8 text-center">
            <Package className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">No Orders Yet</h3>
            <p className="text-emerald-600 mb-4">You have not placed any orders yet.</p>
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Start Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-emerald-200 overflow-hidden">
                <div className="p-4 border-b border-emerald-100 bg-emerald-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(order.status)}
                        <span className={`font-medium text-sm ${
                          order.status === "DELIVERED" ? "text-green-600" :
                          order.status === "CANCELLED" ? "text-red-600" :
                          "text-emerald-700"
                        }`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Order #{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-900">{formatPrice(order.totalAmount)}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Shipping Address:</span> {order.shippingAddress}
                    </p>
                  </div>
                  
                  <div className="border-t border-emerald-100 pt-3">
                    <h4 className="text-sm font-medium text-emerald-700 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {item.medicine?.photoUrl ? (
                            <img
                              src={item.medicine.photoUrl}
                              alt={item.medicine.name}
                              className="h-10 w-10 object-cover rounded border border-emerald-200"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-emerald-100 rounded border border-emerald-200 flex items-center justify-center">
                              <Package className="h-5 w-5 text-emerald-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {item.medicine?.name || `Medicine ${item.medicineId}`}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{item.quantity} × {formatPrice(item.price)}</span>
                              <span className="font-semibold text-emerald-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}