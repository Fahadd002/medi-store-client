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

interface Item {
  value: string;
  label: string;
}

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
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data, error } = await categoryClientService.getCategoryDropdown();
        if (error) throw new Error(error.message || "Failed to load categories");
        const list = (data?.data ?? data ?? []).map((c: any) => ({
          value: String(c.value ?? c.id ?? ""),
          label: String(c.label ?? c.name ?? ""),
        })).filter((i: Item) => i.value !== "");
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
    <Select
      value={value ?? ""}
      onValueChange={(v) => onValueChange?.(String(v))}
      disabled={disabled || loading}
      className={className}
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
  );
}
