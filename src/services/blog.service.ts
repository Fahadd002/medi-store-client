import { env } from "@/env";
import { cookies } from "next/headers";

const API_URL = env.API_URL;

interface ServiceOptions {
  cache?: RequestCache;
  revalidate?: number;
}

interface GetBlogsParams {
  isFeatured?: boolean;
  search?: string;
  page?: string;
  limit?: string;
}

export interface BlogData {
  title: string;
  content: string;
  tag?: string[];
}

export const blogService = {
  getBlogPosts: async function (
    params?: GetBlogsParams,
    options?: ServiceOptions,
  ) {
    try {
      const url = new URL(`${API_URL}/posts`);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, value);
          }
        });
      }

      const config: RequestInit = {};

      if (options?.cache) {
        config.cache = options.cache;
      }

      if (options?.revalidate) {
        config.next = { revalidate: options.revalidate };
      }

      config.next = { ...config.next, tags: ["blogPosts"] };

      const res = await fetch(url.toString(), config);

      const data = await res.json();

      return { data: data, error: null };
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  getBlogById: async function (id: string) {
    try {
      const res = await fetch(`${API_URL}/posts/${id}`);

      const data = await res.json();

      return { data: data, error: null };
    } catch (err) {
      console.error(`Error fetching blog post ${id}:`, err);
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  createBlogPost: async function (blogData: BlogData) {
    try {
      const cookieStore = await cookies();

      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify(blogData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return {
          data: null,
          error: { 
            message: data.error || "Error: Post not created." 
          },
        };
      }

      return { data: data, error: null };
    } catch (err) {
      console.error("Error creating blog post:", err);
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  updateBlogPost: async function (id: string, blogData: Partial<BlogData>) {
    try {
      const cookieStore = await cookies();

      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify(blogData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return {
          data: null,
          error: { 
            message: data.error || "Error: Post not updated." 
          },
        };
      }

      return { data: data, error: null };
    } catch (err) {
      console.error(`Error updating blog post ${id}:`, err);
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  deleteBlogPost: async function (id: string) {
    try {
      const cookieStore = await cookies();

      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Cookie: cookieStore.toString(),
        },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return {
          data: null,
          error: { 
            message: data.error || "Error: Post not deleted." 
          },
        };
      }

      return { data: data, error: null };
    } catch (err) {
      console.error(`Error deleting blog post ${id}:`, err);
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },
};