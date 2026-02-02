"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationComponent } from "@/components/ui/pagination-component";
import { ConfirmAlert, InfoAlert } from "@/components/ui/common-alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/layout/tooltip";
import { Skeleton } from "@/components/layout/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { deleteCategory, getCategories } from "@/actions/category.action";
import { toast } from "sonner";
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Filter,
  RefreshCw,
  Eye,
  Package,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { EditCategoryForm } from "./editCategoryForm";
import { CategoryForm } from "./categoryForm";
import { DialogTrigger } from "@radix-ui/react-dialog";

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    medicines: number;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [limit, setLimit] = useState("10");
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const skip = (page - 1) * parseInt(limit);

      const { data, error } = await getCategories(
        {
          search,
          page: page.toString(),
          limit,
          skip: skip.toString(),
        },
        { cache: "no-store" }
      );

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      if (data) {
        setCategories(data.data || []);
        setPagination(data.pagination);
        setTotalPages(data.pagination?.totalPage || 1);

        if (data.data?.length === 0 && search) {
          toast.info("No categories found matching your search");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch categories";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        fetchCategories();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, limit]);

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setDeleteLoading(true);
    try {
      const { data, error } = await deleteCategory(categoryToDelete.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Category deleted successfully", {
        description: `${categoryToDelete.name} has been removed from the system`,
      });

      setIsDeleteAlertOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete category";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const stats = useMemo(() => {
    const totalMedicines = categories.reduce((sum, cat) => sum + cat._count.medicines, 0);
    const maxMedicines = Math.max(...categories.map(c => c._count.medicines), 0);
    const avgMedicines = categories.length > 0
      ? Math.round(totalMedicines / categories.length)
      : 0;

    return {
      totalCategories: categories.length,
      totalMedicines,
      maxMedicines,
      avgMedicines,
      recentCategories: categories
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3).length,
    };
  }, [categories]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMedicinesBadgeColor = (count: number) => {
    if (count === 0) return "bg-gray-100 text-gray-800 border-gray-300";
    if (count < 5) return "bg-blue-100 text-blue-800 border-blue-300";
    if (count < 10) return "bg-green-100 text-green-800 border-green-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const skeletonRows = Array.from({ length: parseInt(limit) }, (_, i) => i);

  return (
    <div className="h-full flex flex-col">
      {/* Header Section - Fixed at top */}
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Medicine Categories
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and organize your medicine inventory by categories
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchCategories}
                    disabled={loading}
                    className="border-gray-300"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Create New Category</DialogTitle>
                  <DialogDescription>
                    Add a new category to organize your medicines
                  </DialogDescription>
                </DialogHeader>
                <CategoryForm
                  onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    fetchCategories();
                    toast.success("Category created successfully");
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{pagination?.total}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Active categories in your inventory
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMedicines}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Medicines</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgMedicines}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Per category
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentCategories}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Added in last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Data Table Section - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="border-gray-200 shadow-sm flex-1 flex flex-col min-h-0">
          <div className="flex flex-col md:flex-row items-center justify-between px-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full md:w-auto md:min-w-[320px]"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger className="w-[100px] border-gray-300">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 rows</SelectItem>
                    <SelectItem value="20">20 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="min-w-full">
                <Table className="relative">
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead className="text-gray-700 font-semibold sticky left-0 bg-gray-50 z-20">
                        Category Name
                      </TableHead>
                      <TableHead className="text-gray-700 font-semibold">Description</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Medicines</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Created</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Last Updated</TableHead>
                      <TableHead className="text-gray-700 font-semibold  sticky right-0 bg-gray-50 z-20">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      skeletonRows.map((index) => (
                        <TableRow key={index}>
                          <TableCell className="sticky left-0 bg-white">
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="sticky right-0 bg-white">
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        </TableCell>
                      </TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Package className="h-12 w-12 text-gray-300" />
                            <p className="text-gray-600 font-medium">No categories found</p>
                            <p className="text-gray-500 text-sm">
                              {search ? "Try a different search term" : "Get started by creating a category"}
                            </p>
                            <Button
                              variant="outline"
                              className="mt-2"
                              onClick={() => setIsCreateDialogOpen(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create Category
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow
                          key={category.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium sticky left-0 bg-white">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <Package className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{category.name}</p>
                                <p className="text-xs text-gray-500">ID: {category.id.substring(0, 8)}...</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="max-w-[300px] truncate text-gray-700">
                                    {category.description || "No description provided"}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{category.description || "No description"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getMedicinesBadgeColor(category._count.medicines)}
                            >
                              {category._count.medicines} {category._count.medicines === 1 ? 'medicine' : 'medicines'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {formatDate(category.createdAt)}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {formatDate(category.updatedAt)}
                          </TableCell>
                          <TableCell className="sticky right-0 bg-white">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleEdit(category)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Category
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Medicines
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(category)}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Category
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>

          {/* Pagination - Fixed at bottom of table */}
          {totalPages > 1 && !loading && !error && (
            <CardFooter className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 border-t p-4 bg-white">
              <div className="text-sm text-gray-600">
                Showing page {page} of {totalPages} •{" "}
                {pagination?.total || 0} total items
              </div>

              <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={loading}
              />
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Category</DialogTitle>
            <DialogDescription>
              Update category information
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <EditCategoryForm
              category={selectedCategory}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                fetchCategories();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <ConfirmAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        title="Delete Category"
        description="This action cannot be undone. Are you sure you want to delete this category?"
        actionLabel="Delete Category"
        cancelLabel="Cancel"
        isLoading={deleteLoading}
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
        onConfirm={handleDeleteConfirm}
      >
        {categoryToDelete && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Category Name:</span>
                <span className="font-semibold text-gray-900">{categoryToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Medicines:</span>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {categoryToDelete._count.medicines} medicines
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Created:</span>
                <span className="text-sm text-gray-600">
                  {new Date(categoryToDelete.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {categoryToDelete._count.medicines > 0 && (
              <InfoAlert
                variant="warning"
                message="Warning"
                description={`This category contains ${categoryToDelete._count.medicines} medicine${categoryToDelete._count.medicines !== 1 ? "s" : ""
                  }. All associated medicines will also be removed.`}
              />
            )}
          </div>
        )}
      </ConfirmAlert>
    </div>
  );
}