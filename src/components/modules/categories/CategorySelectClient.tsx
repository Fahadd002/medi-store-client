"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { categoryClientService } from "@/services/client-rendering/category.client";

interface CategoryItem {
  value: string;
  label: string;
}

// Define the expected response type from the API
interface CategoryDropdownResponse {
  data?: Array<{
    id: string;
    name: string;
    value?: string;
    label?: string;
  }>;
}

type ApiResponse = CategoryDropdownResponse | Array<{ id: string; name: string; value?: string; label?: string; }>;

interface Props {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function CategorySelectClient({
  value,
  onValueChange,
  placeholder = "Select category",
  disabled = false,
  className,
}: Props) {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data, error } = await categoryClientService.getCategoryDropdown();
        if (error) throw new Error(error.message || "Failed to load categories");
        
        // Handle both response formats
        let categoryList: Array<{ id: string; name: string; value?: string; label?: string; }> = [];
        
        if (Array.isArray(data)) {
          // If data is directly an array
          categoryList = data;
        } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {

          categoryList = data.data;
        } else {
          categoryList = [];
        }
        
        const list = categoryList
          .map((c) => ({
            value: String(c.value ?? c.id ?? ""),
            label: String(c.label ?? c.name ?? ""),
          }))
          .filter((i: CategoryItem) => i.value !== "");
          
        if (mounted) setItems(list);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg || "Failed to load categories");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className={className}>
      <Select
        value={value ?? ""}
        onValueChange={(v) => onValueChange?.(String(v))}
        disabled={disabled || loading}
      >
        <SelectTrigger className="border-green-300 focus:ring-green-500 focus:border-green-500 h-9 text-sm w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}