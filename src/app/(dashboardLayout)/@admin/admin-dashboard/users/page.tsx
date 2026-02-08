// app/admin/users/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  getAllUsers, 
  getUserStats, 
  updateUserStatus, 
  updateUserRole, 
  deleteUser,
} from "@/actions/user.action";
import { User, UserStats, UserRole, UserStatus } from "@/types/user.types";
import { toast } from "sonner";
import {
  Search,
  Edit,
  Trash2,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Shield,
  User as UserIcon,
  Building2,
  Save,
  X,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";
import { Skeleton } from "@/components/layout/skeleton";
import Swal from "sweetalert2";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState("10");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [stats, setStats] = useState<UserStats>({
    total: 0, customers: 0, sellers: 0, admins: 0,
    active: 0, suspended: 0, banned: 0, inactive: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<UserStatus>("ACTIVE");
  const [editingRole, setEditingRole] = useState<UserRole>("CUSTOMER");
  const [updating, setUpdating] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers({
        search, 
        role: roleFilter || undefined, 
        status: statusFilter || undefined,
        page: page.toString(), 
        limit,
      });
      
      if (result.success && result.data) {
        setUsers(result.data);
        setTotalPages(result.meta?.totalPage || 1);
      } else {
        toast.error(result.message || "Failed to fetch users");
      }
    } catch (error) { 
      toast.error("Failed to fetch users"); 
    } finally { 
      setLoading(false); 
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const result = await getUserStats();
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        toast.error(result.message || "Failed to fetch statistics");
      }
    } catch (error) { 
      toast.error("Failed to fetch statistics"); 
    }
  };

  // Initial load
  useEffect(() => { 
    fetchUsers(); 
    fetchStats(); 
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (page === 1) {
        fetchUsers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, limit, roleFilter, statusFilter]);

  // Pagination
  useEffect(() => { 
    fetchUsers(); 
  }, [page]);

  // Update user status
  const handleUpdateStatus = async (userId: string, currentStatus: UserStatus) => {
    if (editingId !== userId) {
      setEditingId(userId);
      setEditingStatus(currentStatus);
      return;
    }
    
    setUpdating(true);
    const toastId = toast.loading("Updating status...");
    
    try {
      const result = await updateUserStatus(userId, editingStatus);
      if (result.success) {
        toast.success("Status updated!", { id: toastId });
        setEditingId(null);
        fetchUsers(); 
        fetchStats();
      } else {
        toast.error(result.message || "Failed to update", { id: toastId });
      }
    } catch (error) { 
      toast.error("Failed to update", { id: toastId }); 
    } finally { 
      setUpdating(false); 
    }
  };

  // Update user role
  const handleUpdateRole = async (userId: string, currentRole: UserRole) => {
    if (editingId !== userId) {
      setEditingId(userId);
      setEditingRole(currentRole);
      return;
    }
    
    setUpdating(true);
    const toastId = toast.loading("Updating role...");
    
    try {
      const result = await updateUserRole(userId, editingRole);
      if (result.success) {
        toast.success("Role updated!", { id: toastId });
        setEditingId(null);
        fetchUsers(); 
        fetchStats();
      } else {
        toast.error(result.message || "Failed to update", { id: toastId });
      }
    } catch (error) { 
      toast.error("Failed to update", { id: toastId }); 
    } finally { 
      setUpdating(false); 
    }
  };

  // Delete user
  const handleDelete = async (userId: string, userName: string) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: `Delete "${userName}"? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    
    if (result.isConfirmed) {
      const toastId = toast.loading("Deleting user...");
      
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          toast.success("User deleted", { id: toastId });
          fetchUsers(); 
          fetchStats();
        } else {
          toast.error(result.message || "Failed to delete", { id: toastId });
        }
      } catch (error) { 
        toast.error("Failed to delete", { id: toastId }); 
      }
    }
  };

  // Status badge
  const getStatusBadge = (status: UserStatus) => {
    const config = {
      ACTIVE: { className: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle },
      SUSPENDED: { className: "bg-amber-100 text-amber-800 border-amber-300", icon: XCircle },
      BANNED: { className: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
      INACTIVE: { className: "bg-gray-100 text-gray-800 border-gray-300", icon: XCircle },
    }[status];
    
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" /> {status}
      </Badge>
    );
  };

  // Role badge
  const getRoleBadge = (role: UserRole) => {
    const config = {
      ADMIN: { className: "bg-violet-100 text-violet-800 border-violet-300", icon: Shield },
      SELLER: { className: "bg-blue-100 text-blue-800 border-blue-300", icon: Building2 },
      CUSTOMER: { className: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: UserIcon },
    }[role];
    
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" /> {role}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Simple handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => setLimit(e.target.value);
  const handleCancelEdit = () => setEditingId(null);

  return (
    <div className="space-y-6 p-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">User Management</h1>
        <p className="text-sm text-emerald-600">Manage all users, roles, and statuses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Total Users</p>
              <p className="text-2xl font-bold text-emerald-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        {/* Active Users */}
        <Card className="p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Active</p>
              <p className="text-2xl font-bold text-emerald-900">{stats.active}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        {/* Sellers */}
        <Card className="p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Sellers</p>
              <p className="text-2xl font-bold text-blue-900">{stats.sellers}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Admins */}
        <Card className="p-4 border border-violet-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-700">Admins</p>
              <p className="text-2xl font-bold text-violet-900">{stats.admins}</p>
            </div>
            <div className="p-2 bg-violet-100 rounded-lg">
              <Shield className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="p-4 border border-emerald-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            
            <select 
              value={limit} 
              onChange={handleLimitChange}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Role Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-emerald-700">Role:</span>
              <div className="flex gap-1">
                <Button
                  variant={roleFilter === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("")}
                  className="h-7"
                >
                  All
                </Button>
                {(["CUSTOMER", "SELLER", "ADMIN"] as UserRole[]).map((role) => (
                  <Button
                    key={role}
                    variant={roleFilter === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter(roleFilter === role ? "" : role)}
                    className="h-7"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-emerald-700">Status:</span>
              <div className="flex gap-1">
                <Button
                  variant={statusFilter === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("")}
                  className="h-7"
                >
                  All
                </Button>
                {(["ACTIVE", "SUSPENDED", "BANNED", "INACTIVE"] as UserStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
                    className="h-7"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border border-emerald-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-emerald-900">User</th>
                <th className="px-4 py-3 text-left font-medium text-emerald-900">Contact</th>
                <th className="px-4 py-3 text-left font-medium text-emerald-900">Role</th>
                <th className="px-4 py-3 text-left font-medium text-emerald-900">Status</th>
                <th className="px-4 py-3 text-left font-medium text-emerald-900">Joined</th>
                <th className="px-4 py-3 text-left font-medium text-emerald-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeletons
                Array.from({ length: parseInt(limit) }).map((_, i) => (
                  <tr key={i} className="border-b border-emerald-100">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-12 w-12 text-emerald-300" />
                      <p className="font-medium text-emerald-700">No users found</p>
                      <p className="text-sm text-emerald-600">Try adjusting your search filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // User rows
                users.map((user) => (
                  <tr key={user.id} className="border-b border-emerald-100 hover:bg-emerald-50">
                    {/* User Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <UserIcon className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-emerald-900">{user.name}</p>
                          <p className="text-sm text-emerald-600">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-emerald-500" />
                          <span>{user.phone || "No phone"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-emerald-500" />
                          <span className="truncate max-w-[200px]">{user.address || "No address"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {editingId === user.id ? (
                        <div className="flex gap-1">
                          {(["CUSTOMER", "SELLER", "ADMIN"] as UserRole[]).map((role) => (
                            <Button
                              key={role}
                              size="sm"
                              variant={editingRole === role ? "default" : "outline"}
                              onClick={() => setEditingRole(role)}
                              className="h-7 text-xs"
                            >
                              {role}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        getRoleBadge(user.role)
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {editingId === user.id ? (
                        <div className="flex gap-1">
                          {(["ACTIVE", "SUSPENDED", "BANNED", "INACTIVE"] as UserStatus[]).map((status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={editingStatus === status ? "default" : "outline"}
                              onClick={() => setEditingStatus(status)}
                              className="h-7 text-xs"
                            >
                              {status}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        getStatusBadge(user.status)
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-emerald-500" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">
                        Verified: {user.emailVerified ? "Yes" : "No"}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {editingId === user.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (editingStatus !== user.status) {
                                  handleUpdateStatus(user.id, user.status);
                                } else if (editingRole !== user.role) {
                                  handleUpdateRole(user.id, user.role);
                                }
                              }}
                              disabled={updating}
                              className="h-8"
                            >
                              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="h-8"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(user.id, user.status)}
                              className="h-8"
                              title="Edit status"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateRole(user.id, user.role)}
                              className="h-8"
                              title="Edit role"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(user.id, user.name)}
                              className="h-8 text-red-600 hover:text-red-700"
                              title="Delete user"
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-emerald-200">
            <div className="text-sm text-emerald-700">
              Showing {users.length} of {stats.total} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-8 h-8"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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