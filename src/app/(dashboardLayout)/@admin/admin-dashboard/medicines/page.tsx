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
  Filter,
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
  const [statusFilter, setStatusFilter] = useState<string>(""); // "" = all, "active", "inactive"
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

      // Convert status filter to isActive boolean
      let isActive: boolean | undefined = undefined;
      if (statusFilter === "active") isActive = true;
      if (statusFilter === "inactive") isActive = false;

      const result = await getMedicines(
        {
          search,
          categoryId: categoryFilter || undefined,
          sellerId: sellerFilter || undefined,
          isActive,
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
  }, [search, page, limit, categoryFilter, sellerFilter, statusFilter, calculateStats]);

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
  }, [search, limit, categoryFilter, sellerFilter, statusFilter]);

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
      return <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Out</Badge>;
    } else if (stock <= 10) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] h-5 px-1.5">Low</Badge>;
    } else {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] h-5 px-1.5">In</Badge>;
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
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value);

  return (
    <div className="space-y-4">
      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700">Total</p>
              <p className="text-xl font-bold text-emerald-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Pill className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700">Active</p>
              <p className="text-xl font-bold text-emerald-900">{stats.active}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700">Out Stock</p>
              <p className="text-xl font-bold text-amber-900">{stats.outOfStock}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <XCircle className="h-4 w-4 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-violet-700">Value</p>
              <p className="text-xl font-bold text-violet-900">৳{stats.totalValue.toFixed(0)}</p>
            </div>
            <div className="p-2 bg-violet-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-violet-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters - Compact */}
      <Card className="border border-emerald-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Medicine Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-emerald-500 h-3.5 w-3.5" />
            <Input
              placeholder="Search medicines..."
              value={search}
              onChange={handleSearchChange}
              className="pl-7 h-9 text-xs border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>
          
          {/* Category Filter - With "Select One" option */}
          <div className="w-36">
            <CategorySelectClient
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              placeholder="Select One"
              disabled={false}
              className="h-9 text-xs border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
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
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
          </div>

          {/* Seller Search */}
          <div className="relative w-48" ref={sellerSearchRef}>
            <div className="relative">
              <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-emerald-500 h-3.5 w-3.5" />
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
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleSellerSuggestions}
                  className="text-emerald-500 hover:text-emerald-600"
                >
                  {showSellerSuggestions ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
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
                        {seller.email && (
                          <div className="text-[10px] text-emerald-600">{seller.email}</div>
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
            className="h-9 px-2 border border-emerald-300 rounded-md text-xs focus:ring-emerald-500 focus:border-emerald-500 bg-white w-16"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>

          {/* Active Filters Badges */}
          <div className="flex items-center gap-1">
            {selectedSeller && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 h-7 px-2 flex items-center gap-1 text-xs">
                <User className="h-3 w-3" />
                {selectedSeller.label}
                <button onClick={handleClearSeller} className="ml-1 hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Medicines Table - Compact */}
      <Card className="border border-emerald-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-emerald-50 to-white">
              <tr>
                <th className="h-8 px-2 text-left font-semibold text-emerald-900">Medicine</th>
                <th className="h-8 px-2 text-left font-semibold text-emerald-900">Category</th>
                <th className="h-8 px-2 text-left font-semibold text-emerald-900">Price</th>
                <th className="h-8 px-2 text-left font-semibold text-emerald-900">Stock</th>
                <th className="h-8 px-2 text-left font-semibold text-emerald-900">Seller</th>
                <th className="h-8 px-2 text-left font-semibold text-emerald-900">Status</th>
                <th className="h-8 px-2 text-left font-semibold text-emerald-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: parseInt(limit) }, (_, i) => (
                  <tr key={i} className="hover:bg-emerald-50/30">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-2 py-2">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-2 bg-emerald-100 rounded-full">
                        <Pill className="h-5 w-5 text-emerald-400" />
                      </div>
                      <p className="text-emerald-700 font-medium text-xs">No medicines found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                medicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-emerald-50/50 border-b border-emerald-100">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        {medicine.photoUrl ? (
                          <img
                            src={medicine.photoUrl}
                            alt={medicine.name}
                            className="h-6 w-6 rounded object-cover border border-emerald-200"
                          />
                        ) : (
                          <div className="h-6 w-6 bg-emerald-100 rounded flex items-center justify-center">
                            <Pill className="h-3 w-3 text-emerald-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-emerald-900 text-xs">{medicine.name}</p>
                          <p className="text-[10px] text-emerald-600">{medicine.manufacturer}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-2 py-2">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] h-5 px-1.5">
                        {medicine.category.name}
                      </Badge>
                    </td>
                    
                    <td className="px-2 py-2">
                      <div>
                        {medicine.discountPercent ? (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-emerald-900 text-xs">
                              ৳{calculateDiscountedPrice(medicine.basePrice, medicine.discountPercent).toFixed(0)}
                            </span>
                            <span className="text-[10px] text-gray-400 line-through">
                              ৳{medicine.basePrice.toFixed(0)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-emerald-900 text-xs">
                            ৳{medicine.basePrice.toFixed(0)}
                          </span>
                        )}
                        <p className="text-[10px] text-emerald-600">/{medicine.unit || 'unit'}</p>
                      </div>
                    </td>
                    
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-emerald-500" />
                        <span className="font-medium text-emerald-900 text-xs">{medicine.stock || 0}</span>
                        {getStockBadge(medicine.stock)}
                      </div>
                    </td>
                    
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <div className="h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-emerald-900 text-xs">{medicine.seller.name}</p>
                          <p className="text-[10px] text-emerald-600">{medicine.seller.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-2 py-2">
                      {editingId === medicine.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={editingIsActive ? "default" : "outline"}
                            onClick={() => setEditingIsActive(true)}
                            className={`h-6 px-2 text-xs ${editingIsActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-300'}`}
                          >
                            A
                          </Button>
                          <Button
                            size="sm"
                            variant={!editingIsActive ? "default" : "outline"}
                            onClick={() => setEditingIsActive(false)}
                            className={`h-6 px-2 text-xs ${!editingIsActive ? 'bg-gray-600 hover:bg-gray-700' : 'border-gray-300'}`}
                          >
                            I
                          </Button>
                        </div>
                      ) : medicine.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] h-5 px-1.5">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600 text-[10px] h-5 px-1.5">Inactive</Badge>
                      )}
                    </td>
                    
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-0.5">
                        {editingId === medicine.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(medicine.id)}
                              disabled={updating}
                              className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(medicine.id)}
                              className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Edit status"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(medicine)}
                              className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="View details"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(medicine.id, medicine.name)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
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

        {/* Pagination - Compact */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-2 py-2 border-t border-emerald-200">
            <div className="text-[10px] text-emerald-700">
              {medicines.length} of {stats.total}
            </div>
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
              <div className="flex items-center h-6 px-2 bg-emerald-50 text-emerald-800 rounded-md text-xs font-medium">
                {page}/{totalPages}
              </div>
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

      {/* Medicine Details Dialog - Compact */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl border border-emerald-200">
          <DialogHeader className="border-b border-emerald-100 pb-3">
            <DialogTitle className="text-emerald-900 text-base">Medicine Details</DialogTitle>
            <DialogDescription className="text-emerald-600 text-xs">
              Information about {selectedMedicine?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMedicine && (
            <div className="space-y-4 py-1">
              <div className="flex gap-4">
                {selectedMedicine.photoUrl ? (
                  <img
                    src={selectedMedicine.photoUrl}
                    alt={selectedMedicine.name}
                    className="h-20 w-20 object-cover rounded-lg border border-emerald-200"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 flex items-center justify-center">
                    <Pill className="h-8 w-8 text-emerald-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-emerald-900">{selectedMedicine.name}</h3>
                  <p className="text-xs text-emerald-700 mt-0.5">{selectedMedicine.manufacturer}</p>
                  <div className="flex gap-1 mt-2">
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px] h-5 px-1.5">
                      {selectedMedicine.category.name}
                    </Badge>
                    <Badge variant={selectedMedicine.isActive ? "default" : "secondary"} className={selectedMedicine.isActive ? "bg-emerald-600 text-[10px] h-5 px-1.5" : "text-[10px] h-5 px-1.5"}>
                      {selectedMedicine.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {getStockBadge(selectedMedicine.stock)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-emerald-800 text-xs">Pricing</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Base:</span>
                      <span className="font-medium">৳{selectedMedicine.basePrice.toFixed(0)}</span>
                    </div>
                    {selectedMedicine.discountPercent && (
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Discount:</span>
                        <span className="font-medium text-emerald-600">{selectedMedicine.discountPercent}%</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-emerald-100">
                      <span className="font-semibold text-emerald-800">Final:</span>
                      <span className="font-bold text-emerald-900">
                        ৳{calculateDiscountedPrice(selectedMedicine.basePrice, selectedMedicine.discountPercent).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Unit:</span>
                      <span className="font-medium">{selectedMedicine.unit || 'pcs'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-emerald-800 text-xs">Stock</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Current:</span>
                      <span className="font-medium">{selectedMedicine.stock || 0}</span>
                    </div>
                    {selectedMedicine.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Expiry:</span>
                        <span className="font-medium">{formatDate(selectedMedicine.expiryDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold text-emerald-800 text-xs">Description</h4>
                <Textarea
                  value={selectedMedicine.description}
                  readOnly
                  className="min-h-[60px] text-xs bg-emerald-50 border-emerald-200"
                />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold text-emerald-800 text-xs">Seller</h4>
                <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-200">
                  <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900 text-xs">{selectedMedicine.seller.name}</p>
                    <p className="text-[10px] text-emerald-600">{selectedMedicine.seller.email}</p>
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