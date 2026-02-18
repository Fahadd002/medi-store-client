import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!, // backend domain
  fetchOptions: {
    credentials: "include", // ensures cookies from backend are sent
  },
});
