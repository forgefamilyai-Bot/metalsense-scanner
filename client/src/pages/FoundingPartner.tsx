import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Lock, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function FoundingPartner() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

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
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/50 rounded-full px-4 py-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Founding Partner Program</span>
            </div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Lock In Your Price. Forever.
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Be one of the first 3 scrap yards to join Ferrum AI as a Founding Partner. Get 50% off your first 12 months, then your rate is locked for life—no matter how much we raise prices.
          </p>
        </div>

        {/* Offer Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <CardTitle className="text-white">50% Off First Year</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Choose any tier—Scout ($99.50/mo), Pro ($249.50/mo), or Yard Command ($749.50/mo)—and pay half price for 12 months.
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <CardTitle className="text-white">Price Lock for Life</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              After 12 months, your rate is locked. Even if we raise prices to $299, $599, or $1,999, you stay at your founding rate forever.
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <CardTitle className="text-white">Priority Support</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Dedicated account manager, early access to new features, and priority customer support for the life of your subscription.
            </CardContent>
          </Card>
        </div>

        {/* Pricing Comparison */}
        <Card className="bg-slate-800/50 border-slate-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white">Founding Partner vs. Standard Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Tier</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-semibold">Standard Price</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-semibold">Year 1 (Founding)</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-semibold">Year 2+ (Locked)</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-semibold">12-Month Savings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-4 px-4 text-white font-medium">Scout</td>
                    <td className="py-4 px-4 text-right text-slate-300">$199/mo</td>
                    <td className="py-4 px-4 text-right text-amber-400 font-semibold">$99.50/mo</td>
                    <td className="py-4 px-4 text-right text-amber-400 font-semibold">$99.50/mo</td>
                    <td className="py-4 px-4 text-right text-green-400 font-semibold">$1,194</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 bg-slate-700/20">
                    <td className="py-4 px-4 text-white font-medium">Pro</td>
                    <td className="py-4 px-4 text-right text-slate-300">$499/mo</td>
                    <td className="py-4 px-4 text-right text-amber-400 font-semibold">$249.50/mo</td>
                    <td className="py-4 px-4 text-right text-amber-400 font-semibold">$249.50/mo</td>
                    <td className="py-4 px-4 text-right text-green-400 font-semibold">$2,994</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-4 px-4 text-white font-medium">Yard Command</td>
                    <td className="py-4 px-4 text-right text-slate-300">$1,499/mo</td>
                    <td className="py-4 px-4 text-right text-amber-400 font-semibold">$749.50/mo</td>
                    <td className="py-4 px-4 text-right text-amber-400 font-semibold">$749.50/mo</td>
                    <td className="py-4 px-4 text-right text-green-400 font-semibold">$8,994</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* What's Included */}
        <Card className="bg-slate-800/50 border-slate-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white">What You Get</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Live market prices (updated daily)",
                "Revenue leakage calculator",
                "Price comparison tools",
                "Yard profile management",
                "Price history and trends",
                "Mobile-responsive design",
                "Dedicated account manager",
                "Priority email support",
                "Early access to new features",
                "API access (Yard Command only)",
                "Custom integrations (Yard Command only)",
                "Unlimited yards (Yard Command only)",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* The Catch */}
        <Card className="bg-blue-500/10 border-blue-500/30 mb-12">
          <CardHeader>
            <CardTitle className="text-blue-400">Limited Time Offer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-300">
            <p>
              <strong>Only 3 Founding Partner slots available.</strong> Once we've signed 3 scrap yards, this offer closes permanently.
            </p>
            <p>
              <strong>Valid through April 24, 2026.</strong> After that date, standard pricing applies.
            </p>
            <p>
              <strong>No long-term contract.</strong> You can cancel anytime, but you'll lose the price lock benefit.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Lock In Your Price?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Schedule a 15-minute demo to see your real revenue leakage and lock in your Founding Partner rate.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              Claim Your Founding Partner Slot
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2026 Ferrum AI. All rights reserved. | Potent~Flow AI Tech</p>
        </div>
      </footer>
    </div>
  );
}
