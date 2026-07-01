"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Brain,
  Calendar,
  DollarSign,
  Activity,
  Award,
  Globe,
  Upload,
  ChevronRight,
  Save,
  Loader2,
  FileText,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

type CODMetrics = {
  id: string;
  confirmationRate: number;
  deliveryRate: number;
  returnRate: number;
  shippingCost: number;
  returnFee: number;
};

type ProductResearch = {
  id: string;
  productIntelligence: {
    problemSolved: string;
    painLevel: number;
    urgency: string;
    impulseVsRational: string;
    emotionalTriggers: string[];
    objections: string[];
  };
  marketIntelligence: {
    maturity: string;
    competition: string;
    demandTrend: string;
    seasonality: string;
    evergreenPotential: string;
  };
  customerProfile: {
    age: string;
    gender: string;
    income: string;
    lifestyle: string;
    painPoints: string[];
    dreamOutcome: string;
    motivations: string[];
    objections: string[];
  };
  marketingArsenal: {
    angles: string[];
    hooks: string[];
    offers: string[];
    headlines: string[];
    creativeConcepts: string[];
    landingPageStructure: string[];
    upsells: string[];
    bundles: string[];
    pricingPsychology: string;
  };
  countryAnalysis: {
    codQualityScore: number;
    deliveryReliability: string;
    buyingPower: string;
    competitionLevel: string;
    recommendedPriceRange: string;
    riskLevel: string;
    opportunityScore: number;
  };
  finalRecommendation: {
    status: "GO" | "NO-GO" | "CONDITIONAL";
    score: number;
    reasoning: string;
  };
  createdAt: string;
};

type AdvertisingAnalysis = {
  id: string;
  csvUploadId: string | null;
  campaignHealthScore: number;
  overallDecision: "SCALE" | "OPTIMIZE" | "RETEST" | "KILL";
  confidenceScore: number;
  businessIntel: {
    breakEvenCpp: number;
    breakEvenCpa: number;
    maxAcceptableAdSpendPerOrder: number;
    projectedMonthlyProfitCurrent: number;
    projectedMonthlyProfitOptimized: number;
  };
  creativeRanking: {
    netProfitPerDeliveredOrder: number;
    fiveDayRevenue: number;
    fiveDayNetProfit: number;
    returnRate: number;
    confirmationRate: number;
    realRoas: number;
    stockRemainingEstimate: number;
  };
  winningAdSets: Array<{
    adSetName: string;
    spend: number;
    orders: number;
    cpp: number;
    roas: number;
    status: "SCALE" | "OPTIMIZE" | "PAUSE" | "KILL";
    recommendation: string;
  }>;
  losingAdSets: {
    totalOrders: number;
    confirmedOrders: number;
    confirmedRate: number;
    shippedOrders: number;
    deliveredOrders: number;
    deliveryRate: number;
    returnedOrders: number;
    returnRate: number;
  };
  fatigueWarnings: Array<{
    severity: "RED" | "AMBER";
    finding: string;
    action: string;
  }>;
  optimizationActions: {
    revenue: number;
    cogs: number;
    internationalShipping: number;
    grossProfit: number;
    codDeliveryFee: number;
    returnCostAllocation: number;
    adSpendAllocation: number;
    netProfitPerOrder: number;
    percentages: {
      revenuePercent: number;
      cogsPercent: number;
      internationalShippingPercent: number;
      grossProfitPercent: number;
      codDeliveryFeePercent: number;
      returnCostAllocationPercent: number;
      adSpendAllocationPercent: number;
      netProfitPerOrderPercent: number;
    };
  };
  actionPlan: {
    priority1: string[];
    priority2: string[];
    priority3: string[];
    overallDecision: "SCALE" | "OPTIMIZE" | "RETEST" | "KILL";
    reasoning: string;
  };
  createdAt: string;
  csvUpload: {
    id: string;
    kpiSummary: {
      spend: number;
      impressions: number;
      clicks: number;
      orders: number;
      cpm: number;
      ctr: number;
      cpc: number;
      cpp: number;
    };
    createdAt: string;
  } | null;
};

export type Project = {
  id: string;
  name: string;
  productName: string;
  productCost: number;
  sellingPrice: number;
  shippingCost: number;
  serviceFee: number;
  targetCountry: string;
  productUrl: string | null;
  status: string;
  createdAt: string;
  codMetrics: CODMetrics | null;
  researches: ProductResearch[];
  analyses: AdvertisingAnalysis[];
};

type ProjectWorkspaceProps = {
  project: Project;
};

export function ProjectWorkspace({ project: initialProject }: ProjectWorkspaceProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeTab, setActiveTab] = useState<"research" | "ads">("research");

  // Settings form states
  const [productCost, setProductCost] = useState(project.productCost.toString());
  const [sellingPrice, setSellingPrice] = useState(project.sellingPrice.toString());
  const [shippingCost, setShippingCost] = useState(project.shippingCost.toString());
  const [serviceFee, setServiceFee] = useState(project.serviceFee.toString());
  const [targetCountry, setTargetCountry] = useState(project.targetCountry);
  const [productUrl, setProductUrl] = useState(project.productUrl || "");

  // COD metrics form states
  const [confirmationRate, setConfirmationRate] = useState(project.codMetrics?.confirmationRate?.toString() || "100");
  const [deliveryRate, setDeliveryRate] = useState(project.codMetrics?.deliveryRate?.toString() || "100");
  const [returnRate, setReturnRate] = useState(project.codMetrics?.returnRate?.toString() || "0");
  const [codShippingCost, setCodShippingCost] = useState(project.codMetrics?.shippingCost?.toString() || "0");
  const [returnFee, setReturnFee] = useState(project.codMetrics?.returnFee?.toString() || "0");

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  // Product Research section states
  const [inputUrl, setInputUrl] = useState(project.productUrl || "");
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState("");
  const [selectedResearchId, setSelectedResearchId] = useState(project.researches[0]?.id || "");

  // Ad Intelligence section states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(project.analyses[0]?.id || "");

  const activeResearch = project.researches.find(r => r.id === selectedResearchId) || project.researches[0];
  const activeAnalysis = project.analyses.find(a => a.id === selectedAnalysisId) || project.analyses[0];

  // Save parameters to database
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    setSettingsError("");

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCost: parseFloat(productCost),
          sellingPrice: parseFloat(sellingPrice),
          shippingCost: parseFloat(shippingCost),
          serviceFee: parseFloat(serviceFee),
          targetCountry,
          productUrl,
          codMetrics: {
            confirmationRate: parseFloat(confirmationRate),
            deliveryRate: parseFloat(deliveryRate),
            returnRate: parseFloat(returnRate),
            shippingCost: parseFloat(codShippingCost),
            returnFee: parseFloat(returnFee),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save parameters");
      }

      setProject((prev) => ({
        ...prev,
        ...data.project,
        productCost: Number(data.project.productCost),
        sellingPrice: Number(data.project.sellingPrice),
        shippingCost: Number(data.project.shippingCost),
        serviceFee: Number(data.project.serviceFee),
        codMetrics: data.project.codMetrics
          ? {
              id: data.project.codMetrics.id,
              confirmationRate: Number(data.project.codMetrics.confirmationRate),
              deliveryRate: Number(data.project.codMetrics.deliveryRate),
              returnRate: Number(data.project.codMetrics.returnRate),
              shippingCost: Number(data.project.codMetrics.shippingCost),
              returnFee: Number(data.project.codMetrics.returnFee),
            }
          : null,
      }));

      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: unknown) {
      setSettingsError(err instanceof Error ? err.message : "Error saving settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Run URL scraping & AI Research
  const handleRunResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;

    setIsResearching(true);
    setResearchError("");

    try {
      const res = await fetch(`/api/projects/${project.id}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productUrl: inputUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI Research failed");
      }

      // Add to list and select it
      setProject(prev => ({
        ...prev,
        productUrl: inputUrl,
        researches: [data.research, ...prev.researches],
      }));
      setSelectedResearchId(data.research.id);
      setProductUrl(inputUrl);
    } catch (err: unknown) {
      setResearchError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsResearching(false);
    }
  };

  // Upload & analyze Facebook Ads CSV
  const handleUploadCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsAnalyzing(true);
    setAnalysisError("");

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const res = await fetch(`/api/projects/${project.id}/ad-intelligence`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ad campaign analysis failed");
      }

      // Add to lists and select
      setProject(prev => ({
        ...prev,
        analyses: [data.analysis, ...prev.analyses],
      }));
      setSelectedAnalysisId(data.analysis.id);
      setCsvFile(null);
    } catch (err: unknown) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Decision Badge Styling
  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "SCALE":
        return <Badge className="bg-emerald-600 dark:bg-emerald-500 text-white font-extrabold px-3 py-1">SCALE</Badge>;
      case "OPTIMIZE":
        return <Badge className="bg-amber-600 dark:bg-amber-500 text-white font-extrabold px-3 py-1">OPTIMIZE</Badge>;
      case "RETEST":
        return <Badge className="bg-blue-600 dark:bg-blue-500 text-white font-extrabold px-3 py-1">RETEST</Badge>;
      case "KILL":
        return <Badge className="bg-rose-600 dark:bg-rose-500 text-white font-extrabold px-3 py-1">KILL</Badge>;
      default:
        return <Badge variant="secondary">{decision}</Badge>;
    }
  };

  const getRecBadge = (rec: string) => {
    switch (rec) {
      case "GO":
        return <Badge className="bg-emerald-600 dark:bg-emerald-500 text-white font-extrabold text-sm px-3 py-1">GO</Badge>;
      case "CONDITIONAL":
        return <Badge className="bg-amber-600 dark:bg-amber-500 text-white font-extrabold text-sm px-3 py-1">CONDITIONAL</Badge>;
      case "NO-GO":
        return <Badge className="bg-rose-600 dark:bg-rose-500 text-white font-extrabold text-sm px-3 py-1">NO-GO</Badge>;
      default:
        return <Badge variant="secondary">{rec}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Area with project title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-6 rounded-xl border border-zinc-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {project.targetCountry}
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1 text-white">{project.name}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Product: <strong className="text-zinc-200">{project.productName}</strong> | Created: {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Tab selection buttons */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab("research")}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all flex-1 md:flex-initial ${
              activeTab === "research" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Brain className="h-4 w-4" />
            Product Research
          </button>
          <button
            onClick={() => setActiveTab("ads")}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all flex-1 md:flex-initial ${
              activeTab === "ads" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Ad Campaign Audit
          </button>
        </div>
      </div>

      {/* Main Grid: Left Settings & Right Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Side: Product Settings & COD Parameters (Takes 1 Column) */}
        <div className="lg:col-span-1 space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-900 space-y-6 relative"
          >
            <div className="flex justify-between items-center pb-3 border-b border-zinc-900/80">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-500" />
                COD & Price Parameters
              </h3>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="text-indigo-500 hover:text-indigo-400 disabled:opacity-50 transition-colors p-1"
                title="Save Settings"
              >
                {isSavingSettings ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
            </div>

            {settingsSuccess && (
              <p className="p-2 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-center font-semibold">
                Parameters saved successfully!
              </p>
            )}

            {settingsError && (
              <p className="p-2 text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-center font-semibold">
                {settingsError}
              </p>
            )}

            {/* Product Costs & Price fields */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500 flex items-center justify-between">
                  Selling Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500">Product Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productCost}
                  onChange={(e) => setProductCost(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500">Outbound Shipping ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500">Local Service Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={serviceFee}
                  onChange={(e) => setServiceFee(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500">Target Country</label>
                <input
                  type="text"
                  required
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* COD Metrics fields */}
            <div className="space-y-4 pt-4 border-t border-zinc-900/80">
              <h4 className="text-[10px] uppercase font-extrabold text-indigo-400 tracking-wider">
                COD Logistics Rates
              </h4>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500 flex justify-between">
                  Call Confirmation Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={confirmationRate}
                  onChange={(e) => setConfirmationRate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500">COD Delivery Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={deliveryRate}
                  onChange={(e) => setDeliveryRate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500">COD Return Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={returnRate}
                  onChange={(e) => setReturnRate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500">Outbound Courier Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={codShippingCost}
                  onChange={(e) => setCodShippingCost(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500">Courier Return Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={returnFee}
                  onChange={(e) => setReturnFee(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 text-zinc-400" />
                  Save Parameters
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Tab Contents (Takes 3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: PRODUCT RESEARCH */}
          {activeTab === "research" && (
            <div className="space-y-6">
              {/* Product Research Generation form */}
              <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-200">AI Product Research Engine</h3>
                  <p className="text-xs text-zinc-400">
                    Paste a supplier, competitor, or landing page link below to scrape it and run AI intelligence.
                  </p>
                </div>

                <form onSubmit={handleRunResearch} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    required
                    placeholder="https://aliexpress.com/item/..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isResearching || !inputUrl}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all disabled:opacity-50"
                  >
                    {isResearching ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Scraping & Researching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4.5 w-4.5" />
                        Execute AI Research
                      </>
                    )}
                  </button>
                </form>

                {researchError && (
                  <p className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg">
                    {researchError}
                  </p>
                )}
              </div>

              {/* Research Display */}
              {project.researches.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border border-zinc-900 rounded-xl bg-zinc-900/10 text-center">
                  <FileText className="h-10 w-10 text-zinc-700 mb-3 animate-pulse" />
                  <h3 className="font-bold text-sm text-zinc-400">No product research reports yet</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1">
                    Enter a product URL above and run the AI analyzer to generate a high-fidelity logistics, customer, and marketing viability report.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Dropdown selectors for history */}
                  <div className="flex items-center justify-between bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                      <span className="text-xs text-zinc-400 font-medium">Historical Reports:</span>
                      <select
                        className="bg-transparent border-none font-bold focus:ring-0 text-xs text-indigo-400 cursor-pointer"
                        value={selectedResearchId}
                        onChange={(e) => setSelectedResearchId(e.target.value)}
                      >
                        {project.researches.map((r, idx) => (
                          <option key={r.id} value={r.id}>
                            Report {project.researches.length - idx} ({new Date(r.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {activeResearch && (
                    <div className="space-y-6">
                      {/* Macro Gauge Card */}
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-900 flex flex-col justify-between relative overflow-hidden md:col-span-1">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Launches Verdict</span>
                            <div className="flex items-center gap-2 mt-1">
                              {getRecBadge(activeResearch.finalRecommendation.status)}
                            </div>
                          </div>
                          <div className="mt-8">
                            <p className="text-xs text-zinc-400 italic">&quot;{activeResearch.finalRecommendation.reasoning}&quot;</p>
                          </div>
                        </div>

                        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-900 flex flex-col justify-between relative overflow-hidden md:col-span-1">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Viability Score</span>
                            <div className="text-4xl font-black mt-2 text-white">
                              {activeResearch.finalRecommendation.score}
                              <span className="text-xs font-normal text-zinc-500">/100</span>
                            </div>
                          </div>
                          <div className="h-1 bg-zinc-950 rounded-full mt-8 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${activeResearch.finalRecommendation.score}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-900 flex flex-col justify-between relative overflow-hidden md:col-span-1">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Country Opportunity</span>
                            <div className="text-4xl font-black mt-2 text-white">
                              {activeResearch.countryAnalysis.opportunityScore}
                              <span className="text-xs font-normal text-zinc-500">/100</span>
                            </div>
                          </div>
                          <div className="mt-8 text-xs text-zinc-400">
                            COD Quality: <strong className="text-zinc-200">{activeResearch.countryAnalysis.codQualityScore}%</strong>
                          </div>
                        </div>
                      </div>

                      {/* Detail Section Grid */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Product Intelligence */}
                        <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-4">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                            <ShoppingBag className="h-4 w-4" />
                            Product Intelligence
                          </h4>
                          <div className="space-y-3 text-xs">
                            <div className="space-y-0.5">
                              <p className="text-zinc-500 font-medium">Problem Solved:</p>
                              <p className="text-zinc-300">{activeResearch.productIntelligence.problemSolved}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-0.5">
                                <p className="text-zinc-500 font-medium">Pain Level:</p>
                                <p className="font-bold text-zinc-300">{activeResearch.productIntelligence.painLevel}/10</p>
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-zinc-500 font-medium">Urgency:</p>
                                <p className="font-bold text-zinc-300">{activeResearch.productIntelligence.urgency}</p>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-zinc-500 font-medium">Impulse vs Rational:</p>
                              <p className="text-zinc-300">{activeResearch.productIntelligence.impulseVsRational}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-zinc-500 font-medium">Key Emotional Triggers:</p>
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {activeResearch.productIntelligence.emotionalTriggers.map((t, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[10px] py-0">{t}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Market Intelligence */}
                        <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-4">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                            <Globe className="h-4 w-4" />
                            Market Intelligence
                          </h4>
                          <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-0.5">
                                <p className="text-zinc-500 font-medium">Maturity:</p>
                                <p className="text-zinc-300 font-semibold">{activeResearch.marketIntelligence.maturity}</p>
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-zinc-500 font-medium">Competition:</p>
                                <p className="text-zinc-300 font-semibold">{activeResearch.marketIntelligence.competition}</p>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-zinc-500 font-medium">Demand Trend:</p>
                              <p className="text-zinc-300">{activeResearch.marketIntelligence.demandTrend}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-zinc-500 font-medium">Seasonality:</p>
                              <p className="text-zinc-300">{activeResearch.marketIntelligence.seasonality}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-zinc-500 font-medium">Evergreen Potential:</p>
                              <p className="text-zinc-300">{activeResearch.marketIntelligence.evergreenPotential}</p>
                            </div>
                          </div>
                        </div>

                        {/* Customer Profile */}
                        <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-4">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                            <Brain className="h-4 w-4" />
                            Customer Avatar profile
                          </h4>
                          <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <p className="text-zinc-500 text-[10px]">Age Mix</p>
                                <p className="font-semibold text-zinc-300">{activeResearch.customerProfile.age}</p>
                              </div>
                              <div>
                                <p className="text-zinc-500 text-[10px]">Gender</p>
                                <p className="font-semibold text-zinc-300">{activeResearch.customerProfile.gender}</p>
                              </div>
                              <div>
                                <p className="text-zinc-500 text-[10px]">Income</p>
                                <p className="font-semibold text-zinc-300">{activeResearch.customerProfile.income}</p>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-zinc-500 font-medium">Lifestyle:</p>
                              <p className="text-zinc-300">{activeResearch.customerProfile.lifestyle}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-zinc-500 font-medium">Dream Outcome:</p>
                              <p className="text-zinc-300 font-bold text-indigo-400">{activeResearch.customerProfile.dreamOutcome}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500 font-medium">Primary Pain Points:</p>
                              <ul className="list-disc pl-4 space-y-0.5 pt-1 text-zinc-300">
                                {activeResearch.customerProfile.painPoints.map((p, idx) => (
                                  <li key={idx}>{p}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Logistics Country analysis */}
                        <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-4">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                            <Globe className="h-4 w-4" />
                            Logistics & Country Feasibility
                          </h4>
                          <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-zinc-500">Delivery Reliability</p>
                                <p className="font-semibold text-zinc-300">{activeResearch.countryAnalysis.deliveryReliability}</p>
                              </div>
                              <div>
                                <p className="text-zinc-500">Local Buying Power</p>
                                <p className="font-semibold text-zinc-300">{activeResearch.countryAnalysis.buyingPower}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-zinc-500">Competition Level</p>
                                <p className="font-semibold text-zinc-300">{activeResearch.countryAnalysis.competitionLevel}</p>
                              </div>
                              <div>
                                <p className="text-zinc-500">Risk Level</p>
                                <p className="font-semibold text-zinc-300">{activeResearch.countryAnalysis.riskLevel}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-zinc-500">Recommended Local Retail Price Range</p>
                              <p className="font-bold text-emerald-400 text-sm">{activeResearch.countryAnalysis.recommendedPriceRange}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Marketing Arsenal (Giga section) */}
                      <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-6">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                          <Sparkles className="h-4 w-4 text-indigo-500" />
                          Marketing Strategy & Creative Arsenal
                        </h4>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-3">
                            <p className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">Scroll-Stopping Hooks</p>
                            <ul className="space-y-2 text-xs">
                              {activeResearch.marketingArsenal.hooks.map((h, idx) => (
                                <li key={idx} className="flex gap-2 p-2 rounded bg-zinc-950 border border-zinc-900">
                                  <span className="font-bold text-indigo-500 flex-shrink-0">Hook {idx + 1}:</span>
                                  <span className="text-zinc-300">&quot;{h}&quot;</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-3">
                            <p className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">Angles & Positioning</p>
                            <ul className="space-y-2 text-xs">
                              {activeResearch.marketingArsenal.angles.map((a, idx) => (
                                <li key={idx} className="flex gap-2 p-2 rounded bg-zinc-950 border border-zinc-900">
                                  <span className="font-bold text-indigo-500 flex-shrink-0">Angle {idx + 1}:</span>
                                  <span className="text-zinc-300">{a}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3 pt-4 border-t border-zinc-900/80">
                          <div className="space-y-2 text-xs">
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500">Offer Structures</p>
                            <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                              {activeResearch.marketingArsenal.offers.map((o, i) => <li key={i}>{o}</li>)}
                            </ul>
                          </div>

                          <div className="space-y-2 text-xs">
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500">Creative Concepts</p>
                            <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                              {activeResearch.marketingArsenal.creativeConcepts.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          </div>

                          <div className="space-y-2 text-xs">
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500">AOV Boosters (Upsells & Bundles)</p>
                            <p className="text-[10px] text-zinc-400 font-semibold mb-1">Recommended Upsell Ideas:</p>
                            <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                              {activeResearch.marketingArsenal.upsells.map((u, i) => <li key={i}>{u}</li>)}
                            </ul>
                            <p className="text-[10px] text-zinc-400 font-semibold mt-2 mb-1">Bundle Setups:</p>
                            <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                              {activeResearch.marketingArsenal.bundles.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-900/80 grid gap-6 md:grid-cols-2 text-xs">
                          <div>
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500">Pricing Psychology</p>
                            <p className="text-zinc-300 mt-1">{activeResearch.marketingArsenal.pricingPsychology}</p>
                          </div>
                          <div>
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500">Recommended Landing Page flow</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {activeResearch.marketingArsenal.landingPageStructure.map((s, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 px-2 py-1 rounded text-[10px] font-semibold text-zinc-300">
                                  <span>{idx + 1}. {s}</span>
                                  {idx < activeResearch.marketingArsenal.landingPageStructure.length - 1 && <ChevronRight className="h-3 w-3 text-zinc-600" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AD INTELLIGENCE */}
          {activeTab === "ads" && (
            <div className="space-y-6">
              {/* CSV Upload widget */}
              <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-200">Intelligent CSV Campaign Auditor</h3>
                  <p className="text-xs text-zinc-400">
                    Upload your raw Facebook Ads Manager export (must contain Campaign Name, Ad Set Name, Spend, and Conversions/Results).
                  </p>
                </div>

                <form onSubmit={handleUploadCsv} className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-800 border-dashed rounded-lg cursor-pointer bg-zinc-950/50 hover:bg-zinc-950/80 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-zinc-500" />
                        <p className="mb-1 text-xs text-zinc-400">
                          <span className="font-bold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-[10px] text-zinc-500">Facebook Ads CSV file only</p>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {csvFile && (
                    <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded border border-zinc-800 text-xs">
                      <span className="truncate max-w-[80%] text-zinc-300 font-semibold">{csvFile.name}</span>
                      <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            Analyze campaign
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>

                {analysisError && (
                  <p className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg">
                    {analysisError}
                  </p>
                )}
              </div>

              {/* Reports Display */}
              {project.analyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border border-zinc-900 rounded-xl bg-zinc-900/10 text-center">
                  <TrendingUp className="h-10 w-10 text-zinc-700 mb-3 animate-pulse" />
                  <h3 className="font-bold text-sm text-zinc-400">No ad campaign audits yet</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1">
                    Upload your Facebook campaign performance CSV above to map ad metrics with confirmation, delivery, and return rates.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Dropdown selectors for history */}
                  <div className="flex items-center justify-between bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                      <span className="text-xs text-zinc-400 font-medium">Historical Audits:</span>
                      <select
                        className="bg-transparent border-none font-bold focus:ring-0 text-xs text-indigo-400 cursor-pointer"
                        value={selectedAnalysisId}
                        onChange={(e) => setSelectedAnalysisId(e.target.value)}
                      >
                        {project.analyses.map((a, idx) => (
                          <option key={a.id} value={a.id}>
                            Report {project.analyses.length - idx} ({new Date(a.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {activeAnalysis && (
                    <div className="space-y-6">
                      {/* 1. HERO SECTION — Top KPIs */}
                      <div className="bg-zinc-900/20 p-6 rounded-xl border border-zinc-900 space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                          <Activity className="h-4 w-4 text-indigo-500" />
                          Hero Performance KPIs (5-Day Window)
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                          {/* Net Profit per delivered order */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">Net Profit/Delivered</span>
                            <span className={`text-lg font-black mt-2 ${
                              activeAnalysis.creativeRanking.netProfitPerDeliveredOrder >= 0 ? "text-emerald-400" : "text-rose-500"
                            }`}>
                              ${activeAnalysis.creativeRanking.netProfitPerDeliveredOrder.toFixed(2)}
                            </span>
                          </div>

                          {/* 5-day total revenue */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">5-Day Revenue</span>
                            <span className="text-lg font-black mt-2 text-white">
                              ${activeAnalysis.creativeRanking.fiveDayRevenue.toFixed(2)}
                            </span>
                          </div>

                          {/* 5-day net profit */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">5-Day Net Profit</span>
                            <span className={`text-lg font-black mt-2 ${
                              activeAnalysis.creativeRanking.fiveDayNetProfit >= 0 ? "text-emerald-400" : "text-rose-500"
                            }`}>
                              ${activeAnalysis.creativeRanking.fiveDayNetProfit.toFixed(2)}
                            </span>
                          </div>

                          {/* Return rate */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">Return Rate</span>
                            <span className="text-lg font-black mt-2 text-rose-400">
                              {activeAnalysis.creativeRanking.returnRate.toFixed(1)}%
                            </span>
                          </div>

                          {/* Confirmation rate */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">Confirm Rate</span>
                            <span className="text-lg font-black mt-2 text-emerald-400">
                              {activeAnalysis.creativeRanking.confirmationRate.toFixed(1)}%
                            </span>
                          </div>

                          {/* Real ROAS */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">Real ROAS</span>
                            <span className="text-lg font-black mt-2 text-indigo-400">
                              {activeAnalysis.creativeRanking.realRoas.toFixed(2)}x
                            </span>
                          </div>

                          {/* Stock remaining estimate */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">Stock Est.</span>
                            <span className="text-lg font-black mt-2 text-zinc-300">
                              {activeAnalysis.creativeRanking.stockRemainingEstimate} units
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. CRITICAL ALERTS SECTION */}
                      <div className="bg-zinc-900/20 p-6 rounded-xl border border-zinc-900 space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                          Critical Media Alerts
                        </h4>
                        {activeAnalysis.fatigueWarnings.length === 0 ? (
                          <div className="text-zinc-500 text-xs py-2">
                            No critical alerts detected for this ad period.
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {activeAnalysis.fatigueWarnings.map((alert, idx) => (
                              <div
                                key={idx}
                                className={`p-4 rounded-lg border text-xs flex flex-col justify-between space-y-2 ${
                                  alert.severity === "RED"
                                    ? "bg-rose-500/5 border-rose-500/20"
                                    : "bg-amber-500/5 border-amber-500/20"
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        alert.severity === "RED"
                                          ? "bg-rose-500 text-white"
                                          : "bg-amber-500 text-black"
                                      }`}
                                    >
                                      {alert.severity} ALERT
                                    </span>
                                  </div>
                                  <p className="font-bold text-zinc-200 mt-1.5">{alert.finding}</p>
                                </div>
                                <p className="text-zinc-400 leading-relaxed pt-1.5 border-t border-zinc-900/60">
                                  <span className="font-semibold text-white">Action:</span> {alert.action}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. EXECUTIVE P&L WATERFALL & 4. OPERATIONAL FUNNEL */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* 3. EXECUTIVE P&L WATERFALL */}
                        <div className="bg-zinc-900/20 p-6 rounded-xl border border-zinc-900 space-y-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                              <DollarSign className="h-4 w-4 text-emerald-500" />
                              Executive P&L Waterfall (Per Delivered Order)
                            </h4>
                            <div className="space-y-2 mt-4 text-xs">
                              {/* Revenue */}
                              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                <span className="text-zinc-400">Revenue (Selling Price)</span>
                                <div className="font-bold text-zinc-200">
                                  ${activeAnalysis.optimizationActions.revenue.toFixed(2)}
                                  <span className="text-zinc-500 font-normal ml-2">({activeAnalysis.optimizationActions.percentages.revenuePercent.toFixed(1)}%)</span>
                                </div>
                              </div>
                              {/* COGS */}
                              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                <span className="text-zinc-400">Cost of Goods (COGS)</span>
                                <div className="font-bold text-zinc-200">
                                  -${activeAnalysis.optimizationActions.cogs.toFixed(2)}
                                  <span className="text-zinc-500 font-normal ml-2">({activeAnalysis.optimizationActions.percentages.cogsPercent.toFixed(1)}%)</span>
                                </div>
                              </div>
                              {/* International Freight */}
                              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                <span className="text-zinc-400">Intl Shipping Freight</span>
                                <div className="font-bold text-zinc-200">
                                  -${activeAnalysis.optimizationActions.internationalShipping.toFixed(2)}
                                  <span className="text-zinc-500 font-normal ml-2">({activeAnalysis.optimizationActions.percentages.internationalShippingPercent.toFixed(1)}%)</span>
                                </div>
                              </div>
                              {/* Gross Profit */}
                              <div className="flex justify-between items-center py-2 border-b border-zinc-900 font-semibold bg-zinc-950/20 px-2 rounded">
                                <span className="text-zinc-300">Gross Profit</span>
                                <div className="text-zinc-200">
                                  ${activeAnalysis.optimizationActions.grossProfit.toFixed(2)}
                                  <span className="text-zinc-500 font-normal ml-2">({activeAnalysis.optimizationActions.percentages.grossProfitPercent.toFixed(1)}%)</span>
                                </div>
                              </div>
                              {/* Delivery courier */}
                              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                <span className="text-zinc-400">Local COD Delivery Fee</span>
                                <div className="font-bold text-zinc-200">
                                  -${activeAnalysis.optimizationActions.codDeliveryFee.toFixed(2)}
                                  <span className="text-zinc-500 font-normal ml-2">({activeAnalysis.optimizationActions.percentages.codDeliveryFeePercent.toFixed(1)}%)</span>
                                </div>
                              </div>
                              {/* Return fee allocation */}
                              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                <span className="text-zinc-400">Returns Cost Allocation</span>
                                <div className="font-bold text-zinc-200">
                                  -${activeAnalysis.optimizationActions.returnCostAllocation.toFixed(2)}
                                  <span className="text-zinc-500 font-normal ml-2">({activeAnalysis.optimizationActions.percentages.returnCostAllocationPercent.toFixed(1)}%)</span>
                                </div>
                              </div>
                              {/* Ad spend */}
                              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                <span className="text-zinc-400">Ad Spend Allocation</span>
                                <div className="font-bold text-zinc-200">
                                  -${activeAnalysis.optimizationActions.adSpendAllocation.toFixed(2)}
                                  <span className="text-zinc-500 font-normal ml-2">({activeAnalysis.optimizationActions.percentages.adSpendAllocationPercent.toFixed(1)}%)</span>
                                </div>
                              </div>
                              {/* Net profit */}
                              <div className="flex justify-between items-center py-2 font-black bg-zinc-950 p-2 rounded">
                                <span className="text-emerald-400 uppercase">True Net Profit</span>
                                <div className={activeAnalysis.optimizationActions.netProfitPerOrder >= 0 ? "text-emerald-400" : "text-rose-500"}>
                                  ${activeAnalysis.optimizationActions.netProfitPerOrder.toFixed(2)}
                                  <span className="text-zinc-400 font-normal ml-2">({activeAnalysis.optimizationActions.percentages.netProfitPerOrderPercent.toFixed(1)}%)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4. OPERATIONAL FUNNEL */}
                        <div className="bg-zinc-900/20 p-6 rounded-xl border border-zinc-900 space-y-4">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                            COD Operational Funnel & Conversions
                          </h4>
                          <div className="space-y-3 mt-4">
                            {/* Total acquisitions */}
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-900 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-500">1. Total Orders Acquired</span>
                                <p className="font-black text-white text-sm mt-1">{activeAnalysis.losingAdSets.totalOrders} units</p>
                              </div>
                              <span className="text-[10px] font-bold bg-zinc-900 px-2 py-1 rounded text-zinc-400">Benchmark</span>
                            </div>

                            {/* Confirmed */}
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-900 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-500">2. Confirmed via Call Center</span>
                                <p className="font-black text-white text-sm mt-1">{activeAnalysis.losingAdSets.confirmedOrders} units</p>
                              </div>
                              <span className="text-xs font-black text-emerald-400">{activeAnalysis.losingAdSets.confirmedRate.toFixed(1)}%</span>
                            </div>

                            {/* Shipped */}
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-900 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-500">3. Shipped / Dispatched</span>
                                <p className="font-black text-white text-sm mt-1">{activeAnalysis.losingAdSets.shippedOrders} units</p>
                              </div>
                              <span className="text-xs font-semibold text-zinc-500">100.0% of conf.</span>
                            </div>

                            {/* Delivered */}
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-900 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-500">4. Delivered & Paid (Cash)</span>
                                <p className="font-black text-emerald-400 text-sm mt-1">{activeAnalysis.losingAdSets.deliveredOrders} units</p>
                              </div>
                              <span className="text-xs font-black text-emerald-400">{activeAnalysis.losingAdSets.deliveryRate.toFixed(1)}%</span>
                            </div>

                            {/* Returned */}
                            <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-900 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-500">5. Returned Parcel Failures</span>
                                <p className="font-black text-rose-500 text-sm mt-1">{activeAnalysis.losingAdSets.returnedOrders} units</p>
                              </div>
                              <span className="text-xs font-black text-rose-500">{activeAnalysis.losingAdSets.returnRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5. AD PERFORMANCE SECTION */}
                      <div className="bg-zinc-900/20 p-6 rounded-xl border border-zinc-900 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                            <Award className="h-4 w-4 text-indigo-500" />
                            Ad Set Performance & Recommendations
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">Campaign Health</span>
                            <div className="text-sm font-black text-white bg-indigo-950 border border-indigo-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                              {activeAnalysis.campaignHealthScore}
                              <span className="text-[9px] font-normal text-zinc-400">/100</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {activeAnalysis.winningAdSets.map((ws, i) => (
                            <div key={i} className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 space-y-3 text-xs">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="font-bold text-zinc-200 text-sm truncate max-w-[80%]">{ws.adSetName}</span>
                                <Badge className={
                                  ws.status === "SCALE"
                                    ? "bg-emerald-600 hover:bg-emerald-600 text-white font-bold"
                                    : ws.status === "OPTIMIZE"
                                    ? "bg-amber-600 hover:bg-amber-600 text-white font-bold"
                                    : "bg-rose-600 hover:bg-rose-600 text-white font-bold"
                                }>
                                  {ws.status}
                                </Badge>
                              </div>
                              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 text-zinc-400">
                                <div>Spend: <span className="font-bold text-white">${ws.spend.toFixed(2)}</span></div>
                                <div>Orders: <span className="font-bold text-white">{ws.orders}</span></div>
                                <div>CPP: <span className="font-bold text-white">${ws.cpp.toFixed(2)}</span></div>
                                <div>FB ROAS: <span className="font-bold text-white">{ws.roas.toFixed(2)}x</span></div>
                              </div>
                              <p className="text-zinc-400 pt-2 border-t border-zinc-900/60 leading-relaxed">
                                <span className="font-semibold text-white">AI Verdict:</span> {ws.recommendation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 6. BUSINESS INTELLIGENCE */}
                      <div className="bg-zinc-900/20 p-6 rounded-xl border border-zinc-900 space-y-4">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                          <DollarSign className="h-4 w-4 text-indigo-500" />
                          COD Business Intelligence Limits
                        </h4>
                        <div className="grid gap-6 md:grid-cols-3 text-xs">
                          {/* Limits */}
                          <div className="space-y-3">
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500 tracking-wider">Break-Even Limits</p>
                            <div className="space-y-2">
                              <div className="flex justify-between p-2.5 rounded bg-zinc-950 border border-zinc-900">
                                <span className="text-zinc-400">Break-even CPP:</span>
                                <span className="font-bold text-zinc-200">${activeAnalysis.businessIntel.breakEvenCpp.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between p-2.5 rounded bg-zinc-950 border border-zinc-900">
                                <span className="text-zinc-400">Break-even CPA (Leads):</span>
                                <span className="font-bold text-zinc-200">${activeAnalysis.businessIntel.breakEvenCpa.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Max budget */}
                          <div className="space-y-3">
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500 tracking-wider">Acquisition Capacity</p>
                            <div className="space-y-2">
                              <div className="flex justify-between p-2.5 rounded bg-zinc-950 border border-zinc-900">
                                <span className="text-zinc-400">Max Acceptable Spend/Order:</span>
                                <span className="font-bold text-zinc-200">${activeAnalysis.businessIntel.maxAcceptableAdSpendPerOrder.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Projected values */}
                          <div className="space-y-3">
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500 tracking-wider">Projections Run-rate</p>
                            <div className="space-y-2">
                              <div className="flex justify-between p-2.5 rounded bg-zinc-950 border border-zinc-900">
                                <span className="text-zinc-400">Projected Monthly (Current):</span>
                                <span className={`font-bold ${
                                  activeAnalysis.businessIntel.projectedMonthlyProfitCurrent >= 0 ? "text-emerald-400" : "text-rose-500"
                                }`}>
                                  ${activeAnalysis.businessIntel.projectedMonthlyProfitCurrent.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between p-2.5 rounded bg-zinc-950 border border-zinc-900">
                                <span className="text-zinc-400">Projected Monthly (Optimized):</span>
                                <span className="font-bold text-emerald-400">
                                  ${activeAnalysis.businessIntel.projectedMonthlyProfitOptimized.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 7. AI ACTION PLAN */}
                      <div className="bg-zinc-900/20 p-6 rounded-xl border border-zinc-900 space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-indigo-500" />
                            AI Action Plan & Macro Decision
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-zinc-500 font-semibold">Overall Decision</span>
                            {getDecisionBadge(activeAnalysis.actionPlan.overallDecision)}
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3 text-xs">
                          {/* Priority 1 (do today) */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 space-y-3">
                            <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Priority 1 (Do Today)</span>
                            <ul className="list-disc pl-4 space-y-2 text-zinc-300 leading-relaxed">
                              {activeAnalysis.actionPlan.priority1.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Priority 2 (do this week) */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 space-y-3">
                            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Priority 2 (Do This Week)</span>
                            <ul className="list-disc pl-4 space-y-2 text-zinc-300 leading-relaxed">
                              {activeAnalysis.actionPlan.priority2.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Priority 3 (monitor) */}
                          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 space-y-3">
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Priority 3 (Monitor closely)</span>
                            <ul className="list-disc pl-4 space-y-2 text-zinc-300 leading-relaxed">
                              {activeAnalysis.actionPlan.priority3.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-900 text-xs space-y-1 mt-4">
                          <p className="font-extrabold text-zinc-300 uppercase tracking-wider text-[10px]">Macro Rationale & Decision Logic</p>
                          <p className="text-zinc-400 leading-relaxed">{activeAnalysis.actionPlan.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
