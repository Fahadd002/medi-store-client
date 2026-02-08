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

export interface OrderItem {
  id: string;
  medicineId: string;
  quantity: number;
  price: number;
  medicine?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
  };
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
    phone?: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateOrderPayload {
  sellerId: string;
  shippingAddress: string;
  items: {
    medicineId: string;
    quantity: number;
    price: number;
  }[];
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