"use client";

import { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  getMedicines,
  updateMedicine,
  deleteMedicine
} from "@/actions/medicine.action";
import { searchSellers } from "@/actions/user.action";
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
  Save,
  X,
  User,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Skeleton } from "@/components/layout/skeleton";
import Swal from "sweetalert2";
import CategorySelectClient from "@/components/modules/categories/CategorySelectClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
    email: string;
  };
}

interface SellerItem {
  value: string;
  label: string;
  name?: string;
  email?: string;
}

interface Stats {
  total: number;
  active: number;
  outOfStock: number;
  totalValue: number;
}

// Type-safe debounce function
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState("10");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sellerFilter, setSellerFilter] = useState<string>("");
  const [sellerSearch, setSellerSearch] = useState<string>("");
  const [sellerSuggestions, setSellerSuggestions] = useState<SellerItem[]>([]);
  const [showSellerSuggestions, setShowSellerSuggestions] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<SellerItem | null>(null);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    outOfStock: 0,
    totalValue: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIsActive, setEditingIsActive] = useState<boolean>(false);
  const [updating, setUpdating] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const sellerSearchRef = useRef<HTMLDivElement>(null);

  // Calculate stats
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

  // Fetch medicines
  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * parseInt(limit);

      const result = await getMedicines(
        {
          search,
          categoryId: categoryFilter || undefined,
          sellerId: sellerFilter || undefined,
          page: page.toString(),
          limit,
          skip: skip.toString(),
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        { cache: "no-store" }
      );

      if (result.error) throw new Error(result.error.message);

      if (result.data) {
        const meds = result.data.data || [];
        setMedicines(meds);
        calculateStats(meds);
        setTotalPages(result.data.pagination?.totalPage || 1);
      }
    } catch {
      toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, categoryFilter, sellerFilter, calculateStats]);

  // Fetch seller suggestions
  const fetchSellerSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 1) {
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

  // Debounced medicine search
  useEffect(() => {
    const debouncedFetch = debounce(() => {
      if (page === 1) {
        fetchMedicines();
      } else {
        setPage(1);
      }
    }, 500);

    debouncedFetch();
  }, [search, limit, categoryFilter, sellerFilter]);

  // Debounced seller search
  useEffect(() => {
    const debouncedSellerSearch = debounce(() => {
      fetchSellerSuggestions(sellerSearch);
    }, 300);

    debouncedSellerSearch();
  }, [sellerSearch, fetchSellerSuggestions]);

  // Fetch medicines on page change
  useEffect(() => {
    fetchMedicines();
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
  };

  // Clear seller filter
  const handleClearSeller = () => {
    setSelectedSeller(null);
    setSellerFilter("");
    setSellerSearch("");
    setSellerSuggestions([]);
    setShowSellerSuggestions(false);
  };

  // Toggle seller suggestions
  const toggleSellerSuggestions = () => {
    if (sellerSearch.trim().length > 0) {
      setShowSellerSuggestions(!showSellerSuggestions);
    }
  };

  // Delete medicine
  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Delete Medicine?",
      text: `Are you sure you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
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

  // Update medicine status
  const handleUpdateStatus = async (medicineId: string) => {
    if (editingId !== medicineId) {
      const medicine = medicines.find(m => m.id === medicineId);
      if (medicine) {
        setEditingId(medicineId);
        setEditingIsActive(medicine.isActive);
      }
      return;
    }

    setUpdating(true);
    const toastId = toast.loading("Updating medicine status...");
    try {
      const { error } = await updateMedicine(medicineId, { 
        isActive: editingIsActive 
      });
      
      if (error) throw new Error(error.message);

      toast.success("Medicine status updated successfully!", { id: toastId });
      setEditingId(null);
      setEditingIsActive(false);
      fetchMedicines();
    } catch {
      toast.error("Failed to update medicine status", { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingIsActive(false);
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  const getStockBadge = (stock?: number) => {
    if (!stock && stock !== 0) return null;
    
    if (stock <= 0) {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
    } else if (stock <= 10) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">Low Stock</Badge>;
    } else {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">In Stock</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleViewDetails = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setDetailsOpen(true);
  };

  // Event handlers
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleSellerSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSellerSearch(e.target.value);
  const handleLimitChange = (e: ChangeEvent<HTMLSelectElement>) => setLimit(e.target.value);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Total Medicines</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Pill className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Active</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Out of Stock</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{stats.outOfStock}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <XCircle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-700">Total Value</p>
              <p className="text-2xl font-bold text-violet-900 mt-1">৳{stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-violet-100 rounded-xl">
              <DollarSign className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border border-emerald-200 bg-white p-5">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Medicine Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-4 w-4" />
              <Input
                placeholder="Search medicines by name..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10 border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-11 text-sm bg-white"
              />
            </div>
            
            {/* Category Filter */}
            <div className="w-full lg:w-64">
              <CategorySelectClient
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                placeholder="All Categories"
                disabled={false}
                className="border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-11 bg-white"
              />
            </div>

            {/* Seller Search */}
            <div className="relative w-full lg:w-80" ref={sellerSearchRef}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search seller..."
                  value={sellerSearch}
                  onChange={handleSellerSearchChange}
                  onFocus={() => sellerSearch.trim() && setShowSellerSuggestions(true)}
                  className="pl-10 pr-10 border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 h-11 text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={toggleSellerSuggestions}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-600"
                >
                  {showSellerSuggestions ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {selectedSeller && (
                  <button
                    type="button"
                    onClick={handleClearSeller}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Seller Suggestions */}
              {showSellerSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-emerald-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {loadingSellers ? (
                    <div className="p-4 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-500" />
                      <p className="text-xs text-gray-500 mt-2">Searching...</p>
                    </div>
                  ) : sellerSuggestions.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">No sellers found</p>
                    </div>
                  ) : (
                    <ul className="py-2">
                      {sellerSuggestions.map((seller) => (
                        <li
                          key={seller.value}
                          className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-emerald-100 last:border-b-0 transition-colors"
                          onClick={() => handleSelectSeller(seller)}
                        >
                          <div className="font-medium text-emerald-900">{seller.label}</div>
                          {seller.email && (
                            <div className="text-xs text-emerald-600 mt-1">{seller.email}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Limit Selector */}
            <select 
              value={limit} 
              onChange={handleLimitChange}
              className="h-11 px-4 border border-emerald-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          {/* Selected Seller Badge */}
          {selectedSeller && (
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 h-9 px-4 flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Seller: {selectedSeller.label}
                <button
                  onClick={handleClearSeller}
                  className="ml-2 hover:text-emerald-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Medicines Table */}
      <Card className="border border-emerald-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-50 to-white">
              <tr>
                <th className="h-12 px-4 text-left font-semibold text-emerald-900">Medicine</th>
                <th className="h-12 px-4 text-left font-semibold text-emerald-900">Category</th>
                <th className="h-12 px-4 text-left font-semibold text-emerald-900">Price</th>
                <th className="h-12 px-4 text-left font-semibold text-emerald-900">Stock</th>
                <th className="h-12 px-4 text-left font-semibold text-emerald-900">Seller</th>
                <th className="h-12 px-4 text-left font-semibold text-emerald-900">Status</th>
                <th className="h-12 px-4 text-left font-semibold text-emerald-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: parseInt(limit) }, (_, i) => (
                  <tr key={i} className="hover:bg-emerald-50/30">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-emerald-100 rounded-full">
                        <Pill className="h-8 w-8 text-emerald-400" />
                      </div>
                      <p className="text-emerald-700 font-medium">No medicines found</p>
                      <p className="text-sm text-emerald-600">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                medicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-emerald-50/50 border-b border-emerald-100 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {medicine.photoUrl ? (
                          <img
                            src={medicine.photoUrl}
                            alt={medicine.name}
                            className="h-10 w-10 rounded-lg object-cover border border-emerald-200"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Pill className="h-5 w-5 text-emerald-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-emerald-900">{medicine.name}</p>
                          <p className="text-xs text-emerald-600">{medicine.manufacturer}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                        {medicine.category.name}
                      </Badge>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div>
                        {medicine.discountPercent ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-emerald-900">
                              ৳{calculateDiscountedPrice(medicine.basePrice, medicine.discountPercent).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              ৳{medicine.basePrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-emerald-900">
                            ৳{medicine.basePrice.toFixed(2)}
                          </span>
                        )}
                        <p className="text-xs text-emerald-600 mt-1">per {medicine.unit || 'unit'}</p>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium text-emerald-900">{medicine.stock || 0}</span>
                        {getStockBadge(medicine.stock)}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-emerald-900">{medicine.seller.name}</p>
                          <p className="text-xs text-emerald-600">{medicine.seller.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      {editingId === medicine.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={editingIsActive ? "default" : "outline"}
                            onClick={() => setEditingIsActive(true)}
                            className={`h-8 ${editingIsActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-300'}`}
                          >
                            Active
                          </Button>
                          <Button
                            size="sm"
                            variant={!editingIsActive ? "default" : "outline"}
                            onClick={() => setEditingIsActive(false)}
                            className={`h-8 ${!editingIsActive ? 'bg-gray-600 hover:bg-gray-700' : 'border-gray-300'}`}
                          >
                            Inactive
                          </Button>
                        </div>
                      ) : medicine.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">Inactive</Badge>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {editingId === medicine.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(medicine.id)}
                              disabled={updating}
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(medicine.id)}
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Edit status"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(medicine)}
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(medicine.id, medicine.name)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-emerald-200">
            <div className="text-sm text-emerald-700">
              Showing {medicines.length} of {stats.total} medicines
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 px-4 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Previous
              </Button>
              <div className="flex items-center h-9 px-4 bg-emerald-50 text-emerald-800 rounded-md font-medium">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-9 px-4 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Medicine Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl border border-emerald-200">
          <DialogHeader className="border-b border-emerald-100 pb-4">
            <DialogTitle className="text-emerald-900">Medicine Details</DialogTitle>
            <DialogDescription className="text-emerald-600">
              Complete information about {selectedMedicine?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMedicine && (
            <div className="space-y-6 py-2">
              <div className="flex gap-6">
                {selectedMedicine.photoUrl ? (
                  <img
                    src={selectedMedicine.photoUrl}
                    alt={selectedMedicine.name}
                    className="h-32 w-32 object-cover rounded-xl border border-emerald-200"
                  />
                ) : (
                  <div className="h-32 w-32 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 flex items-center justify-center">
                    <Pill className="h-14 w-14 text-emerald-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-emerald-900">{selectedMedicine.name}</h3>
                  <p className="text-emerald-700 mt-1">{selectedMedicine.manufacturer}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {selectedMedicine.category.name}
                    </Badge>
                    <Badge variant={selectedMedicine.isActive ? "default" : "secondary"} className={selectedMedicine.isActive ? "bg-emerald-600" : ""}>
                      {selectedMedicine.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {getStockBadge(selectedMedicine.stock)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-emerald-800">Pricing</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Base Price:</span>
                      <span className="font-medium">৳{selectedMedicine.basePrice.toFixed(2)}</span>
                    </div>
                    {selectedMedicine.discountPercent && (
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Discount:</span>
                        <span className="font-medium text-emerald-600">{selectedMedicine.discountPercent}%</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-emerald-100">
                      <span className="font-semibold text-emerald-800">Final Price:</span>
                      <span className="font-bold text-emerald-900">
                        ৳{calculateDiscountedPrice(selectedMedicine.basePrice, selectedMedicine.discountPercent).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Unit:</span>
                      <span className="font-medium">{selectedMedicine.unit || 'pcs'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-emerald-800">Stock Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Current Stock:</span>
                      <span className="font-medium">{selectedMedicine.stock || 0}</span>
                    </div>
                    {selectedMedicine.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Expiry Date:</span>
                        <span className="font-medium">{formatDate(selectedMedicine.expiryDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-emerald-800">Description</h4>
                <Textarea
                  value={selectedMedicine.description}
                  readOnly
                  className="min-h-[100px] text-sm bg-emerald-50 border-emerald-200"
                />
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-emerald-800">Seller Information</h4>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-200">
                  <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">{selectedMedicine.seller.name}</p>
                    <p className="text-sm text-emerald-600">{selectedMedicine.seller.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}