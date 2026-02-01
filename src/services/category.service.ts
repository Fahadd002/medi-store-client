// src/services/category.service.ts
import { env } from "@/env";
import { cookies } from "next/headers";

const API_URL = env.API_URL || "http://localhost:3000/api";

export interface CategoryData {
  name: string;
  description?: string;
}

export interface GetCategoriesParams {
  search?: string;
  page?: string;
  limit?: string;
  skip?: string;
}

export interface ServiceOptions {
  cache?: RequestCache;
  revalidate?: number;
}

export const categoryService = {
  getCategories: async (
    params?: GetCategoriesParams,
    options?: ServiceOptions
  ) => {
    try {
      const url = new URL(`${API_URL}/categories`);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, value);
          }
        });
      }

      const config: RequestInit = {};

      if (options?.cache) {
        config.cache = options.cache;
      }

      if (options?.revalidate) {
        config.next = { revalidate: options.revalidate };
      }

      config.next = { ...config.next, tags: ["categories"] };

      const res = await fetch(url.toString(), config);
      const data = await res.json();

      return { data, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  createCategory: async (data: CategoryData) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return { data: null, error: { message: result.error || "Error: Category not created." } };
      }

      return { data: result, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  updateCategory: async (id: string, data: CategoryData) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return { data: null, error: { message: result.error || "Error: Category not updated." } };
      }

      return { data: result, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Cookie: cookieHeader,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        return { data: null, error: { message: result.error || "Error: Category not deleted." } };
      }

      return { data: result, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  // Optional: Get single category by ID
  getCategoryById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/categories/${id}`);
      const data = await res.json();

      return { data, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },
};