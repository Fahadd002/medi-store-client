"use server";

import { MedicineData, medicineService } from "@/services/medicine.service";
import { updateTag } from "next/cache";

export const getMedicines = async (
  params?: {
    search?: string;
    categoryId?: string;
    sellerId?: string;
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
  return await medicineService.getMedicines(params, options);
};

export const getMedicineById = async (id: string) => {
  return await medicineService.getMedicineById(id);
};

export const createMedicine = async (data: MedicineData) => {
  const res = await medicineService.createMedicine(data);
  updateTag("medicines");
  return res;
};

export const updateMedicine = async (id: string, data: Partial<MedicineData>) => {
  const res = await medicineService.updateMedicine(id, data);
  updateTag("medicines");
  return res;
};

export const deleteMedicine = async (id: string) => {
  const res = await medicineService.deleteMedicine(id);
  updateTag("medicines");
  return res;
};
