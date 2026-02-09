import { env } from "@/env";
import { cookies } from "next/headers";

const API_URL = env.API_URL;

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
  medicineId: string;
  orderId: string;
}

export interface ReplyToReviewPayload {
  comment: string;
}

export interface GetReviewsParams {
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

export const reviewService = {
  createReview: async (data: CreateReviewPayload) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to create review");
      }

      return { data: result.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to create review"
        }
      };
    }
  },

  replyToReview: async (parentId: string, data: ReplyToReviewPayload) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/reviews/${parentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to reply to review");
      }

      return { data: result.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to reply to review"
        }
      };
    }
  },

  getReviewsByMedicine: async (
    medicineId: string,
    params?: GetReviewsParams,
    options?: ServiceOptions
  ) => {
    try {
      const url = new URL(`${API_URL}/reviews/medicine/${medicineId}`);

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
      config.next = { ...config.next, tags: [`reviews-${medicineId}`] };

      const res = await fetch(url.toString(), config);

      if (!res.ok) {
        throw new Error(`Failed to fetch reviews: ${res.statusText}`);
      }

      const result = await res.json();
      return { data: result.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to fetch reviews"
        }
      };
    }
  },

  // Delete a review
  deleteReview: async (reviewId: string) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Cookie: cookieHeader,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete review");
      }

      return { data: result, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to delete review"
        }
      };
    }
  },

  getMyReviews: async (
    params?: GetReviewsParams,
    options?: ServiceOptions
  ) => {
    try {
      const url = new URL(`${API_URL}/reviews/my-reviews`);
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
      config.next = { ...config.next, tags: ["my-reviews"] };

      const res = await fetch(url.toString(), config);

      if (!res.ok) {
        throw new Error(`Failed to fetch user reviews: ${res.statusText}`);
      }

      const result = await res.json();
      return { data: result.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to fetch user reviews"
        }
      };
    }
  },

  getReviewsToReply: async (
    params?: GetReviewsParams,
    options?: ServiceOptions
  ) => {
    try {
      const url = new URL(`${API_URL}/reviews/seller/pending`);
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
      config.next = { ...config.next, tags: ["seller-reviews"] };

      const res = await fetch(url.toString(), config);

      if (!res.ok) {
        throw new Error(`Failed to fetch seller reviews: ${res.statusText}`);
      }

      const result = await res.json();
      return { data: result.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to fetch seller reviews"
        }
      };
    }
  },

  getReviewStats: async (medicineId: string) => {
    try {
      const url = new URL(`${API_URL}/reviews/stats/${medicineId}`);

      const res = await fetch(url.toString());

      if (!res.ok) {
        throw new Error(`Failed to fetch review stats: ${res.statusText}`);
      }

      const result = await res.json();
      return { data: result.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to fetch review statistics"
        }
      };
    }
  },

  checkReviewEligibility: async (orderId: string, medicineId: string) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(
        `${API_URL}/reviews/eligibility/${orderId}/${medicineId}`,
        {
          headers: {
            Cookie: cookieHeader,
          },
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to check eligibility");
      }

      return { data: result.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to check review eligibility"
        }
      };
    }
  },
};