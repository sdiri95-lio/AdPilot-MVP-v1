"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImportSimulatorProps = {
  initialMoq: number;
  initialProductCost: number;
  initialFreightCost: number;
  initialDeliveryRate: number; // as percentage e.g., 65 for 65%
  initialSellingPrice: number;
};

export function ImportSimulator({
  initialMoq,
  initialProductCost,
  initialFreightCost,
  initialDeliveryRate,
  initialSellingPrice,
}: ImportSimulatorProps) {
  const [quantity, setQuantity] = useState(initialMoq > 0 ? initialMoq : 100);
  const [productCost, setProductCost] = useState(initialProductCost);
  const [freightCost, setFreightCost] = useState(initialFreightCost);
  const [deliveryRate, setDeliveryRate] = useState(initialDeliveryRate);
  const [sellingPrice, setSellingPrice] = useState(initialSellingPrice);

  // Math
  const capitalRequired = quantity * (productCost + freightCost);
  const expectedDelivered = quantity * (deliveryRate / 100);
  const expectedRevenue = expectedDelivered * sellingPrice;
  // This is a basic gross profit for the import shipment (doesn't account for fb ads spend or local COD fees unless built into freight/product cost).
  const expectedProfit = expectedRevenue - capitalRequired;
  const roi = capitalRequired > 0 ? (expectedProfit / capitalRequired) * 100 : 0;
  
  // How many delivered orders required to cover the capital?
  const breakEvenQuantity = sellingPrice > 0 ? Math.ceil(capitalRequired / sellingPrice) : 0;
  // How many raw orders required to hit break-even delivered, assuming the delivery rate holds true?
  const breakEvenRawOrders = deliveryRate > 0 ? Math.ceil(breakEvenQuantity / (deliveryRate / 100)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Simulator</CardTitle>
        <CardDescription>Calculate cashflow requirements and expected returns for your next import.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Import Quantity (MOQ: {initialMoq})</Label>
            <Input type="number" min={0} value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Product Cost ($)</Label>
            <Input type="number" step="0.01" min={0} value={productCost} onChange={e => setProductCost(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Freight Cost / Unit ($)</Label>
            <Input type="number" step="0.01" min={0} value={freightCost} onChange={e => setFreightCost(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Selling Price ($)</Label>
            <Input type="number" step="0.01" min={0} value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Expected Delivery Rate (%)</Label>
            <Input type="number" max={100} min={0} value={deliveryRate} onChange={e => setDeliveryRate(Number(e.target.value))} />
          </div>
        </div>

        <div className="pt-6 border-t grid gap-4 md:grid-cols-2 lg:grid-cols-5 text-center">
          <div className="bg-muted rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Capital Required</p>
            <p className="text-2xl font-bold">${capitalRequired.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-muted rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Expected Revenue</p>
            <p className="text-2xl font-bold">${expectedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-muted rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Gross Profit</p>
            <p className={`text-2xl font-bold ${expectedProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
              ${expectedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">ROI</p>
            <p className={`text-2xl font-bold ${roi >= 0 ? "text-green-600" : "text-destructive"}`}>
              {roi.toFixed(1)}%
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Break-even</p>
            <p className="text-2xl font-bold">{breakEvenRawOrders} <span className="text-sm font-normal text-muted-foreground">orders</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
