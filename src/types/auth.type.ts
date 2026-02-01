import { Roles } from "@/constants/role";

export type Role = (typeof Roles)[keyof typeof Roles]

export interface AuthUser {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image?: string | null

  role: Role
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "INACTIVE"
  phone?: string | null
  address?: string | null
}

export interface AuthSession {
  data: {
    session: {
      token: string
      userId: string
    }
    user: AuthUser
  } | null
  error: Error | null
}
