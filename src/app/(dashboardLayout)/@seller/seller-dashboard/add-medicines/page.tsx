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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from "@/actions/medicine.action";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  Pill,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/layout/skeleton";
import CategorySelectClient from "@/components/modules/categories/CategorySelectClient";

const medicineFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  basePrice: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Price must be greater than 0"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  expiryDate: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
});

interface Medicine {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  stock: number;
  manufacturer: string;
  expiryDate?: string;
  isActive: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  unit?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function MedicinesPage() {
  // State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState("10");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      basePrice: "",
      manufacturer: "",
      expiryDate: "",
      categoryId: "",
      unit: "pcs",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      const validationResult = medicineFormSchema.safeParse(value);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError?.message || "Validation failed");
        setIsSubmitting(false);
        return;
      }

      const toastId = toast.loading(isEditing ? "Updating medicine..." : "Creating medicine...");
      try {
        const medicineData = {
          name: value.name,
          description: value.description,
          basePrice: parseFloat(value.basePrice),
          manufacturer: value.manufacturer,
          expiryDate: value.expiryDate || undefined,
          categoryId: value.categoryId,
          unit: value.unit,
          stock: 0,
          isActive: false,
        };

        if (isEditing && editingId) {
          const { data, error } = await updateMedicine(editingId, medicineData);
          if (error) throw new Error(error.message);
          toast.success("Medicine updated successfully!", { id: toastId });
        } else {
          const { data, error } = await createMedicine(medicineData);
          if (error) throw new Error(error.message);
          toast.success("Medicine created successfully!", { id: toastId });
        }

        form.reset();
        setIsEditing(false);
        setEditingId(null);
        fetchMedicines();
      } catch  {
        toast.error("Something went wrong", { id: toastId });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch data
  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * parseInt(limit);

      const { data, error } = await getMedicines(
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
        setMedicines(data.data || []);
        setTotalPages(data.pagination?.totalPage || 1);
      }
    } catch  {
      toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, categoryFilter]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      // Adjust this API call based on your setup
      const res = await fetch('/api/categories?limit=100');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchCategories();
  }, []);

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

  

  // Handlers
  const handleEdit = (medicine: Medicine) => {
    // Update form values directly
    form.setFieldValue("name", medicine.name);
    form.setFieldValue("description", medicine.description);
    form.setFieldValue("basePrice", medicine.basePrice.toString());
    form.setFieldValue("manufacturer", medicine.manufacturer);
    form.setFieldValue("expiryDate", medicine.expiryDate || "");
    form.setFieldValue("categoryId", medicine.categoryId);
    form.setFieldValue("unit", medicine.unit || "pcs");
    
    setIsEditing(true);
    setEditingId(medicine.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const toastId = toast.loading("Deleting medicine...");
    try {
      const { data, error } = await deleteMedicine(id);
      if (error) throw new Error(error.message);
      
      toast.success("Medicine deleted successfully", { id: toastId });
      fetchMedicines();
    } catch {
      toast.error( "Failed to delete medicine", { id: toastId });
    }
  };

  const handleCancelEdit = () => {
    form.reset();
    setIsEditing(false);
    setEditingId(null);
  };

  // Utility functions
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Out of Stock</Badge>;
    if (stock < 10) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">Low: {stock}</Badge>;
    return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">{stock}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Active</Badge>
      : <Badge variant="outline" className="text-gray-500 text-xs">Inactive</Badge>;
  };

  // Stats
  const stats = {
    total: medicines.length,
    active: medicines.filter(m => m.isActive).length,
    outOfStock: medicines.filter(m => m.stock === 0).length,
    totalValue: medicines.reduce((sum, med) => sum + (med.basePrice * med.stock), 0).toFixed(2),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Medicine Inventory</h1>
          <p className="text-green-600 text-sm">Manage your pharmacy stock and pricing</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Medicines</p>
              <p className="text-2xl font-bold text-green-800">{stats.total}</p>
            </div>
            <Pill className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Active</p>
              <p className="text-2xl font-bold text-blue-800">{stats.active}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Out of Stock</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.outOfStock}</p>
            </div>
            <XCircle className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Total Value</p>
              <p className="text-2xl font-bold text-purple-800">${stats.totalValue}</p>
            </div>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Medicine Form - Always Visible */}
      <Card className="border-green-200 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">
              {isEditing ? "Edit Medicine" : "Add New Medicine"}
            </h3>
            {isEditing && (
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700">
                Cancel Edit
              </Button>
            )}
          </div>

          <form
            id="medicine-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup className="space-y-4">
              {/* Row 1: Name and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => 
                      !value || value.trim().length < 2 
                        ? "Name must be at least 2 characters" 
                        : undefined,
                  }}
                >
                  {(field) => {
                    const isInvalid = field.state.meta.errors.length > 0;
                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name} className="text-sm font-medium text-green-700">
                          Medicine Name *
                        </FieldLabel>
                        <Input
                          type="text"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., Paracetamol 500mg"
                          className="border-green-300 focus:ring-green-500 focus:border-green-500 h-9 text-sm"
                        />
                        {isInvalid && (
                          <FieldError className="text-xs text-red-600">{field.state.meta.errors.join(", ")}</FieldError>
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="categoryId">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-sm font-medium text-green-700">
                        Category *
                      </FieldLabel>
                      <CategorySelectClient
                        value={String(field.state.value ?? "")}
                        onValueChange={(v) => field.handleChange(String(v))}
                        placeholder="Select category"
                        disabled={false}
                      />
                    </Field>
                  )}
                </form.Field>
              </div>

              {/* Row 2: Price, Unit, and Manufacturer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <form.Field
                  name="basePrice"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return "Price is required";
                      const num = parseFloat(value);
                      if (isNaN(num)) return "Must be a valid number";
                      if (num <= 0) return "Must be greater than 0";
                      return undefined;
                    },
                  }}
                >
                  {(field) => {
                    const isInvalid = field.state.meta.errors.length > 0;
                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name} className="text-sm font-medium text-green-700">
                          Price ($) *
                        </FieldLabel>
                        <Input
                          type="number"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="border-green-300 focus:ring-green-500 focus:border-green-500 h-9 text-sm"
                        />
                        {isInvalid && (
                          <FieldError className="text-xs text-red-600">{field.state.meta.errors.join(", ")}</FieldError>
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="unit">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium text-green-700">
                        Unit *
                      </FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500 h-9 text-sm">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">Pieces</SelectItem>
                          <SelectItem value="tablets">Tablets</SelectItem>
                          <SelectItem value="capsules">Capsules</SelectItem>
                          <SelectItem value="bottles">Bottles</SelectItem>
                          <SelectItem value="tubes">Tubes</SelectItem>
                          <SelectItem value="strips">Strips</SelectItem>
                          <SelectItem value="boxes">Boxes</SelectItem>
                          <SelectItem value="packs">Packs</SelectItem>
                          <SelectItem value="sachets">Sachets</SelectItem>
                          <SelectItem value="vials">Vials</SelectItem>
                          <SelectItem value="ampoules">Ampoules</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="manufacturer">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium text-green-700">
                        Manufacturer *
                      </FieldLabel>
                      <Input
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Manufacturer name"
                        className="border-green-300 focus:ring-green-500 focus:border-green-500 h-9 text-sm"
                      />
                    </Field>
                  )}
                </form.Field>
              </div>

              {/* Row 3: Description and Expiry Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field name="description">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium text-green-700">
                        Description *
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Medicine description, dosage, usage instructions..."
                        className="min-h-[80px] border-green-300 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="expiryDate">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name} className="text-sm font-medium text-green-700">
                        Expiry Date
                      </FieldLabel>
                      <Input
                        type="date"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="border-green-300 focus:ring-green-500 focus:border-green-500 h-9 text-sm"
                      />
                    </Field>
                  )}
                </form.Field>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button
                  form="medicine-form"
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white h-9 px-6 text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-3.5 w-3.5" />
                      {isEditing ? "Update Medicine" : "Add Medicine"}
                    </>
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </div>
      </Card>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-3.5 w-3.5" />
          <Input
            placeholder="Search by medicine name or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-green-300 focus:ring-green-500 focus:border-green-500 h-9 text-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={categoryFilter || "__all"}
            onValueChange={(v) => setCategoryFilter(v === "__all" ? "" : v)}
          >
            <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500 h-9 text-sm w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500 h-9 text-sm w-[100px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Medicines Table */}
      <Card className="border-green-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-green-50">
              <TableRow>
                <TableHead className="text-green-800 font-semibold text-sm h-9 px-4">Medicine</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-9 px-4">Category</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-9 px-4">Price</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-9 px-4">Unit</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-9 px-4">Stock</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-9 px-4">Status</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-9 px-4">Expiry</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-9 px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: parseInt(limit) }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : medicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Pill className="h-10 w-10 text-gray-300" />
                      <p className="text-gray-600 font-medium">No medicines found</p>
                      <p className="text-gray-500 text-sm">
                        {search ? "Try a different search term" : "Add your first medicine above"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                medicines.map((medicine) => (
                  <TableRow key={medicine.id} className="hover:bg-green-50/30">
                    <TableCell className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{medicine.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {medicine.manufacturer}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {medicine.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-medium text-green-800">
                      ${medicine.basePrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {medicine.unit || "pcs"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {getStockBadge(medicine.stock)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {getStatusBadge(medicine.isActive)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(medicine.expiryDate)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(medicine)}
                          className="h-7 w-7 p-0 text-green-700 hover:text-green-800 hover:bg-green-100"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(medicine.id, medicine.name)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-green-200">
            <div className="text-sm text-green-700">
              Showing {medicines.length} of {page * parseInt(limit)} items
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-green-300 text-green-700 hover:bg-green-50 h-7 px-2.5 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-green-300 text-green-700 hover:bg-green-50 h-7 px-2.5 text-xs"
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