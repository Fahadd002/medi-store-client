export type UserRole = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  address?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  customers: number;
  sellers: number;
  admins: number;
  active: number;
  suspended: number;
  banned: number;
  inactive: number;
}

export interface SellerDropdownItem {
  value: string;
  label: string;
  email?: string;
  phone?: string;
  image?: string;
}