"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getMyMedicines, updateMedicine, deleteMedicine } from "@/actions/medicine.action";
import { toast } from "sonner";
import {
  Search,
  Edit,
  Trash2,
  Pill,
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  Package,
  Tag,
  MessageSquare,
  Save,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/layout/skeleton";
import Swal from "sweetalert2";
import CategorySelectClient from "@/components/modules/categories/CategorySelectClient";

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
  createdAt: string;
  updatedAt: string;
  unit?: string;
  stock?: number;
  discountPercent?: number;
  seller: {
    id: string;
    name: string;
  };
  _count?: {
    reviews: number;
  };
}

interface UpdateMedicineData {
  stock?: number;
  discountPercent?: number;
}

interface Stats {
  total: number;
  active: number;
  outOfStock: number;
  totalValue: number;
}

export default function MedicinesInventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState("10");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    outOfStock: 0,
    totalValue: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<UpdateMedicineData>({});
  const [updating, setUpdating] = useState(false);

  const calculateStats = useCallback((meds: Medicine[]) => {
    const total = meds.length;
    const active = meds.filter(m => m.isActive).length;
    const outOfStock = meds.filter(m => (m.stock || 0) <= 0).length;
    const totalValue = meds.reduce((sum, med) => {
      const price = med.discountPercent 
        ? med.basePrice * (1 - med.discountPercent / 100)
        : med.basePrice;
      return sum + (price * (med.stock || 0));
    }, 0);

    setStats({ total, active, outOfStock, totalValue });
  }, []);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * parseInt(limit);

      const { data, error } = await getMyMedicines(
        {
          search,
          categoryId: categoryFilter || undefined,
          page: page.toString(),
          limit,
          skip: skip.toString(),
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        { cache: "no-store" }
      );

      if (error) throw new Error(error.message);

      if (data) {
        const meds = data.data || [];
        setMedicines(meds);
        calculateStats(meds);
        setTotalPages(data.pagination?.totalPage || 1);
      }
    } catch {
      toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, categoryFilter, calculateStats]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        fetchMedicines();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, limit, categoryFilter]);

  useEffect(() => {
    fetchMedicines();
  }, [page]);

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Delete Medicine?",
      text: `Are you sure you want to delete "${name}"? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#ffffff",
      color: "#374151",
      iconColor: "#ef4444",
      customClass: {
        confirmButton: "hover:bg-red-700 cursor-pointer",
        cancelButton: "hover:bg-gray-200 cursor-pointer"
      }
    });

    if (result.isConfirmed) {
      const toastId = toast.loading("Deleting medicine...");
      try {
        const { error } = await deleteMedicine(id);
        if (error) throw new Error(error.message);

        toast.success("Medicine deleted successfully", { id: toastId });
        fetchMedicines();
      } catch {
        toast.error("Failed to delete medicine", { id: toastId });
      }
    }
  };

  const handleUpdate = async (medicine: Medicine) => {
    if (!editingData.stock && editingData.stock !== 0 && !editingData.discountPercent && editingData.discountPercent !== 0) {
      toast.error("Please enter stock or discount value");
      return;
    }

    setUpdating(true);
    const toastId = toast.loading("Updating medicine...");
    try {
      const updateData: UpdateMedicineData = {};
      if (editingData.stock !== undefined) updateData.stock = editingData.stock;
      if (editingData.discountPercent !== undefined) updateData.discountPercent = editingData.discountPercent;

      const { error } = await updateMedicine(medicine.id, updateData);
      if (error) throw new Error(error.message);

      toast.success("Medicine updated successfully!", { id: toastId });
      setEditingId(null);
      setEditingData({});
      fetchMedicines();
    } catch {
      toast.error("Failed to update medicine", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const handleStartEdit = (medicine: Medicine) => {
    setEditingId(medicine.id);
    setEditingData({
      stock: medicine.stock,
      discountPercent: medicine.discountPercent,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  const getStockBadge = (stock?: number) => {
    if (!stock && stock !== 0) return null;
    
    if (stock <= 0) {
      return <Badge variant="destructive" className="text-xs cursor-pointer">Out of Stock</Badge>;
    } else if (stock <= 10) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs cursor-pointer">Low Stock</Badge>;
    } else {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs cursor-pointer">In Stock</Badge>;
    }
  };

  const getDiscountBadge = (discount?: number) => {
    if (!discount) return null;
    return (
      <Badge className="bg-violet-100 text-violet-800 border-violet-300 text-xs cursor-pointer">
        -{discount}%
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl font-semibold text-emerald-900">Medicine Inventory</h1>
          <p className="text-emerald-600 text-sm">Manage stock, pricing, and discounts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border border-emerald-200 bg-emerald-50/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Total Medicines</p>
              <p className="text-lg font-semibold text-emerald-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Pill className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="border border-emerald-200 bg-emerald-50/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Active</p>
              <p className="text-lg font-semibold text-emerald-600">{stats.active}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="border border-amber-200 bg-amber-50/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Out of Stock</p>
              <p className="text-lg font-semibold text-amber-600">{stats.outOfStock}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <XCircle className="h-4 w-4 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="border border-violet-200 bg-violet-50/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-700">Total Value</p>
              <p className="text-lg font-semibold text-violet-600">${stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-violet-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-violet-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-emerald-500 h-4 w-4" />
          <Input
            placeholder="Search medicines by name or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-9 text-sm cursor-text"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Button
              variant={categoryFilter === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("")}
              className={`h-9 cursor-pointer ${
                categoryFilter === "" 
                  ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              All
            </Button>
            
            {/* CategorySelectClient with combobox styling */}
            <div className="w-[200px]">
              <CategorySelectClient
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
                placeholder="Filter by category"
                disabled={false}
                className="border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-9 cursor-pointer"
              />
            </div>
          </div>

          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-9 w-28 cursor-pointer">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="cursor-pointer">10</SelectItem>
              <SelectItem value="20" className="cursor-pointer">20</SelectItem>
              <SelectItem value="50" className="cursor-pointer">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border border-emerald-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-emerald-50">
              <TableRow className="hover:bg-emerald-50">
                <TableHead className="h-9 px-3 font-medium text-emerald-800">Medicine</TableHead>
                <TableHead className="h-9 px-3 font-medium text-emerald-800">Category</TableHead>
                <TableHead className="h-9 px-3 font-medium text-emerald-800">Price</TableHead>
                <TableHead className="h-9 px-3 font-medium text-emerald-800">Stock</TableHead>
                <TableHead className="h-9 px-3 font-medium text-emerald-800">Discount</TableHead>
                <TableHead className="h-9 px-3 font-medium text-emerald-800">Status</TableHead>
                <TableHead className="h-9 px-3 font-medium text-emerald-800">Expiry</TableHead>
                <TableHead className="h-9 px-3 font-medium text-emerald-800">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: parseInt(limit) }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-3 py-2.5"><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-3 py-2.5"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : medicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-3 py-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Pill className="h-8 w-8 text-emerald-300" />
                      <p className="text-emerald-600 font-medium">No medicines found</p>
                      <p className="text-emerald-500 text-sm">
                        {search || categoryFilter ? "Try different filters" : "Start by adding medicines"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                medicines.map((medicine) => (
                  <TableRow key={medicine.id} className="hover:bg-emerald-50/30">
                    <TableCell className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {medicine.photoUrl ? (
                          <div className="h-8 w-8 flex-shrink-0 cursor-pointer">
                            <img
                              src={medicine.photoUrl}
                              alt={medicine.name}
                              className="h-8 w-8 rounded-md object-cover border border-emerald-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-medicine.png";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 flex-shrink-0 bg-emerald-100 rounded-md flex items-center justify-center cursor-pointer">
                            <Pill className="h-4 w-4 text-emerald-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate cursor-text">{medicine.name}</p>
                          <p className="text-xs text-gray-500 truncate cursor-text">{medicine.manufacturer}</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-3 py-2.5">
                      <Badge variant="outline" className="text-xs border-emerald-300 bg-emerald-50 text-emerald-700 cursor-pointer">
                        {medicine.category.name}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-3 py-2.5">
                      <div className="space-y-0.5">
                        {medicine.discountPercent ? (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-emerald-900 cursor-text">
                                ${calculateDiscountedPrice(medicine.basePrice, medicine.discountPercent).toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-400 line-through cursor-text">
                                ${medicine.basePrice.toFixed(2)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-emerald-900 cursor-text">
                            ${medicine.basePrice.toFixed(2)}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 cursor-text">per {medicine.unit || 'unit'}</p>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-3 py-2.5">
                      {editingId === medicine.id ? (
                        <div className="space-y-1.5">
                          <Input
                            type="number"
                            value={editingData.stock ?? ""}
                            onChange={(e) => setEditingData({...editingData, stock: parseInt(e.target.value) || 0})}
                            className="h-7 text-sm border-emerald-300 focus:ring-emerald-500 cursor-text"
                            placeholder="Stock"
                            min="0"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-sm text-gray-700 cursor-text">{medicine.stock || 0}</span>
                          {getStockBadge(medicine.stock)}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="px-3 py-2.5">
                      {editingId === medicine.id ? (
                        <div className="space-y-1.5">
                          <Input
                            type="number"
                            value={editingData.discountPercent ?? ""}
                            onChange={(e) => setEditingData({...editingData, discountPercent: parseInt(e.target.value) || 0})}
                            className="h-7 text-sm border-emerald-300 focus:ring-emerald-500 cursor-text"
                            placeholder="Discount %"
                            min="0"
                            max="100"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-sm text-gray-700 cursor-text">{medicine.discountPercent || 0}%</span>
                          {getDiscountBadge(medicine.discountPercent)}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="px-3 py-2.5">
                      {medicine.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs cursor-pointer">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 text-xs cursor-pointer">Inactive</Badge>
                      )}
                    </TableCell>

                    <TableCell className="px-3 py-2.5">
                      <span className="text-sm text-gray-700 cursor-text">
                        {formatDate(medicine.expiryDate)}
                      </span>
                    </TableCell>
                    
                    <TableCell className="px-3 py-2.5">
                      {editingId === medicine.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdate(medicine)}
                            disabled={updating}
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          >
                            {updating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(medicine)}
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            title="Edit stock/discount"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          {/* Reviews button placeholder - will navigate to separate page */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {/* Navigate to reviews page */}}
                            className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer relative"
                            title={`View reviews (${medicine._count?.reviews || 0})`}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {medicine._count?.reviews ? (
                              <span className="absolute -top-1 -right-1 bg-amber-100 text-amber-800 text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center">
                                {medicine._count.reviews > 9 ? '9+' : medicine._count.reviews}
                              </span>
                            ) : null}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(medicine.id, medicine.name)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2.5 border-t border-emerald-200">
            <div className="text-xs text-emerald-700 cursor-text">
              Showing {medicines.length} items
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 px-2.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 px-2.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}