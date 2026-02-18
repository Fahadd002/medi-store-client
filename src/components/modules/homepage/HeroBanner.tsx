import { Button } from "@/components/ui/button";
import { Pill, ArrowRight, Shield, Truck, Clock } from "lucide-react";
import Link from "next/link";

export const HeroBanner = () => {
  return (
    <div className="relative bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Trusted by 10,000+ Customers</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Your Health, 
              <span className="text-emerald-200"> Our Priority</span>
            </h1>
            
            <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-lg">
              Quality medicines delivered to your doorstep. Safe, authentic, and affordable healthcare solutions.
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/30 rounded-lg">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-sm">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/30 rounded-lg">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-sm">100% Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/30 rounded-lg">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-sm">Fast Delivery</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold px-8 h-12 text-base">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden md:block relative">
            <div className="relative w-full h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-3xl rotate-3 opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                      <Pill className="h-8 w-8 text-emerald-200" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                      <Shield className="h-8 w-8 text-emerald-200" />
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                      <Truck className="h-8 w-8 text-emerald-200" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                      <Clock className="h-8 w-8 text-emerald-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};