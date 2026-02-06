// services/order.service.ts
import { env } from "@/env";
import { cookies } from "next/headers";

const API_URL = env.API_URL;

// Order Types
export interface OrderItem {
  medicineId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderPayload {
  sellerId: string;
  shippingAddress: string;
  items: OrderItem[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export enum OrderStatus {
  PLACED = "PLACED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  sellerId: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface GetOrdersParams {
  page?: string;
  limit?: string;
  skip?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: OrderStatus;
}

export interface ServiceOptions {
  cache?: RequestCache;
  revalidate?: number;
}

export const orderService = {
  getOrders: async (
    params?: GetOrdersParams,
    options?: ServiceOptions
  ) => {
    try {
      const url = new URL(`${API_URL}/orders`);

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
      config.next = { ...config.next, tags: ["orders"] };

      const res = await fetch(url.toString(), config);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.statusText}`);
      }
      
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to fetch orders" 
        } 
      };
    }
  },

  // Get user's own orders
  getMyOrders: async (
    params?: GetOrdersParams,
    options?: ServiceOptions
  ) => {
    try {
      const url = new URL(`${API_URL}/orders/my-orders`);
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
      config.next = { ...config.next, tags: ["my-orders"] };

      const res = await fetch(url.toString(), config);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch user orders: ${res.statusText}`);
      }
      
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to fetch user orders" 
        } 
      };
    }
  },

  // Get seller's orders
  getSellerOrders: async (
    params?: GetOrdersParams,
    options?: ServiceOptions
  ) => {
    try {
      const url = new URL(`${API_URL}/orders/seller/orders`);
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
      config.next = { ...config.next, tags: ["seller-orders"] };

      const res = await fetch(url.toString(), config);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch seller orders: ${res.statusText}`);
      }
      
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to fetch seller orders" 
        } 
      };
    }
  },

  // Get single order by ID
  getOrderById: async (id: string) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/orders/${id}`, {
        headers: {
          Cookie: cookieHeader,
        },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch order: ${res.statusText}`);
      }
      
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to fetch order" 
        } 
      };
    }
  },

  // Create new order
  createOrder: async (data: CreateOrderPayload) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error?.message || "Failed to create order");
      }

      return { data: result, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to create order" 
        } 
      };
    }
  },

  // Cancel an order
  cancelOrder: async (orderId: string) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          Cookie: cookieHeader,
        },
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error?.message || "Failed to cancel order");
      }

      return { data: result, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to cancel order" 
        } 
      };
    }
  },

  // Update order status (for seller)
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const res = await fetch(`${API_URL}/orders/seller/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error?.message || "Failed to update order status");
      }

      return { data: result, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to update order status" 
        } 
      };
    }
  },

  // Get order statistics (you might want to add this endpoint on the backend)
  getOrderStats: async (timeRange?: string) => {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const url = new URL(`${API_URL}/orders/stats`);
      if (timeRange) {
        url.searchParams.append('timeRange', timeRange);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Cookie: cookieHeader,
        },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch order stats: ${res.statusText}`);
      }
      
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : "Failed to fetch order statistics" 
        } 
      };
    }
  },
};