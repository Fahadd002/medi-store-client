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
import { Card, CardContent } from '@/components/ui/card';
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

const statusConfig: StatusConfigType = {
  [OrderStatus.PLACED]: {
    label: 'Placed',
    icon: <ShoppingBag className="w-3 h-3" />,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    nextStatus: OrderStatus.PROCESSING,
    buttonText: 'Process',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
  },
  [OrderStatus.PROCESSING]: {
    label: 'Processing',
    icon: <Clock className="w-3 h-3" />,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    nextStatus: OrderStatus.SHIPPED,
    buttonText: 'Ship',
    buttonColor: 'bg-amber-600 hover:bg-amber-700'
  },
  [OrderStatus.SHIPPED]: {
    label: 'Shipped',
    icon: <Truck className="w-3 h-3" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    nextStatus: OrderStatus.DELIVERED,
    buttonText: 'Deliver',
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

const SellerOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalAmount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getSellerOrders();

      if (error) throw new Error(error.message);

      if (data) {
        const fetchedOrders = Array.isArray(data) 
          ? data 
          : data.data && Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.orders) 
              ? data.orders 
              : [];
        
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter and sort orders
  useEffect(() => {
    let result = orders;

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer?.name?.toLowerCase().includes(query) ||
        order.customer?.email?.toLowerCase().includes(query) ||
        order.items.some(item => item.medicine?.name?.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(order => order.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'createdAt') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return sortOrder === 'asc' 
        ? a.totalAmount - b.totalAmount
        : b.totalAmount - a.totalAmount;
    });

    setFilteredOrders(result);
  }, [orders, search, statusFilter, sortBy, sortOrder]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await updateOrderStatus(orderId, newStatus);
      if (error) throw new Error(error.message);
      
      toast.success(`Order ${statusConfig[newStatus].label}`);
      fetchOrders();
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const formatDate = (dateString: string) => format(new Date(dateString), 'MMM dd, hh:mm a');
  const getTotalItems = (order: Order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

  const getStatusStats = () => {
    const stats = {
      [OrderStatus.PLACED]: 0,
      [OrderStatus.PROCESSING]: 0,
      [OrderStatus.SHIPPED]: 0,
      [OrderStatus.DELIVERED]: 0,
      [OrderStatus.CANCELLED]: 0,
      TOTAL: orders.length
    };
    orders.forEach(order => { if (order.status in stats) stats[order.status] += 1; });
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}
        </div>
        <Skeleton className="h-96 rounded" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-1.5">
            <Package className="w-5 h-5 text-emerald-600" />
            Seller Orders
          </h1>
          <p className="text-sm text-gray-600">Manage customer orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} className="h-8 text-xs">
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-2">
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="p-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-emerald-800">Total</p>
                <p className="text-lg font-bold text-emerald-900">{stats.TOTAL}</p>
              </div>
              <div className="p-1.5 bg-emerald-100 rounded">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="p-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-emerald-800">Placed</p>
                <p className="text-lg font-bold text-emerald-900">{stats[OrderStatus.PLACED]}</p>
              </div>
              <div className="p-1.5 bg-emerald-100 rounded">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <CardContent className="p-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-800">Processing</p>
                <p className="text-lg font-bold text-amber-900">{stats[OrderStatus.PROCESSING]}</p>
              </div>
              <div className="p-1.5 bg-amber-100 rounded">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-800">Shipped</p>
                <p className="text-lg font-bold text-blue-900">{stats[OrderStatus.SHIPPED]}</p>
              </div>
              <div className="p-1.5 bg-blue-100 rounded">
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardContent className="p-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-green-800">Delivered</p>
                <p className="text-lg font-bold text-green-900">{stats[OrderStatus.DELIVERED]}</p>
              </div>
              <div className="p-1.5 bg-green-100 rounded">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'ALL')}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                {Object.values(OrderStatus).map(s => (
                  <SelectItem key={s} value={s} className="text-xs">{statusConfig[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'createdAt' | 'totalAmount')}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="totalAmount">Amount</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="h-8 w-8">
              {sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="bg-emerald-50">
                <TableRow>
                  {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Actions'].map(h => (
                    <TableHead key={h} className="h-8 text-xs font-semibold">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center p-4">
                      <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">No orders found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-emerald-50/50"
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      >
                        <TableCell className="py-1.5">
                          <p className="text-xs font-medium">{order.orderNumber}</p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> {formatDate(order.createdAt)}
                          </p>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <p className="text-xs">{order.customer?.name}</p>
                          <p className="text-[10px] text-gray-500">{order.customer?.email}</p>
                          {order.customer?.phone && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Phone className="w-2 h-2" /> {order.customer.phone}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5">
                          <p className="text-xs">{getTotalItems(order)} items</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[120px]">
                            {order.items.map(i => i.medicine?.name).join(', ')}
                          </p>
                        </TableCell>
                        <TableCell className="py-1.5 font-bold text-emerald-700 text-sm">
                          ৳{order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Badge className={`${statusConfig[order.status].color} text-[10px] h-5 px-1.5`}>
                            {statusConfig[order.status].icon}
                            <span className="ml-1">{statusConfig[order.status].label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <div className="flex items-center gap-0.5">
                            <Link href={`/seller-dashboard/orders/${order.id}`}>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                                <Eye className="w-3 h-3" />
                              </Button>
                            </Link>

                            {statusConfig[order.status].nextStatus && (
                              <Button
                                size="sm"
                                className={`${statusConfig[order.status].buttonColor} h-6 px-2 text-[10px]`}
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
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="text-xs">
                                <DropdownMenuItem onClick={() => fetchOrders()}>
                                  <RefreshCw className="w-3 h-3 mr-1.5" /> Refresh
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Items */}
                      {expandedOrderId === order.id && (
                        <TableRow className="bg-emerald-50/30">
                          <TableCell colSpan={6} className="p-2">
                            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3" /> Order Items ({order.items.length})
                            </h4>
                            <div className="grid grid-cols-3 gap-1">
                              {order.items.map((item) => (
                                <div key={item.id} className="bg-white border rounded p-1.5">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-xs font-medium">{item.medicine?.name || 'Unknown'}</p>
                                      <p className="text-[10px] text-gray-500">
                                        {item.quantity} × ৳{item.price.toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="text-xs font-bold text-emerald-700">
                                      ৳{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
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