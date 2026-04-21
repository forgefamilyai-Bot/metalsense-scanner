import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedYard, setSelectedYard] = useState<number | null>(null);
  const [showNewYardDialog, setShowNewYardDialog] = useState(false);
  const [newYardData, setNewYardData] = useState({ name: "", location: "" });

  // Fetch data
  const { data: yards } = trpc.yards.list.useQuery();
  const { data: metals } = trpc.metals.list.useQuery();
  const { data: prices } = trpc.metals.prices.useQuery();
  const { data: leakage } = trpc.pricing.calculateLeakage.useQuery(
    { yardId: selectedYard || 0 },
    { enabled: !!selectedYard }
  );

  const createYardMutation = trpc.yards.create.useMutation({
    onSuccess: () => {
      toast.success("Yard created successfully");
      setShowNewYardDialog(false);
      setNewYardData({ name: "", location: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateYard = () => {
    if (!newYardData.name) {
      toast.error("Yard name is required");
      return;
    }
    createYardMutation.mutate(newYardData);
  };

  const currentYard = yards?.find((y) => y.id === selectedYard);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Ferrum AI Dashboard</h1>
            <p className="text-sm text-slate-400">{user?.name || "Yard Operator"}</p>
          </div>
          <Button variant="outline" onClick={logout} className="border-slate-600 text-slate-300">
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Yard Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Your Yards</h2>
            <Dialog open={showNewYardDialog} onOpenChange={setShowNewYardDialog}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Yard
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Yard</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Add a new scrap yard to your Ferrum AI account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Yard Name</Label>
                    <Input
                      placeholder="e.g., Downtown Recycling"
                      value={newYardData.name}
                      onChange={(e) => setNewYardData({ ...newYardData, name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Location</Label>
                    <Input
                      placeholder="e.g., 123 Main St, City, State"
                      value={newYardData.location}
                      onChange={(e) => setNewYardData({ ...newYardData, location: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    onClick={handleCreateYard}
                    disabled={createYardMutation.isPending}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    {createYardMutation.isPending ? "Creating..." : "Create Yard"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {/* Live Prices */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Live Market Prices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prices?.map((price) => {
                  const metal = metals?.find((m) => m.id === price.metalId);
                  const leakageItem = leakage?.byMetal.find((l) => l.metalId === price.metalId);

                  return (
                    <Card key={price.metalId} className="bg-slate-800/50 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white">{metal?.name}</CardTitle>
                        <CardDescription className="text-slate-400">{metal?.category}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="text-sm text-slate-400">Market Price</div>
                          <div className="text-2xl font-bold text-amber-400">${price.priceUsd}/lb</div>
                        </div>
                        {leakageItem && (
                          <div className="pt-3 border-t border-slate-700">
                            <div className="flex items-center gap-2 text-red-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">Revenue Gap: ${leakageItem.leakagePerLb.toFixed(2)}/lb</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Revenue Leakage Summary */}
            {leakage && leakage.totalLeakage > 0 && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Revenue Leakage Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-300 mb-4">
                    You're leaving money on the table! Your yard is paying below market rates on average.
                  </p>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    ${leakage.totalLeakage.toFixed(2)}/lb average gap
                  </div>
                  <p className="text-sm text-red-300">
                    Adjust your pricing to match market rates and recover lost revenue.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
            <CardContent>
              <p className="text-slate-400 mb-4">Select or create a yard to view live pricing and analytics</p>
              <Dialog open={showNewYardDialog} onOpenChange={setShowNewYardDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Yard
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Yard</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Add your first scrap yard to get started
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Yard Name</Label>
                      <Input
                        placeholder="e.g., Downtown Recycling"
                        value={newYardData.name}
                        onChange={(e) => setNewYardData({ ...newYardData, name: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Location</Label>
                      <Input
                        placeholder="e.g., 123 Main St, City, State"
                        value={newYardData.location}
                        onChange={(e) => setNewYardData({ ...newYardData, location: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleCreateYard}
                      disabled={createYardMutation.isPending}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      {createYardMutation.isPending ? "Creating..." : "Create Yard"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
