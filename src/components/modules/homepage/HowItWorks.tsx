// components/home/HowItWorks.tsx
import { Search, ShoppingCart, MapPin, Package, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Medicine",
    description: "Find your required medicine by name or category",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    description: "Select quantity and add items to your cart",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: MapPin,
    title: "Enter Address",
    description: "Provide your delivery address",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Package,
    title: "Get Delivery",
    description: "Pay cash on delivery and receive order",
    color: "from-amber-500 to-amber-600",
  },
];

export const HowItWorks = () => {
  return (
    <section className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-8 md:p-12">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          How It Works
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Get your medicines in four simple steps. Fast, secure, and hassle-free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          
          return (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-emerald-200 to-transparent" />
              )}
              
              {/* Step Circle */}
              <div className="relative mb-6">
                <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg relative z-10`}>
                  <Icon className="h-8 w-8" />
                </div>
                
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-emerald-100">
                  <span className="text-sm font-bold text-emerald-600">{index + 1}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>

              {/* Check Mark for Last Step */}
              {index === steps.length - 1 && (
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    <span>Complete</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2">
          Get Started Now
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
};