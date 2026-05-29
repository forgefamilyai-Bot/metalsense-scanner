import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, CheckCircle, AlertCircle, TrendingDown } from "lucide-react";

export default function PriceSheetUpload() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [yardId, setYardId] = useState<number | null>(null);

  const { data: yards } = trpc.yards.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: sheets } = trpc.priceSheets.list.useQuery(
    { yardId: yardId || 0 },
    { enabled: !!yardId }
  );

  const { data: latestComparison } = trpc.priceSheets.latest.useQuery(
    { yardId: yardId || 0 },
    { enabled: !!yardId }
  );

  const uploadMutation = trpc.priceSheets.upload.useMutation({
    onSuccess: (data) => {
      toast.success(`Uploaded ${data.parsedMetals} metals from price sheet`);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload price sheet");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("Please upload a CSV file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !yardId) {
      toast.error("Please select a file and yard");
      return;
    }

    setUploading(true);
    try {
      const csvData = await selectedFile.text();
      await uploadMutation.mutateAsync({
        yardId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        csvData,
      });
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Price Sheet</h1>
          <p className="text-muted-foreground">
            Upload your current pricing data to compare against live market rates
          </p>
        </div>

        {/* Yard Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Yard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {yards?.map((yard) => (
                <button
                  key={yard.id}
                  onClick={() => setYardId(yard.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    yardId === yard.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className="font-semibold text-foreground">{yard.name}</div>
                  <div className="text-sm text-muted-foreground">{yard.location}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        {yardId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload CSV File
              </CardTitle>
              <CardDescription>
                CSV format: Metal Name, Price per Pound
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Input */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm font-medium text-foreground">
                    {selectedFile ? selectedFile.name : "Click to select CSV file"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    or drag and drop
                  </div>
                </label>
              </div>

              {/* Example Format */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-semibold text-foreground mb-2">Example CSV Format:</div>
                <pre className="text-xs text-muted-foreground overflow-x-auto">
{`Metal,Price
Copper,3.00
Aluminum,0.75
Steel,0.10
Brass,1.85`}
                </pre>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? "Uploading..." : "Upload Price Sheet"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Latest Comparison */}
        {latestComparison && latestComparison.comparison && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                Price Comparison
              </CardTitle>
              <CardDescription>
                Uploaded: {latestComparison.uploadedAt ? new Date(latestComparison.uploadedAt).toLocaleDateString() : 'Recently'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestComparison.comparison?.comparison?.map((item: any) => (
                  <div key={item.metalId} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{item.metalName}</div>
                      <div className="text-sm text-muted-foreground">
                        Your: ${item.sheetPrice.toFixed(2)} | Market: ${item.marketPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      {item.status === "below_market" && (
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            -${item.gap.toFixed(2)}/lb
                          </span>
                        </div>
                      )}
                      {item.status === "at_market" && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">At Market</span>
                        </div>
                      )}
                      {item.status === "above_market" && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            +${Math.abs(item.gap).toFixed(2)}/lb
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Total Gap */}
                {latestComparison.comparison?.totalGap && (
                  <div className="mt-4 p-4 bg-accent/10 border border-accent rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Revenue Gap</div>
                    <div className="text-2xl font-bold text-foreground">
                      ${latestComparison.comparison.totalGap.toFixed(2)}/lb
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      At 2,000 lbs/month: ${(latestComparison.comparison.totalGap * 2000).toFixed(0)}/month
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Uploads */}
        {sheets && sheets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sheets.map((sheet) => (
                  <div key={sheet.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{sheet.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {sheet.parsedMetals} metals • {sheet.uploadedAt ? new Date(sheet.uploadedAt).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                    <div className="text-sm">
                      {sheet.status === "parsed" && (
                        <span className="text-green-600 font-semibold">✓ Parsed</span>
                      )}
                      {sheet.status === "pending" && (
                        <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                      )}
                      {sheet.status === "error" && (
                        <span className="text-destructive font-semibold">✗ Error</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
