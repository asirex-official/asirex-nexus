import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, IndianRupee, TrendingUp, TrendingDown, 
  Package, Wrench, Users, Truck, Download, RotateCcw
} from "lucide-react";

interface CalculationResult {
  totalRevenue: number;
  totalManufacturingCost: number;
  totalAssemblyCost: number;
  totalLabourCost: number;
  totalPartsCost: number;
  totalDeliveryCost: number;
  totalCost: number;
  netProfitPerUnit: number;
  totalNetProfit: number;
  profitMargin: number;
}

export function BusinessCalculator() {
  const [inputs, setInputs] = useState({
    numberOfOrders: "",
    pricePerUnit: "",
    manufacturingCost: "",
    assemblyCost: "",
    labourCost: "",
    partsCost: "",
    deliveryCost: "",
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleInputChange = (field: string, value: string) => {
    // Only allow numbers and decimals
    if (value && !/^\d*\.?\d*$/.test(value)) return;
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculate = () => {
    const orders = parseFloat(inputs.numberOfOrders) || 0;
    const price = parseFloat(inputs.pricePerUnit) || 0;
    const manufacturing = parseFloat(inputs.manufacturingCost) || 0;
    const assembly = parseFloat(inputs.assemblyCost) || 0;
    const labour = parseFloat(inputs.labourCost) || 0;
    const parts = parseFloat(inputs.partsCost) || 0;
    const delivery = parseFloat(inputs.deliveryCost) || 0;

    const totalRevenue = orders * price;
    const costPerUnit = manufacturing + assembly + labour + parts + delivery;
    const totalCost = orders * costPerUnit;
    const netProfitPerUnit = price - costPerUnit;
    const totalNetProfit = orders * netProfitPerUnit;
    const profitMargin = price > 0 ? (netProfitPerUnit / price) * 100 : 0;

    setResult({
      totalRevenue,
      totalManufacturingCost: orders * manufacturing,
      totalAssemblyCost: orders * assembly,
      totalLabourCost: orders * labour,
      totalPartsCost: orders * parts,
      totalDeliveryCost: orders * delivery,
      totalCost,
      netProfitPerUnit,
      totalNetProfit,
      profitMargin,
    });
  };

  const reset = () => {
    setInputs({
      numberOfOrders: "",
      pricePerUnit: "",
      manufacturingCost: "",
      assemblyCost: "",
      labourCost: "",
      partsCost: "",
      deliveryCost: "",
    });
    setResult(null);
  };

  const exportReport = () => {
    if (!result) return;

    const report = `
ASIREX Business Calculator Report
Generated: ${new Date().toLocaleString()}
========================================

INPUT VALUES
------------
Number of Orders: ${inputs.numberOfOrders}
Price Per Unit: ₹${inputs.pricePerUnit}
Manufacturing Cost/Unit: ₹${inputs.manufacturingCost}
Assembly Cost/Unit: ₹${inputs.assemblyCost}
Labour Cost/Unit: ₹${inputs.labourCost}
Parts Cost/Unit: ₹${inputs.partsCost}
Delivery Cost/Unit: ₹${inputs.deliveryCost}

RESULTS
-------
Total Revenue: ₹${result.totalRevenue.toLocaleString()}
Total Manufacturing Cost: ₹${result.totalManufacturingCost.toLocaleString()}
Total Assembly Cost: ₹${result.totalAssemblyCost.toLocaleString()}
Total Labour Cost: ₹${result.totalLabourCost.toLocaleString()}
Total Parts Cost: ₹${result.totalPartsCost.toLocaleString()}
Total Delivery Cost: ₹${result.totalDeliveryCost.toLocaleString()}
Total Cost: ₹${result.totalCost.toLocaleString()}

PROFIT ANALYSIS
---------------
Net Profit Per Unit: ₹${result.netProfitPerUnit.toLocaleString()}
Total Net Profit: ₹${result.totalNetProfit.toLocaleString()}
Profit Margin: ${result.profitMargin.toFixed(2)}%
`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `business-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">
      {/* Calculator Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Business Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Number of Orders */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Number of Orders
              </Label>
              <Input
                type="text"
                placeholder="e.g., 100"
                value={inputs.numberOfOrders}
                onChange={(e) => handleInputChange("numberOfOrders", e.target.value)}
              />
            </div>

            {/* Price Per Unit */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Price Per Unit (₹)
              </Label>
              <Input
                type="text"
                placeholder="e.g., 2000"
                value={inputs.pricePerUnit}
                onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
              />
            </div>

            {/* Manufacturing Cost */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Manufacturing Cost/Unit (₹)
              </Label>
              <Input
                type="text"
                placeholder="e.g., 500"
                value={inputs.manufacturingCost}
                onChange={(e) => handleInputChange("manufacturingCost", e.target.value)}
              />
            </div>

            {/* Assembly Cost */}
            <div className="space-y-2">
              <Label>Assembly Cost/Unit (₹)</Label>
              <Input
                type="text"
                placeholder="e.g., 200"
                value={inputs.assemblyCost}
                onChange={(e) => handleInputChange("assemblyCost", e.target.value)}
              />
            </div>

            {/* Labour Cost */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Labour Cost/Unit (₹)
              </Label>
              <Input
                type="text"
                placeholder="e.g., 100"
                value={inputs.labourCost}
                onChange={(e) => handleInputChange("labourCost", e.target.value)}
              />
            </div>

            {/* Parts Cost */}
            <div className="space-y-2">
              <Label>Parts Cost/Unit (₹)</Label>
              <Input
                type="text"
                placeholder="e.g., 800"
                value={inputs.partsCost}
                onChange={(e) => handleInputChange("partsCost", e.target.value)}
              />
            </div>

            {/* Delivery Cost */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Delivery Cost/Unit (₹)
              </Label>
              <Input
                type="text"
                placeholder="e.g., 50"
                value={inputs.deliveryCost}
                onChange={(e) => handleInputChange("deliveryCost", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={calculate} className="gap-2">
              <Calculator className="w-4 h-4" />
              Calculate
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {result.totalNetProfit >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                Calculation Results
              </CardTitle>
              <Button variant="outline" size="sm" onClick={exportReport} className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Revenue</h3>
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-500">{formatCurrency(result.totalRevenue)}</p>
                </div>
              </div>

              {/* Costs Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manufacturing</span>
                    <span>{formatCurrency(result.totalManufacturingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assembly</span>
                    <span>{formatCurrency(result.totalAssemblyCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labour</span>
                    <span>{formatCurrency(result.totalLabourCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parts</span>
                    <span>{formatCurrency(result.totalPartsCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{formatCurrency(result.totalDeliveryCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost</span>
                    <span className="text-red-500">{formatCurrency(result.totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Profit Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`${result.totalNetProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Net Profit Per Unit</p>
                  <p className={`text-2xl font-bold ${result.netProfitPerUnit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(result.netProfitPerUnit)}
                  </p>
                </CardContent>
              </Card>

              <Card className={`${result.totalNetProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Net Profit</p>
                  <p className={`text-2xl font-bold ${result.totalNetProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(result.totalNetProfit)}
                  </p>
                </CardContent>
              </Card>

              <Card className={`${result.profitMargin >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className={`text-2xl font-bold ${result.profitMargin >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {result.profitMargin.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
