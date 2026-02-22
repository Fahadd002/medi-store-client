"use server";

import { orderService } from "@/services/order.service";
import type {
  CreateOrderPayload,
  GetOrdersParams,
  OrderStatus,
} from "@/types/order.types";
import { updateTag } from "next/cache";


export const getAllOrders = async (
  params?: {
    search?: string;
    sellerId?: string;
    status?: OrderStatus;
    page?: string;
    limit?: string;
    skip?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
  options?: {
    cache?: RequestCache;
    revalidate?: number;
  }
) => {
  return await orderService.getAllOrders(params, options);
};

export const getMyOrders = async (
  params?: GetOrdersParams,
  options?: {
    cache?: RequestCache;
    revalidate?: number;
  }
) => {
  return await orderService.getMyOrders(params, options);
};

export const getSellerOrders = async (
  params?: GetOrdersParams,
  options?: {
    cache?: RequestCache;
    revalidate?: number;
  }
) => {
  return await orderService.getSellerOrders(params, options);
};

export const getOrderById = async (id: string) => {
  return await orderService.getOrderById(id);
};

export const createOrder = async (data: CreateOrderPayload) => {
  const res = await orderService.createOrder(data);
  updateTag("orders");
  updateTag("my-orders");
  updateTag("seller-orders");
  
  return res;
};

export const cancelOrder = async (orderId: string) => {
  const res = await orderService.cancelOrder(orderId);
  updateTag("orders");
  updateTag("my-orders");
  updateTag("seller-orders");
  
  return res;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const res = await orderService.updateOrderStatus(orderId, status);
  updateTag("orders");
  updateTag("my-orders");
  updateTag("seller-orders");
  
  return res;
};

export const getOrderStats = async (timeRange?: string) => {
  return await orderService.getOrderStats(timeRange);
};

// Optional: If you need server-side validation before creating orders
export const validateAndCreateOrder = async (data: CreateOrderPayload) => {
  if (!data.sellerId || !data.shippingAddress || !data.items.length) {
    return {
      data: null,
      error: { message: "Missing required fields" }
    };
  }

  for (const item of data.items) {
    if (item.quantity <= 0) {
      return {
        data: null,
        error: { message: "Quantity must be greater than 0" }
      };
    }
    if (item.price <= 0) {
      return {
        data: null,
        error: { message: "Price must be greater than 0" }
      };
    }
  }

  return await createOrder(data);
};