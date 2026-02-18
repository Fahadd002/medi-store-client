// services/home.service.ts
import { env } from "@/env";
import { cookies } from "next/headers";

const API_URL = env.API_URL;

// Types matching your backend response
export interface HomeCategory {
  id: string;
  name: string;
  medicineCount: number;
}

export interface HomeMedicine {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  discountPercent?: number;
  stock: number;
  manufacturer: string;
  expiryDate?: string;
  photoUrl?: string;
  unit?: string;
  category: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
  averageRating: number;
  reviewCount: number;
  _count: {
    reviews: number;
  };
}

export interface HomeSeller {
  id: string;
  name: string;
  image: string | null;
  medicineCount: number;
}

export interface HomeStats {
  totalMedicines: number;
  totalSellers: number;
  totalCategories: number;
}

export interface HomepageData {
  categories: HomeCategory[];
  featuredMedicines: HomeMedicine[];
  topSellers: HomeSeller[];
  stats: HomeStats;
}

export interface ServiceOptions {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

export const homeService = {
  getHomepageData: async (options?: ServiceOptions) => {
    try {
      const url = new URL(`${API_URL}/home`);
      
      const config: RequestInit = {
        next: {
          revalidate: options?.revalidate || 3600, // Default: 1 hour
          tags: options?.tags || ["homepage"],
        },
      };
      
      if (options?.cache) {
        config.cache = options.cache;
      }

      const res = await fetch(url.toString(), config);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const response = await res.json();
      return { 
        data: response.data as HomepageData, 
        error: null 
      };
      
    } catch (error) {
      console.error("Error fetching homepage data:", error);
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to load homepage data" 
        } 
      };
    }
  },

  /**
   * Get homepage data with authentication (if needed)
   * Includes cookies for authenticated requests
   */
  getHomepageDataAuth: async (options?: ServiceOptions) => {
    try {
      const url = new URL(`${API_URL}/home`);
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const config: RequestInit = {
        headers: {
          Cookie: cookieHeader,
        },
        next: {
          revalidate: options?.revalidate || 60,
          tags: options?.tags || ["homepage-auth"],
        },
      };
      
      if (options?.cache) {
        config.cache = options.cache;
      }

      const res = await fetch(url.toString(), config);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const response = await res.json();
      
      return { 
        data: response.data as HomepageData, 
        error: null 
      };
      
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to load homepage data" 
        } 
      };
    }
  },
};