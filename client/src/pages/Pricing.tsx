import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedYard, setSelectedYard] = useState<number | null>(null);
  const [yardPrices, setYardPrices] = useState<Record<number, number>>({});
  const [editingPrices, setEditingPrices] = useState(false);

  // Fetch data
  const { data: yards } = trpc.yards.list.useQuery();
  const { data: metals } = trpc.metals.list.useQuery();
  const { data: prices } = trpc.metals.prices.useQuery();
  const { data: currentYardPrices } = trpc.pricing.getYardPrices.useQuery(
    { yardId: selectedYard || 0 },
    { enabled: !!selectedYard }
  );
  const { data: leakage } = trpc.pricing.calculateLeakage.useQuery(
    { yardId: selectedYard || 0 },
    { enabled: !!selectedYard }
  );

  const updatePriceMutation = trpc.pricing.updatePrice.useMutation({
    onSuccess: () => {
      toast.success("Price updated successfully");
      setEditingPrices(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUpdatePrice = (metalId: number, newPrice: number) => {
    if (!selectedYard) return;
    updatePriceMutation.mutate({
      yardId: selectedYard,
      metalId,
      priceUsd: newPrice,
    });
  };

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const currentYard = yards?.find((y) => y.id === selectedYard);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Price Comparison</h1>
          <p className="text-sm text-slate-400">Compare your yard prices with live market rates</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Yard Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Select Yard</h2>
          <div className="grid grid-cols-1 gap-4">
            {yards?.map((yard) => (
              <Card
                key={yard.id}
                className={`cursor-pointer transition border-2 ${
                  selectedYard === yard.id
                    ? "border-amber-500 bg-slate-800"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
                onClick={() => setSelectedYard(yard.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">{yard.name}</CardTitle>
                  <CardDescription className="text-slate-400 text-sm">{yard.location}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {selectedYard && currentYard ? (
          <div className="space-y-8">
            {/* Revenue Leakage Alert */}
            {leakage && leakage.totalLeakage > 0 && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Revenue Leakage Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <div className="text-sm text-red-300 mb-1">Average Gap</div>
                      <div className="text-3xl font-bold text-red-400">
                        ${leakage.totalLeakage.toFixed(2)}/lb
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-red-300 mb-1">Metals Below Market</div>
                      <div className="text-3xl font-bold text-red-400">
                        {leakage.byMetal.filter((m) => m.leakagePerLb > 0).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-red-300 mb-1">Potential Monthly Loss</div>
                      <div className="text-3xl font-bold text-red-400">
                        ${(leakage.totalLeakage * 2000).toFixed(0)}
                      </div>
                      <div className="text-xs text-red-300">per 2000 lbs/month</div>
                    </div>
                  </div>
                  <p className="text-red-300 mt-4 text-sm">
                    Adjust your pricing below to match or exceed market rates and recover lost revenue.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Price Comparison Table */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Price Comparison</CardTitle>
                    <CardDescription className="text-slate-400">
                      {currentYard.name} vs. Market Rates
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setEditingPrices(!editingPrices)}
                    variant={editingPrices ? "default" : "outline"}
                    className={editingPrices ? "bg-amber-500 hover:bg-amber-600 text-black" : ""}
                  >
                    {editingPrices ? "Done Editing" : "Edit Prices"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Metal</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">Market Rate</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">Your Price</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">Gap</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metals?.map((metal) => {
                        const marketPrice = prices?.find((p) => p.metalId === metal.id);
                        const yardPrice = currentYardPrices?.find((p) => p.metalId === metal.id);
                        const marketPriceNum = marketPrice ? parseFloat(marketPrice.priceUsd) : 0;
                        const yardPriceNum = yardPrice ? parseFloat(yardPrice.priceUsd as any) : 0;
                        const gap = marketPriceNum - yardPriceNum;

                        return (
                          <tr key={metal.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                            <td className="py-4 px-4 text-white font-medium">{metal.name}</td>
                            <td className="py-4 px-4 text-right text-amber-400 font-semibold">
                              ${marketPrice?.priceUsd || "N/A"}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {editingPrices ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={yardPriceNum || ""}
                                  onChange={(e) => {
                                    const newPrice = parseFloat(e.target.value);
                                    handleUpdatePrice(metal.id, newPrice);
                                  }}
                                  className="w-24 bg-slate-700 border-slate-600 text-white text-right"
                                  placeholder="0.00"
                                />
                              ) : (
                                <span className="text-slate-300">${yardPriceNum.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={gap > 0 ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>
                                ${gap.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {gap > 0.05 ? (
                                <div className="flex items-center justify-center gap-1 text-red-400">
                                  <TrendingDown className="w-4 h-4" />
                                  <span className="text-xs">Below</span>
                                </div>
                              ) : gap < -0.05 ? (
                                <div className="flex items-center justify-center gap-1 text-green-400">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="text-xs">Above</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">Match</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400">Pricing Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-blue-300 text-sm">
                <p>
                  • <strong>Match or exceed market rates</strong> to stay competitive and attract more scrap suppliers
                </p>
                <p>
                  • <strong>Price premium metals higher</strong> (copper, brass, nickel) to maximize revenue on high-value materials
                </p>
                <p>
                  • <strong>Monitor daily price changes</strong> and adjust your pricing weekly to stay aligned with market trends
                </p>
                <p>
                  • <strong>Consider volume discounts</strong> for large suppliers while maintaining healthy margins
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
            <CardContent>
              <p className="text-slate-400">Select a yard to view price comparison and leakage analysis</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
