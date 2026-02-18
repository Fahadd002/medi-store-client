import { HomeStats } from "@/services/home.service";
import { Package, Store, Tag, TrendingUp } from "lucide-react";

interface StatsSectionProps {
  stats: HomeStats;
}

export const StatsSection = ({ stats }: StatsSectionProps) => {
  const statItems = [
    {
      icon: Package,
      label: "Medicines",
      value: stats.totalMedicines,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      iconColor: "text-blue-600",
      suffix: "+",
    },
    {
      icon: Store,
      label: "Trusted Sellers",
      value: stats.totalSellers,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      iconColor: "text-emerald-600",
      suffix: "+",
    },
    {
      icon: Tag,
      label: "Categories",
      value: stats.totalCategories,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      iconColor: "text-purple-600",
      suffix: "+",
    },
    {
      icon: TrendingUp,
      label: "Happy Customers",
      value: "10k",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      iconColor: "text-amber-600",
      suffix: "+",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}{stat.suffix}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};