import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, Activity, ArrowRight } from "lucide-react";

const tips = [
  {
    icon: Heart,
    title: "Heart Health",
    description: "5 simple ways to keep your heart healthy",
    category: "Wellness",
    color: "bg-rose-50 text-rose-600",
    readTime: "3 min read",
  },
  {
    icon: Brain,
    title: "Mental Wellness",
    description: "Daily habits for better mental health",
    category: "Mental Health",
    color: "bg-purple-50 text-purple-600",
    readTime: "4 min read",
  },
  {
    icon: Activity,
    title: "Immune Boost",
    description: "Natural ways to strengthen immunity",
    category: "Health Tips",
    color: "bg-emerald-50 text-emerald-600",
    readTime: "2 min read",
  },
];

export const HealthTips = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Health Tips & Advice
          </h2>
          <p className="text-gray-500 mt-1">
            Stay informed with latest health insights
          </p>
        </div>
        <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
          View All Articles
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-emerald-200 overflow-hidden">
              <div className="p-6">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl ${tip.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Category & Read Time */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0">
                    {tip.category}
                  </Badge>
                  <span className="text-xs text-gray-400">{tip.readTime}</span>
                </div>

                {/* Title & Description */}
                <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-emerald-600 transition-colors">
                  {tip.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {tip.description}
                </p>

                {/* Read More Link */}
                <Button variant="link" className="text-emerald-600 hover:text-emerald-700 p-0 h-auto">
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* Decorative Element */}
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Card>
          );
        })}
      </div>
    </section>
  );
};