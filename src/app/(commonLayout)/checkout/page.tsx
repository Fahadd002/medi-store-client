"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { createOrder } from "@/actions/order.action";
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Shield,
  Truck,
  CheckCircle
} from "lucide-react";
import { useForm } from "@tanstack/react-form";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart: cartItems, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  console.log("Cart items at checkout:", cartItems);

  const form = useForm({
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      notes: "",
    },

    onSubmit: async ({ value }) => {
      console.log("Form submitted with values:", value);

      // Basic validation
      if (!value.fullName || value.fullName.trim().length < 2) {
        toast.error("Full name must be at least 2 characters");
        return;
      }
      if (!value.phone || value.phone.length < 11) {
        toast.error("Phone number must be 11 digits");
        return;
      }
      if (!value.address || value.address.trim().length < 5) {
        toast.error("Address must be at least 5 characters");
        return;
      }
      if (!value.city || value.city.trim().length < 2) {
        toast.error("City is required");
        return;
      }

      if (cartItems.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      const sellerId = cartItems[0].sellerId;
      if (!sellerId) {
        toast.error("Unable to process order. Seller information is missing.");
        return;
      }

      setLoading(true);

      try {
        const orderData = {
          sellerId: sellerId,
          shippingAddress: `${value.address}, ${value.city}, ${value.state} ${value.zipCode}`.trim(),
          items: cartItems.map(item => {
            const finalPrice = item.discountPercent
              ? item.basePrice * (1 - item.discountPercent / 100)
              : item.basePrice;

            return {
              medicineId: item.id,
              quantity: item.quantity,
              price: parseFloat(finalPrice.toFixed(2))
            }
          })
        };

        const result = await createOrder(orderData);

        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success("Order placed successfully!");
          clearCart();
          // Redirect to orders page or home
          router.push("/dashboard/orders");
        }
      } catch (error) {
        console.error("Order creation error:", error);
        toast.error("Failed to create order");
      } finally {
        setLoading(false);
      }
    },
  });

  const calculateDiscountedPrice = (price: number, discount?: number | null) => {
    if (!discount || discount === null || discount === 0) return price;
    return price * (1 - discount / 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const subtotal = getTotalPrice();
  const total = subtotal;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white py-4">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-emerald-700 hover:text-emerald-800 mb-1 cursor-pointer text-sm h-7 px-2"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-emerald-900">Checkout</h1>
          <p className="text-emerald-600 text-xs">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2">
            <Card className="border-emerald-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-emerald-100 rounded">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <h2 className="text-base font-semibold text-emerald-900">Shipping Information</h2>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Column 1 */}
                  <div className="space-y-2">
                    <form.Field
                      name="fullName"
                      validators={{
                        onChange: ({ value }) =>
                          !value || value.trim().length < 2
                            ? "Full name must be at least 2 characters"
                            : undefined,
                      }}
                    >
                      {(field) => {
                        const isInvalid = field.state.meta.errors?.length > 0;
                        return (
                          <Field>
                            <FieldLabel htmlFor={field.name} className="text-emerald-700 text-xs mb-1">
                              Full Name *
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="Fahad Pramanik"
                              className={`border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 h-8 text-sm ${isInvalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {isInvalid && (
                              <FieldError className="text-xs text-red-600 mt-0.5">
                                {field.state.meta.errors.join(", ")}
                              </FieldError>
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>

                    <form.Field
                      name="phone"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value) return "Phone number is required";
                          if (value.length < 11) return "Phone number must be 11 digits";
                          if (value.length > 11) return "Phone number must be 11 digits";
                          return undefined;
                        },
                      }}
                    >
                      {(field) => {
                        const isInvalid = field.state.meta.errors?.length > 0;
                        return (
                          <Field>
                            <FieldLabel htmlFor={field.name} className="text-emerald-700 text-xs mb-1">
                              Phone Number *
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="01XXXXXXXXX"
                              className={`border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 h-8 text-sm ${isInvalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {isInvalid && (
                              <FieldError className="text-xs text-red-600 mt-0.5">
                                {field.state.meta.errors.join(", ")}
                              </FieldError>
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>

                    <form.Field name="email">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name} className="text-emerald-700 text-xs mb-1">
                            Email Address
                          </FieldLabel>
                          <Input
                            id={field.name}
                            type="email"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="fahad@example.com"
                            className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 h-8 text-sm"
                          />
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-2">
                    <form.Field
                      name="address"
                      validators={{
                        onChange: ({ value }) =>
                          !value || value.trim().length < 5
                            ? "Address must be at least 5 characters"
                            : undefined,
                      }}
                    >
                      {(field) => {
                        const isInvalid = field.state.meta.errors?.length > 0;
                        return (
                          <Field>
                            <FieldLabel htmlFor={field.name} className="text-emerald-700 text-xs mb-1">
                              Street Address *
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="123 Main St"
                              className={`border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 h-8 text-sm ${isInvalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {isInvalid && (
                              <FieldError className="text-xs text-red-600 mt-0.5">
                                {field.state.meta.errors.join(", ")}
                              </FieldError>
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-2">
                      <form.Field
                        name="city"
                        validators={{
                          onChange: ({ value }) =>
                            !value || value.trim().length < 2
                              ? "City is required"
                              : undefined,
                        }}
                      >
                        {(field) => {
                          const isInvalid = field.state.meta.errors?.length > 0;
                          return (
                            <Field>
                              <FieldLabel htmlFor={field.name} className="text-emerald-700 text-xs mb-1">
                                City *
                              </FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Dhaka"
                                className={`border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 h-8 text-sm ${isInvalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                              />
                              {isInvalid && (
                                <FieldError className="text-xs text-red-600 mt-0.5">
                                  {field.state.meta.errors.join(", ")}
                                </FieldError>
                              )}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="state">
                        {(field) => (
                          <Field>
                            <FieldLabel htmlFor={field.name} className="text-emerald-700 text-xs mb-1">
                              Division
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="Dhaka"
                              className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 h-8 text-sm"
                            />
                          </Field>
                        )}
                      </form.Field>
                    </div>

                    <form.Field name="zipCode">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name} className="text-emerald-700 text-xs mb-1">
                            ZIP Code
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="1207"
                            className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 h-8 text-sm"
                          />
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  {/* Full width fields at bottom */}
                  <div className="md:col-span-2 space-y-2">
                    <form.Field name="notes">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name} className="text-emerald-700 text-xs mb-1">
                            Delivery Notes (Optional)
                          </FieldLabel>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Any special delivery instructions..."
                            className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 min-h-[40px] text-sm"
                          />
                        </Field>
                      )}
                    </form.Field>

                    <Button
                      type="submit"
                      disabled={loading || cartItems.length === 0}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-sm mt-1"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-3 w-3 mr-1 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="border-emerald-200 p-4 sticky top-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-emerald-100 rounded">
                  <ShoppingCart className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <h2 className="text-base font-semibold text-emerald-900">Order Summary</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
                {cartItems.map((item) => {
                  const itemPrice = calculateDiscountedPrice(item.basePrice, item.discountPercent);
                  const totalPrice = itemPrice * item.quantity;

                  return (
                    <div key={item.id} className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                      {item.photoUrl && (
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="h-10 w-10 object-cover rounded border border-emerald-200"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-xs text-gray-900 line-clamp-1">{item.name}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{item.quantity} × {formatPrice(itemPrice)}</span>
                          <span className="font-semibold text-emerald-900">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Totals */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="border-t border-emerald-200 pt-2">
                  <div className="flex items-center justify-between text-base font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-emerald-700">{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">No additional tax for medicines</p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded">
                  <Shield className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs text-emerald-700">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded">
                  <Truck className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs text-emerald-700">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs text-emerald-700">Quality Guaranteed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}