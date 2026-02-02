"use server";

import { CategoryData, categoryService } from "@/services/category.service";
import { updateTag } from "next/cache"; 

export const getCategories = async (
  params?: {
    search?: string;
    page?: string;
    limit?: string;
    skip?: string;
  },
  options?: {
    cache?: RequestCache;
    revalidate?: number;
  }
) => {
  return await categoryService.getCategories(params, options);
};

export const createCategory = async (data: CategoryData) => {
  const res = await categoryService.createCategory(data);
  updateTag("categories"); 
  return res;
};

export const updateCategory = async (id: string, data: CategoryData) => {
  const res = await categoryService.updateCategory(id, data);
  updateTag("categories");
  return res;
};

export const deleteCategory = async (id: string) => {
  const res = await categoryService.deleteCategory(id);
  updateTag("categories");
  return res;
};