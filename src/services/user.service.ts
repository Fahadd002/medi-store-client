// services/user.service.ts
import { env } from "@/env";
import { UserRole, UserStatus } from "@/types/user.types";
import { cookies } from "next/headers";

const AUTH_URL = env.AUTH_URL;
const API_URL = env.API_URL;

export const userService = {
     getSession: async function () {
        try {
            const cookieStore = await cookies();
            const res = await fetch(`${AUTH_URL}/get-session`, {
                headers: {
                    Cookie: cookieStore.toString(),
                },
                cache: "no-store"
            });

            const session = await res.json();
            if(session == null){
                return {data: null, error:{message: "Something Went Wrong"}}
            }
            return {data: session, error:null}
        }
        catch (err) {
            console.error(err)
            return {data: null, error: {message: "Something went Wrong"}}
        }
    },


    // Get all users with filters
    getAllUsers: async function (params?: {
        search?: string;
        role?: UserRole;
        status?: UserStatus;
        page?: string;
        limit?: string;
    }) {
        try {
            const cookieStore = await cookies();
            const url = new URL(`${API_URL}/users`);
            
            if (params?.search) url.searchParams.append('search', params.search);
            if (params?.role) url.searchParams.append('role', params.role);
            if (params?.status) url.searchParams.append('status', params.status);
            if (params?.page) url.searchParams.append('page', params.page);
            if (params?.limit) url.searchParams.append('limit', params.limit);
            
            const res = await fetch(url.toString(), {
                headers: { Cookie: cookieStore.toString() },
                cache: "no-store"
            });
            
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            return data;
        } catch {
            return { 
                success: false, 
                message: "Failed to fetch users",
                data: [], 
                meta: { total: 0, page: 1, limit: 10, totalPage: 1 } 
            };
        }
    },
    
    // Get user statistics
    getUserStats: async function () {
        try {
            const cookieStore = await cookies();
            const res = await fetch(`${API_URL}/users/stats`, {
                headers: { Cookie: cookieStore.toString() },
                cache: "no-store"
            });
            
            if (!res.ok) throw new Error("Failed to fetch stats");
            const data = await res.json();
            return data;
        } catch {
            return { 
                success: false, 
                message: "Failed to fetch statistics",
                data: {
                    total: 0, customers: 0, sellers: 0, admins: 0,
                    active: 0, suspended: 0, banned: 0, inactive: 0
                }
            };
        }
    },
    
    // Update user status
    updateUserStatus: async function (userId: string, status: UserStatus) {
        try {
            const cookieStore = await cookies();
            const res = await fetch(`${API_URL}/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: cookieStore.toString(),
                },
                body: JSON.stringify({ status }),
                cache: "no-store"
            });
            
            const data = await res.json();
            return data;
        } catch {
            return { 
                success: false, 
                message: "Failed to update user status" 
            };
        }
    },
    
    // Update user role
    updateUserRole: async function (userId: string, role: UserRole) {
        try {
            const cookieStore = await cookies();
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: cookieStore.toString(),
                },
                body: JSON.stringify({ role }),
                cache: "no-store"
            });
            
            const data = await res.json();
            return data;
        } catch {
            return { 
                success: false, 
                message: "Failed to update user role" 
            };
        }
    },
    
    // Delete user
    deleteUser: async function (userId: string) {
        try {
            const cookieStore = await cookies();
            const res = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { Cookie: cookieStore.toString() },
                cache: "no-store"
            });
            
            const data = await res.json();
            return data;
        } catch {
            return { 
                success: false, 
                message: "Failed to delete user" 
            };
        }
    },
    
    // Search all users for dropdown
    searchAllUsers: async function (query?: string) {
        try {
            const cookieStore = await cookies();
            const url = new URL(`${API_URL}/users/dropdown`);
            if (query) url.searchParams.append('search', query);
            
            const res = await fetch(url.toString(), {
                headers: { Cookie: cookieStore.toString() },
                cache: "no-store"
            });
            
            if (!res.ok) throw new Error("Failed to search users");
            const data = await res.json();
            return data;
        } catch {
            return { 
                success: false, 
                message: "Failed to search users",
                data: [] 
            };
        }
    },
    
    // Search sellers only for dropdown
    searchSellers: async function (query?: string) {
        try {
            const cookieStore = await cookies();
            const url = new URL(`${API_URL}/users/seller-dropdown`);
            if (query) url.searchParams.append('search', query);
            
            const res = await fetch(url.toString(), {
                headers: { Cookie: cookieStore.toString() },
                cache: "no-store"
            });
            
            if (!res.ok) throw new Error("Failed to search sellers");
            const data = await res.json();
            return data;
        } catch {
            return { 
                success: false, 
                message: "Failed to search sellers",
                data: [] 
            };
        }
    },
    
    // Get single user by ID
    getUserById: async function (userId: string) {
        try {
            const cookieStore = await cookies();
            const res = await fetch(`${API_URL}/users/${userId}`, {
                headers: { Cookie: cookieStore.toString() },
                cache: "no-store"
            });
            
            const data = await res.json();
            return data;
        } catch {
            return { 
                success: false, 
                message: "Failed to fetch user" 
            };
        }
    },
    
    // Update user profile
    updateUser: async function (userId: string, data: { name?: string; phone?: string; address?: string; image?: string }) {
        try {
            const cookieStore = await cookies();
            const res = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: cookieStore.toString(),
                },
                body: JSON.stringify(data),
                cache: "no-store"
            });
            
            const result = await res.json();
            return result;
        } catch {
            return { 
                success: false, 
                message: "Failed to update user" 
            };
        }
    }
};