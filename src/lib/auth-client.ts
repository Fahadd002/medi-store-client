import { createAuthClient } from "better-auth/react"
import { env } from "@/env"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_AUTH_URL, // http://localhost:5000
  fetchOptions: {
    credentials: "include",
  },
})
