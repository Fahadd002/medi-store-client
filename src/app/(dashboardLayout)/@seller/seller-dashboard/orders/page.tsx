"use client";

import { getSellerOrders, updateOrderStatus } from '@/actions/order.action';
import React, { useCallback, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ShoppingBag, 
  Calendar,
  User,
  Phone,
  ArrowUpDown,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Skeleton } from '@/components/layout/skeleton';
import { Order, OrderStatus } from '@/types/order.types';
import Link from 'next/link'; 

interface StatusConfigType {
  [key: string]: {
    label: string;
    icon: ReactNode;
    color: string;
    nextStatus: OrderStatus | null;
    buttonText: string;
    buttonColor: string;
  };
}

const SellerOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<'createdAt' | 'totalAmount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const statusConfig: StatusConfigType = {
    [OrderStatus.PLACED]: {
      label: 'Placed',
      icon: <ShoppingBag className="w-3 h-3" />,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      nextStatus: OrderStatus.PROCESSING,
      buttonText: 'Start Processing',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    [OrderStatus.PROCESSING]: {
      label: 'Processing',
      icon: <Clock className="w-3 h-3" />,
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      nextStatus: OrderStatus.SHIPPED,
      buttonText: 'Mark as Shipped',
      buttonColor: 'bg-amber-600 hover:bg-amber-700'
    },
    [OrderStatus.SHIPPED]: {
      label: 'Shipped',
      icon: <Truck className="w-3 h-3" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      nextStatus: OrderStatus.DELIVERED,
      buttonText: 'Mark as Delivered',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    [OrderStatus.DELIVERED]: {
      label: 'Delivered',
      icon: <CheckCircle className="w-3 h-3" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      nextStatus: null,
      buttonText: 'Completed',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    [OrderStatus.CANCELLED]: {
      label: 'Cancelled',
      icon: <XCircle className="w-3 h-3" />,
      color: 'bg-red-100 text-red-800 border-red-200',
      nextStatus: null,
      buttonText: 'Cancelled',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getSellerOrders();

      if (error) throw new Error(error.message);

      if (data) {
        let fetchedOrders: Order[] = [];
        
        if (Array.isArray(data)) {
          fetchedOrders = data;
        } else if (data.data && Array.isArray(data.data)) {
          fetchedOrders = data.data;
        } else if (Array.isArray(data.orders)) {
          fetchedOrders = data.orders;
        }
        
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let result = orders;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer?.name.toLowerCase().includes(query) ||
        order.customer?.email.toLowerCase().includes(query) ||
        order.items.some(item => 
          item.medicine?.name?.toLowerCase().includes(query)
        )
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'createdAt') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return sortOrder === 'asc' 
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      }
    });

    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter, sortField, sortOrder]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await updateOrderStatus(orderId, newStatus);
      
      if (error) throw new Error(error.message);
      
      toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const getTotalItems = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getStatusStats = () => {
    const stats = {
      [OrderStatus.PLACED]: 0,
      [OrderStatus.PROCESSING]: 0,
      [OrderStatus.SHIPPED]: 0,
      [OrderStatus.DELIVERED]: 0,
      [OrderStatus.CANCELLED]: 0,
      TOTAL: orders.length
    };

    orders.forEach(order => {
      if (order.status in stats) {
        stats[order.status] += 1;
      }
    });

    return stats;
  };

  const stats = getStatusStats();

  // Removed OrderDetailsDialog component since we'll navigate to separate page

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded" />
            ))}
          </div>
          <Skeleton className="h-64 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
            <Package className="w-5 h-5 text-emerald-600" />
            Seller Orders
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage and track all customer orders
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs h-8"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-800">Total Orders</p>
                <h3 className="text-lg font-bold text-emerald-900 mt-1">{stats.TOTAL}</h3>
              </div>
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-800">Placed</p>
                <h3 className="text-lg font-bold text-emerald-900 mt-1">{stats[OrderStatus.PLACED]}</h3>
              </div>
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-800">Processing</p>
                <h3 className="text-lg font-bold text-amber-900 mt-1">{stats[OrderStatus.PROCESSING]}</h3>
              </div>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-800">Shipped</p>
                <h3 className="text-lg font-bold text-blue-900 mt-1">{stats[OrderStatus.SHIPPED]}</h3>
              </div>
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-800">Delivered</p>
                <h3 className="text-lg font-bold text-green-900 mt-1">{stats[OrderStatus.DELIVERED]}</h3>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Compact */}
      <Card className="mb-4 border-emerald-100">
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Search Orders
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Search by order number, customer name, or medicine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 border-emerald-200 focus:border-emerald-300 focus:ring-emerald-300 text-xs h-8"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Status Filter
              </label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'ALL')}>
                <SelectTrigger className="w-[140px] border-emerald-200 text-xs h-8">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Status</SelectItem>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status} className="text-xs">
                      {statusConfig[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Sort By
              </label>
              <div className="flex gap-1">
                <Select 
                  value={sortField} 
                  onValueChange={(value: string) => {
                    if (value === 'createdAt' || value === 'totalAmount') {
                      setSortField(value);
                    }
                  }}
                >
                  <SelectTrigger className="w-[110px] border-emerald-200 text-xs h-8">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt" className="text-xs">Date</SelectItem>
                    <SelectItem value="totalAmount" className="text-xs">Amount</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="border-emerald-200 hover:bg-emerald-50 h-8 w-8"
                >
                  {sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table - Compact */}
      <Card className="border-emerald-100">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100 py-2 px-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-emerald-900">All Orders ({filteredOrders.length})</CardTitle>
              <CardDescription className="text-xs">
                Click on an order to expand details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="bg-emerald-50">
                <TableRow>
                  <TableHead className="font-semibold text-emerald-900">Order Details</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Customer</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Items</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Amount</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Status</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center p-4">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Package className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium">No orders found</p>
                        <p className="text-xs mt-1">Try changing your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow 
                        className="hover:bg-emerald-50/50 cursor-pointer border-b border-emerald-50"
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3 text-emerald-600" />
                              <div>
                                <p className="font-medium text-gray-900 text-xs">{order.orderNumber}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {formatDate(order.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-emerald-600" />
                              <span className="font-medium text-xs">{order.customer?.name}</span>
                            </div>
                            <div className="text-xs text-gray-600 truncate max-w-[120px]">{order.customer?.email}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="w-2.5 h-2.5" />
                              {order.customer?.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-medium text-xs">{getTotalItems(order)} items</span>
                            <div className="text-xs text-gray-600 line-clamp-1 max-w-[150px]">
                              {order.items.map(item => item.medicine?.name).join(', ')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-emerald-700 text-sm">
                            ${order.totalAmount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig[order.status].color} font-medium text-xs px-2 py-0.5`}>
                            {statusConfig[order.status].icon}
                            <span className="ml-1">{statusConfig[order.status].label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/seller-dashboard/orders/${order.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs h-7 px-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Details
                              </Button>
                            </Link>

                            {statusConfig[order.status].nextStatus && (
                              <Button
                                size="sm"
                                className={`${statusConfig[order.status].buttonColor} text-xs h-7 px-2`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(order.id, statusConfig[order.status].nextStatus!);
                                }}
                              >
                                {statusConfig[order.status].buttonText}
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-emerald-50 h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-emerald-100 text-xs">
                                <DropdownMenuItem className="text-emerald-700 focus:bg-emerald-50">
                                  <RefreshCw className="w-3 h-3 mr-1.5" />
                                  Refresh Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Order Items */}
                      {expandedOrderId === order.id && (
                        <TableRow className="bg-emerald-50/30">
                          <TableCell colSpan={6} className="p-0">
                            <div className="p-2">
                              <h4 className="font-medium text-emerald-900 text-xs mb-2 flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                Order Items ({order.items.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="bg-white border border-emerald-100 rounded p-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="font-medium text-gray-900 text-xs">
                                          {item.medicine?.name || 'Unknown Medicine'}
                                        </h5>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold text-emerald-700 text-sm">
                                          ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                          SKU: {item.medicineId?.slice(0, 8)}...
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerOrder;