"use client";

import { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  getAllOrders
} from "@/actions/order.action";
import { searchSellers } from "@/actions/user.action";
import { toast } from "sonner";
import {
  Search,
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  ShoppingBag,
  User,
  Eye,
  ChevronDown,
  ChevronUp,
  Filter,
  Store,
  Calendar,
  Clock,
  Truck,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { Skeleton } from "@/components/layout/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Order, OrderStatus } from "@/types/order.types";

interface SellerItem {
  value: string;
  label: string;
  email?: string;
}

interface Stats {
  total: number;
  placed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// Debounce function
const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState("10");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [sellerFilter, setSellerFilter] = useState<string>("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerSuggestions, setSellerSuggestions] = useState<SellerItem[]>([]);
  const [showSellerSuggestions, setShowSellerSuggestions] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<SellerItem | null>(null);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    placed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const sellerSearchRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const calculateStats = useCallback((ords: Order[]) => {
    const total = ords.length;
    const placed = ords.filter(o => o.status === OrderStatus.PLACED).length;
    const processing = ords.filter(o => o.status === OrderStatus.PROCESSING).length;
    const shipped = ords.filter(o => o.status === OrderStatus.SHIPPED).length;
    const delivered = ords.filter(o => o.status === OrderStatus.DELIVERED).length;
    const cancelled = ords.filter(o => o.status === OrderStatus.CANCELLED).length;

    setStats({ total, placed, processing, shipped, delivered, cancelled });
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * parseInt(limit);

      const result = await getAllOrders(
        {
          search: search || undefined,
          sellerId: sellerFilter || undefined,
          status: statusFilter || undefined,
          page: page.toString(),
          limit,
          skip: skip.toString(),
          sortBy,
          sortOrder,
        },
        { cache: "no-store" }
      );

      if (result.error) throw new Error(result.error.message);

      if (result.data) {
        const ords = result.data.data || [];
        setOrders(ords);
        calculateStats(ords);
        setTotalPages(result.data.pagination?.totalPage || 1);
      }
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, sellerFilter, statusFilter, sortBy, sortOrder, calculateStats]);

  // Fetch seller suggestions
  const fetchSellerSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSellerSuggestions([]);
      return;
    }

    setLoadingSellers(true);
    try {
      const result = await searchSellers(query);
      if (result.data) {
        setSellerSuggestions(result.data);
      }
    } catch {
      setSellerSuggestions([]);
    } finally {
      setLoadingSellers(false);
    }
  }, []);

  // Debounced order search
  useEffect(() => {
    const debouncedFetch = debounce(() => {
      if (page === 1) {
        fetchOrders();
      } else {
        setPage(1);
      }
    }, 500);

    debouncedFetch();
  }, [search, limit, sellerFilter, statusFilter, sortBy, sortOrder]);

  // Debounced seller search
  useEffect(() => {
    const debouncedSellerSearch = debounce(() => {
      fetchSellerSuggestions(sellerSearch);
    }, 300);

    debouncedSellerSearch();
  }, [sellerSearch, fetchSellerSuggestions]);

  // Fetch orders on page change
  useEffect(() => {
    fetchOrders();
  }, [page]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sellerSearchRef.current && !sellerSearchRef.current.contains(event.target as Node)) {
        setShowSellerSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle seller selection
  const handleSelectSeller = (seller: SellerItem) => {
    setSelectedSeller(seller);
    setSellerFilter(seller.value);
    setSellerSearch(seller.label);
    setShowSellerSuggestions(false);
    setPage(1);
  };

  // Clear seller filter
  const handleClearSeller = () => {
    setSelectedSeller(null);
    setSellerFilter("");
    setSellerSearch("");
    setSellerSuggestions([]);
    setShowSellerSuggestions(false);
    setPage(1);
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      [OrderStatus.PLACED]: <ShoppingBag className="h-3 w-3" />,
      [OrderStatus.PROCESSING]: <Clock className="h-3 w-3" />,
      [OrderStatus.SHIPPED]: <Truck className="h-3 w-3" />,
      [OrderStatus.DELIVERED]: <CheckCircle className="h-3 w-3" />,
      [OrderStatus.CANCELLED]: <XCircle className="h-3 w-3" />
    };
    return icons[status] || <Package className="h-3 w-3" />;
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      [OrderStatus.PLACED]: "bg-emerald-100 text-emerald-800 border-emerald-300",
      [OrderStatus.PROCESSING]: "bg-amber-100 text-amber-800 border-amber-300",
      [OrderStatus.SHIPPED]: "bg-blue-100 text-blue-800 border-blue-300",
      [OrderStatus.DELIVERED]: "bg-green-100 text-green-800 border-green-300",
      [OrderStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-300"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const getTotalItems = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Event handlers
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleSellerSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSellerSearch(e.target.value);
  const handleLimitChange = (e: ChangeEvent<HTMLSelectElement>) => setLimit(e.target.value);
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as OrderStatus | "");
  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value);
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Package, color: "emerald" },
          { label: "Placed", value: stats.placed, icon: ShoppingBag, color: "emerald" },
          { label: "Processing", value: stats.processing, icon: Clock, color: "amber" },
          { label: "Shipped", value: stats.shipped, icon: Truck, color: "blue" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "green" },
          { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "red" }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`border border-${stat.color}-200 bg-gradient-to-br from-${stat.color}-50 to-white p-3 shadow-sm`}>
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-${stat.color}-700">{stat.label}</p>
                    <p className="text-xl font-bold text-${stat.color}-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                    <Icon className={`h-4 w-4 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card className="border border-emerald-200 bg-white p-3">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Order Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-emerald-500 h-3.5 w-3.5" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={handleSearchChange}
                className="pl-7 h-9 text-xs border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
            </div>

            {/* Seller Filter */}
            <div className="relative w-48" ref={sellerSearchRef}>
              <div className="relative">
                <Store className="absolute left-2 top-1/2 transform -translate-y-1/2 text-emerald-500 h-3.5 w-3.5" />
                <Input
                  type="text"
                  placeholder="Search seller..."
                  value={sellerSearch}
                  onChange={handleSellerSearchChange}
                  onFocus={() => sellerSearch.trim() && setShowSellerSuggestions(true)}
                  className="pl-7 pr-16 h-9 text-xs border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {selectedSeller && (
                    <button
                      type="button"
                      onClick={handleClearSeller}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => sellerSearch.trim() && setShowSellerSuggestions(!showSellerSuggestions)}
                    className="text-emerald-500 hover:text-emerald-600"
                  >
                    {showSellerSuggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Seller Suggestions */}
              {showSellerSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-emerald-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {loadingSellers ? (
                    <div className="p-2 text-center">
                      <Loader2 className="h-3 w-3 animate-spin mx-auto text-emerald-500" />
                    </div>
                  ) : sellerSuggestions.length === 0 ? (
                    <div className="p-2 text-center text-xs text-gray-500">No sellers found</div>
                  ) : (
                    <ul className="py-1">
                      {sellerSuggestions.map((seller) => (
                        <li
                          key={seller.value}
                          className="px-3 py-1.5 hover:bg-emerald-50 cursor-pointer text-xs border-b border-emerald-100 last:border-b-0"
                          onClick={() => handleSelectSeller(seller)}
                        >
                          <div className="font-medium text-emerald-900">{seller.label}</div>
                          {seller.email && <div className="text-[10px] text-emerald-600">{seller.email}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative w-28">
              <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-emerald-500 h-3.5 w-3.5" />
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="w-full h-9 pl-7 pr-2 text-xs border border-emerald-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-white appearance-none"
              >
                <option value="">All Status</option>
                {Object.values(OrderStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="relative w-28">
              <Package className="absolute left-2 top-1/2 transform -translate-y-1/2 text-emerald-500 h-3.5 w-3.5" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full h-9 pl-7 pr-2 text-xs border border-emerald-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-white appearance-none"
              >
                <option value="createdAt">Date</option>
                <option value="totalAmount">Amount</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
            </div>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="border-emerald-300 hover:bg-emerald-50 h-9 w-9"
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* Limit Selector */}
            <select 
              value={limit} 
              onChange={handleLimitChange}
              className="h-9 px-2 border border-emerald-300 rounded-md text-xs focus:ring-emerald-500 focus:border-emerald-500 bg-white w-16"
            >
              {[10, 20, 50].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>

            {/* Active Filters Badges */}
            {selectedSeller && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 h-7 px-2 flex items-center gap-1 text-xs">
                <Store className="h-3 w-3" />
                {selectedSeller.label}
                <button onClick={handleClearSeller} className="ml-1 hover:text-emerald-900">
                  <XCircle className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border border-emerald-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-emerald-50 to-white">
              <tr>
                {["Order", "Customer", "Seller", "Items", "Amount", "Status", "Actions"].map((header) => (
                  <th key={header} className="h-8 px-2 text-left font-semibold text-emerald-900">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: parseInt(limit) }).map((_, i) => (
                  <tr key={i} className="hover:bg-emerald-50/30">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-2 py-2">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-2 bg-emerald-100 rounded-full">
                        <Package className="h-5 w-5 text-emerald-400" />
                      </div>
                      <p className="text-emerald-700 font-medium text-xs">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-emerald-50/50 border-b border-emerald-100">
                    <td className="px-2 py-2">
                      <p className="font-medium text-emerald-900 text-xs">{order.orderNumber}</p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    
                    <td className="px-2 py-2">
                      <p className="font-medium text-gray-900 text-xs">{order.customer?.name}</p>
                      <p className="text-[10px] text-gray-500">{order.customer?.email}</p>
                    </td>
                    
                    <td className="px-2 py-2">
                      <p className="font-medium text-gray-900 text-xs">{order.seller?.name}</p>
                      <p className="text-[10px] text-gray-500">{order.seller?.email}</p>
                    </td>
                    
                    <td className="px-2 py-2">
                      <span className="font-medium text-xs">{getTotalItems(order)} items</span>
                      <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[150px]">
                        {order.items.map(item => item.medicine?.name).join(', ')}
                      </p>
                    </td>
                    
                    <td className="px-2 py-2">
                      <span className="font-bold text-emerald-700 text-sm">৳{order.totalAmount.toFixed(2)}</span>
                    </td>
                    
                    <td className="px-2 py-2">
                      <Badge className={`${getStatusColor(order.status)} font-medium text-[10px] h-5 px-1.5 flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </Badge>
                    </td>
                    
                    <td className="px-2 py-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(order)}
                        className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        title="View details"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-2 py-2 border-t border-emerald-200">
            <div className="text-[10px] text-emerald-700">Page {page} of {totalPages}</div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-6 px-2 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-6 px-2 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl border border-emerald-200">
          <DialogHeader className="border-b border-emerald-100 pb-3">
            <DialogTitle className="text-emerald-900 text-base">Order Details</DialogTitle>
            <DialogDescription className="text-emerald-600 text-xs">
              Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-emerald-800 text-xs mb-2">Order Information</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Badge className={`${getStatusColor(selectedOrder.status)} text-[10px] h-5 px-1.5`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-1">{selectedOrder.status}</span>
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-bold text-emerald-700">৳{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-800 text-xs mb-2">Customer Information</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-emerald-600" />
                      <span className="font-medium">{selectedOrder.customer?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-emerald-600" />
                      <span>{selectedOrder.customer?.email}</span>
                    </div>
                    {selectedOrder.customer?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>{selectedOrder.customer?.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="bg-emerald-100" />

              <div>
                <h4 className="font-semibold text-emerald-800 text-xs mb-2">Seller Information</h4>
                <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-200">
                  <Store className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-900 text-xs">{selectedOrder.seller?.name}</p>
                    <p className="text-[10px] text-emerald-600">{selectedOrder.seller?.email}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-emerald-100" />

              <div>
                <h4 className="font-semibold text-emerald-800 text-xs mb-2">Shipping Address</h4>
                <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <p className="text-xs text-gray-700">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              <Separator className="bg-emerald-100" />

              <div>
                <h4 className="font-semibold text-emerald-800 text-xs mb-2 flex items-center gap-1">
                  <ShoppingBag className="h-3 w-3" />
                  Order Items ({selectedOrder.items.length})
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-white border border-emerald-100 rounded">
                      <div>
                        <p className="font-medium text-gray-900 text-xs">{item.medicine?.name}</p>
                        <p className="text-[10px] text-gray-500">Qty: {item.quantity} × ৳{item.price.toFixed(2)}</p>
                      </div>
                      <div className="font-bold text-emerald-700 text-sm">৳{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// CardContent wrapper component
const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props}>{children}</div>
);