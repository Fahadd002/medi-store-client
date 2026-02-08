"use server";

import { userService } from "@/services/user.service";
import { UserRole, UserStatus } from "@/types/user.types";

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
    return await userService.updateUserStatus(userId, status);
}

export async function updateUserRole(userId: string, role: UserRole) {
    return await userService.updateUserRole(userId, role);
}

export async function deleteUser(userId: string) {
    return await userService.deleteUser(userId);
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
    return await userService.updateUser(userId, data);
}

export async function getCurrentUser() {
    return await userService.getSession();
}