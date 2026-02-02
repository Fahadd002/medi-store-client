import { env } from "@/env";

export const categoryClientService = {
  getCategoryDropdown: async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/categories/dropdown`, {
        credentials: "include", // browser sends cookies
      });

      if (!res.ok) throw new Error("Failed to fetch categories");

      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  },
};
