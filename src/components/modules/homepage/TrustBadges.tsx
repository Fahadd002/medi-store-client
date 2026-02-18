// components/home/TrustBadges.tsx
import { Truck, Shield, Package, ShoppingCart, Award, Clock } from "lucide-react";

export const TrustBadges = () => {
  const badges = [
    {
      icon: Truck,
      label: "Free Delivery",
      description: "On orders over $100",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Shield,
      label: "100% Authentic",
      description: "Genuine products",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Package,
      label: "In Stock",
      description: "Ready to ship",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: ShoppingCart,
      label: "Easy Returns",
      description: "30-day policy",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: Award,
      label: "Quality Assured",
      description: "Certified products",
      color: "bg-rose-50 text-rose-600",
    },
    {
      icon: Clock,
      label: "24/7 Support",
      description: "Round the clock",
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div className="container mx-auto px-4 -mt-8 relative z-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className={`inline-flex p-2.5 rounded-lg ${badge.color} mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-0.5">
                {badge.label}
              </h3>
              <p className="text-xs text-gray-500">
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};