"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";

export function CartButton() {
  const { cart: cartItems } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full"
      asChild
    >
      <Link href="/checkout">
        <ShoppingCart className="h-5 w-5" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
            {cartItems.length}
          </span>
        )}
      </Link>
    </Button>
  );
}