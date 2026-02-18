"use server";

import { userService } from "@/services/user.service";
import { UserRole, UserStatus } from "@/types/user.types";
import { revalidatePath } from "next/cache";

export async function getAllUsers(params?: {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    page?: string;
    limit?: string;
}) {
    return await userService.getAllUsers(params);
}

export async function getUserStats() {
    return await userService.getUserStats();
}

export async function updateUserStatus(userId: string, status: UserStatus) {
    const result = await userService.updateUserStatus(userId, status);
    revalidatePath("/admin/users");
    return result;
}

export async function updateUserRole(userId: string, role: UserRole) {
    const result = await userService.updateUserRole(userId, role);
    revalidatePath("/admin/users");
    return result;
}

export async function deleteUser(userId: string) {
    const result = await userService.deleteUser(userId);
    revalidatePath("/admin/users");
    return result;
}

export async function searchAllUsers(query: string) {
    const result = await userService.searchAllUsers(query);
    return {
        data: result.success ? result.data : [],
        error: result.success ? null : { message: result.message }
    };
}

export async function searchSellers(query: string) {
    const result = await userService.searchSellers(query);
    return {
        data: result.success ? result.data : [],
        error: result.success ? null : { message: result.message }
    };
}

export async function getUserById(userId: string) {
    return await userService.getUserById(userId);
}

export async function updateUser(userId: string, data: { name?: string; phone?: string; address?: string; image?: string }) {
    const result = await userService.updateUser(userId, data);
    revalidatePath("/profile");
    return result;
}

export async function getCurrentUser() {
    return await userService.getSession();
}

export async function updateUserProfile(userId: string, data: {
    name?: string;
    phone?: string;
    image?: string;
    currentPassword?: string;
    newPassword?: string;
}) {
    const result = await userService.updateUserWithPassword(userId, data);
    revalidatePath("/profile");
    return result;
}