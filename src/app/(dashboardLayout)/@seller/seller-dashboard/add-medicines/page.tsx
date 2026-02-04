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
import { getMyMedicines, createMedicine, updateMedicine, deleteMedicine } from "@/actions/medicine.action";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  Pill,
  Loader2,
  Image,
} from "lucide-react";
import { Skeleton } from "@/components/layout/skeleton";
import CategorySelectClient from "@/components/modules/categories/CategorySelectClient";
import Swal from "sweetalert2";

const medicineFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  basePrice: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Price must be greater than 0"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  expiryDate: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  photoUrl: z.string().optional(),
});

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
}

export default function MedicinesPage() {
  // State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState("10");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      photoUrl: "",
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
          photoUrl: value.photoUrl || undefined,
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
        setImagePreview("");
        setIsEditing(false);
        setEditingId(null);
        fetchMedicines();
      } catch {
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
        setMedicines(data.data || []);
        setTotalPages(data.pagination?.totalPage || 1);
      }
    } catch {
      toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, categoryFilter]);

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
    form.setFieldValue("name", medicine.name);
    form.setFieldValue("description", medicine.description);
    form.setFieldValue("basePrice", medicine.basePrice.toString());
    form.setFieldValue("manufacturer", medicine.manufacturer);
    form.setFieldValue("expiryDate", new Date(medicine.expiryDate || "").toISOString().split("T")[0]);
    form.setFieldValue("categoryId", medicine.categoryId);
    form.setFieldValue("unit", medicine.unit || "pcs");
    form.setFieldValue("photoUrl", medicine.photoUrl || "");

    if (medicine.photoUrl) {
      setImagePreview(medicine.photoUrl);
    }

    setIsEditing(true);
    setEditingId(medicine.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${name}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#ffffff",
      color: "#374151",
      iconColor: "#ef4444",
      customClass: {
        confirmButton: "hover:bg-red-700 transition-colors duration-200",
        cancelButton: "hover:bg-gray-200 transition-colors duration-200"
      }
    });

    if (result.isConfirmed) {
      const toastId = toast.loading("Deleting medicine...");
      try {
        const { data, error } = await deleteMedicine(id);
        if (error) throw new Error(error.message);

        toast.success("Medicine deleted successfully", { id: toastId });
        fetchMedicines();
      } catch {
        toast.error("Failed to delete medicine", { id: toastId });
      }
    }
  };

  const handleCancelEdit = async () => {
    if (isEditing) {
      const result = await Swal.fire({
        title: "Cancel Edit?",
        text: "Are you sure you want to cancel editing? All changes will be lost.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, cancel",
        cancelButtonText: "Continue editing",
        reverseButtons: true,
        background: "#ffffff",
        color: "#374151",
        iconColor: "#16a34a",
        customClass: {
          confirmButton: "hover:bg-green-700 transition-colors duration-200",
          cancelButton: "hover:bg-gray-200 transition-colors duration-200"
        }
      });

      if (result.isConfirmed) {
        form.reset();
        setImagePreview("");
        setIsEditing(false);
        setEditingId(null);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setFieldValue("photoUrl", value);

    if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
      setImagePreview(value);
    } else {
      setImagePreview("");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge className="bg-green-100 text-green-800 border-green-300 text-xs hover:cursor-pointer">Active</Badge>
      : <Badge variant="outline" className="text-gray-500 text-xs hover:cursor-pointer">Inactive</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        {isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancelEdit} 
            className="text-gray-500 hover:text-gray-700 hover:cursor-pointer hover:bg-gray-100"
          >
            Cancel Edit
          </Button>
        )}
      </div>

      {/* Medicine Form - Two Column Layout */}
      <Card className="border-green-200 shadow-sm">
        <div className="p-3">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-green-800">
              {isEditing ? "Edit Medicine" : "Add New Medicine"}
            </h3>
          </div>

          <form
            id="medicine-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
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

                  {/* Medicine Name */}
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
                            className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text"
                          />
                          {isInvalid && (
                            <FieldError className="text-xs text-red-600 mt-1">{field.state.meta.errors.join(", ")}</FieldError>
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>

                  {/* Price and Unit - Side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text"
                            />
                            {isInvalid && (
                              <FieldError className="text-xs text-red-600 mt-1">{field.state.meta.errors.join(", ")}</FieldError>
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
                            <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-pointer">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pcs" className="hover:cursor-pointer">Pieces</SelectItem>
                              <SelectItem value="tablets" className="hover:cursor-pointer">Tablets</SelectItem>
                              <SelectItem value="capsules" className="hover:cursor-pointer">Capsules</SelectItem>
                              <SelectItem value="bottles" className="hover:cursor-pointer">Bottles</SelectItem>
                              <SelectItem value="tubes" className="hover:cursor-pointer">Tubes</SelectItem>
                              <SelectItem value="strips" className="hover:cursor-pointer">Strips</SelectItem>
                              <SelectItem value="boxes" className="hover:cursor-pointer">Boxes</SelectItem>
                              <SelectItem value="packs" className="hover:cursor-pointer">Packs</SelectItem>
                              <SelectItem value="sachets" className="hover:cursor-pointer">Sachets</SelectItem>
                              <SelectItem value="vials" className="hover:cursor-pointer">Vials</SelectItem>
                              <SelectItem value="ampoules" className="hover:cursor-pointer">Ampoules</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  {/* Expiry Date */}
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
                          className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text"
                        />
                      </Field>
                    )}
                  </form.Field>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
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
                          className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text"
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="photoUrl">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name} className="text-sm font-medium text-green-700">
                          Image URL
                        </FieldLabel>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <Input
                              type="url"
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={handleImageChange}
                              placeholder="https://example.com/image.jpg"
                              className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-text flex-1"
                            />
                            {imagePreview && (
                              <div className="relative h-10 w-10 border-2 border-green-300 rounded-md overflow-hidden hover:cursor-pointer">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={() => setImagePreview("")}
                                />
                              </div>
                            )}
                          </div>
                          {!imagePreview && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <Image className="h-3.5 w-3.5" />
                              <span>Enter a valid image URL to see preview</span>
                            </div>
                          )}
                        </div>
                      </Field>
                    )}
                  </form.Field>
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
                          className="min-h-[140px] border-green-300 focus:ring-green-500 focus:border-green-500 hover:cursor-text"
                        />
                      </Field>
                    )}
                  </form.Field>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  form="medicine-form"
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white h-10 px-6 hover:cursor-pointer transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4 hover:cursor-text" />
          <Input
            placeholder="Search by medicine name or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-green-300 focus:ring-green-500 focus:border-green-500 h-10 text-sm hover:cursor-text"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Category Filter with separate "All" button */}
          <div className="flex items-center gap-2">
            <Button
              variant={categoryFilter === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("")}
              className={`h-10 ${
                categoryFilter === "" 
                  ? "bg-green-600 text-white hover:bg-green-700 hover:cursor-pointer" 
                  : "border-green-300 text-green-700 hover:bg-green-50 hover:cursor-pointer"
              }`}
            >
              All
            </Button>
            <div className="w-[180px]">
              <CategorySelectClient
                value={categoryFilter || ""}
                onValueChange={(v) => setCategoryFilter(v)}
                placeholder="Filter by category"
                disabled={false}
              />
            </div>
          </div>

          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500 h-10 hover:cursor-pointer w-[110px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="hover:cursor-pointer">10</SelectItem>
              <SelectItem value="20" className="hover:cursor-pointer">20</SelectItem>
              <SelectItem value="50" className="hover:cursor-pointer">50</SelectItem>
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
                <TableHead className="text-green-800 font-semibold text-sm h-10 px-4">Medicine</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-10 px-4">Category</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-10 px-4">Price</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-10 px-4">Unit</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-10 px-4">Status</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-10 px-4">Expiry</TableHead>
                <TableHead className="text-green-800 font-semibold text-sm h-10 px-4">Actions</TableHead>
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
                    <TableCell className="px-4 py-3"><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : medicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Pill className="h-12 w-12 text-green-300" />
                      <p className="text-gray-600 font-medium">No medicines found</p>
                      <p className="text-green-500 text-sm">
                        {search ? "Try a different search term" : "Add your first medicine above"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                medicines.map((medicine) => (
                  <TableRow key={medicine.id} className="hover:bg-green-50/30">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {medicine.photoUrl ? (
                          <div className="h-10 w-10 shrink-0 hover:cursor-pointer">
                            <img
                              src={medicine.photoUrl}
                              alt={medicine.name}
                              className="h-10 w-10 rounded-lg object-cover border-2 border-green-200 hover:border-green-400 transition-all duration-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 flex-shrink-0 bg-green-100 rounded-lg flex items-center justify-center hover:cursor-pointer hover:bg-green-200 transition-all duration-200">
                            <Pill className="h-5 w-5 text-green-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm hover:cursor-text">{medicine.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px] hover:cursor-text">
                            {medicine.manufacturer}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="outline" className="text-xs border-green-300 hover:cursor-pointer hover:bg-green-50">
                        {medicine.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm font-medium text-green-800 hover:cursor-text">
                        ${medicine.basePrice.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700 capitalize hover:cursor-text">
                        {medicine.unit || "pcs"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {getStatusBadge(medicine.isActive)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700 hover:cursor-text">
                        {formatDate(medicine.expiryDate)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(medicine)}
                          className="h-8 w-8 p-0 text-green-700 hover:text-green-800 hover:bg-green-100 hover:cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(medicine.id, medicine.name)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 hover:cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
            <div className="text-sm text-green-700 hover:cursor-text">
              Showing {medicines.length} of {page * parseInt(limit)} items
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-green-300 text-green-700 hover:bg-green-50 h-8 px-3 text-xs hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-green-300 text-green-700 hover:bg-green-50 h-8 px-3 text-xs hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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