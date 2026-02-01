import { Roles } from '@/constants/role'

export function getAuthenticatedPath(role: string): string {
  switch (role) {
    case Roles.admin:
      return '/admin-dashboard'
    case Roles.seller:
      return '/seller-dashboard'
    case Roles.customer:
      return '/dashboard'
    default:
      return '/login'
  }
}

export function getDashboardTitle(role: string): string {
  switch (role) {
    case Roles.admin:
      return 'Admin Dashboard'
    case Roles.seller:
      return 'Seller Dashboard'
    case Roles.customer:
      return 'My Account'
    default:
      return 'Dashboard'
  }
}

export function isValidRole(role: string): boolean {
  return Object.values(Roles).includes(role)
}
