import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, TrendingUp, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Ferrum AI
          </div>
          <a href={getLoginUrl()} className="text-slate-300 hover:text-white transition">
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Real-Time Scrap Metal Intelligence
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Maximize your scrap yard revenue with live market pricing, revenue leakage analysis, and competitive intelligence. Know your market. Own your margins.
            </p>
            <div className="flex gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-sm text-slate-400">Current Market Rate</div>
                  <div className="text-2xl font-bold text-white">$3.45/lb</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <div className="text-sm text-slate-400">Your Revenue Gap</div>
                  <div className="text-2xl font-bold text-red-400">$0.42/lb</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-700/50">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-amber-400" />
              </div>
              <CardTitle className="text-white">Live Market Prices</CardTitle>
              <CardDescription className="text-slate-400">
                Real-time pricing data updated daily from verified sources
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-red-400" />
              </div>
              <CardTitle className="text-white">Revenue Leakage</CardTitle>
              <CardDescription className="text-slate-400">
                Identify pricing gaps and recover lost revenue instantly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Price History</CardTitle>
              <CardDescription className="text-slate-400">
                Track trends and make data-driven pricing decisions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-700/50">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Scout",
              price: "$199",
              period: "/month",
              description: "For single-yard operators",
              features: ["Live market prices", "1 yard profile", "Basic leakage analysis", "Email support"],
            },
            {
              name: "Pro",
              price: "$499",
              period: "/month",
              description: "For growing operations",
              features: ["Everything in Scout", "Up to 5 yards", "Advanced analytics", "Priority support", "Price history"],
              highlighted: true,
            },
            {
              name: "Yard Command",
              price: "$1,499",
              period: "/month",
              description: "For large networks",
              features: ["Everything in Pro", "Unlimited yards", "Custom integrations", "Dedicated support", "API access"],
            },
          ].map((tier) => (
            <Card
              key={tier.name}
              className={`border-2 transition ${
                tier.highlighted
                  ? "border-amber-500 bg-slate-800 shadow-lg shadow-amber-500/20"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white">{tier.name}</CardTitle>
                <CardDescription className="text-slate-400">{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-slate-400">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-300">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href={getLoginUrl()}>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-700/50 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to maximize your margins?</h2>
        <p className="text-xl text-slate-300 mb-8">
          Join leading scrap yards using Ferrum AI to stay competitive and grow revenue.
        </p>
        <a href={getLoginUrl()}>
          <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2026 Ferrum AI. All rights reserved. | Potent~Flow AI Tech</p>
        </div>
      </footer>
    </div>
  );
}
