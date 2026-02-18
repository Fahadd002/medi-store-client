// components/home/Newsletter.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send, Bell, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Successfully subscribed to newsletter!");
    setEmail("");
    setLoading(false);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 md:p-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex p-3 bg-emerald-500/30 rounded-2xl backdrop-blur-sm mb-6">
          <Bell className="h-8 w-8 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Stay Healthy with MediStore
        </h2>
        
        <p className="text-emerald-100 mb-8 text-lg">
          Subscribe to our newsletter and get health tips, exclusive offers, and medicine updates
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-emerald-100">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Weekly health tips</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-100">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Special discounts</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-100">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">New medicine alerts</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-300" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-12 bg-white/10 border-emerald-400 text-white placeholder:text-emerald-200 focus:ring-emerald-300 focus:border-emerald-300"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="h-12 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-6"
          >
            {loading ? (
              "Subscribing..."
            ) : (
              <>
                Subscribe
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Privacy Note */}
        <p className="text-xs text-emerald-200 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};