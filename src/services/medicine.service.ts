import { env } from "@/env";
import { cookies } from "next/headers";

const API_URL = env.API_URL;

export interface MedicineData {
  name: string;
  description: string;
  basePrice: number;
  discountPercent?: number;
  manufacturer: string;
  expiryDate?: string;
  isActive?: boolean;
  categoryId: string;
}

export interface GetMedicinesParams {
  search?: string;
  categoryId?: string;
  sellerId?: string;
  page?: string;
  limit?: string;
  skip?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ServiceOptions {
  cache?: RequestCache;
  revalidate?: number;
}

export const medicineService = {
  getMedicines: async (
    params?: GetMedicinesParams,
    options?: ServiceOptions
  ) => {
    try {
      const url = new URL(`${API_URL}/medicines`);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const config: RequestInit = {};
      if (options?.cache) config.cache = options.cache;
      if (options?.revalidate) config.next = { revalidate: options.revalidate };
      config.next = { ...config.next, tags: ["medicines"] };

      const res = await fetch(url.toString(), config);
      const data = await res.json();

      return { data, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },
  
  getMyMedicines: async (
    params?: GetMedicinesParams,
    options?: ServiceOptions
  ) => {
    try {
      const url = new URL(`${API_URL}/medicines/myMedicines`);
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const config: RequestInit = {
        headers: {
          Cookie: cookieHeader,
        }
      };
      
      if (options?.cache) config.cache = options.cache;
      if (options?.revalidate) config.next = { revalidate: options.revalidate };
      config.next = { ...config.next, tags: ["medicines"] };

      const res = await fetch(url.toString(), config);
      const data = await res.json();

      return { data, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  getMedicineById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/medicines/${id}`);
      const data = await res.json();
      return { data, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  createMedicine: async (data: MedicineData) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/medicines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: result.error || "Error: Medicine not created." } };
      }

      return { data: result, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  updateMedicine: async (id: string, data: Partial<MedicineData>) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/medicines/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: result.error || "Error: Medicine not updated." } };
      }

      return { data: result, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  deleteMedicine: async (id: string) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/medicines/${id}`, {
        method: "DELETE",
        headers: {
          Cookie: cookieHeader,
        },
      });

      const result = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: result.error || "Error: Medicine not deleted." } };
      }

      return { data: result, error: null };
    } catch {
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },
};