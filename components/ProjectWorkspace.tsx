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
    trueProfit: number;
    netMargin: number;
    breakEvenCpa: number;
    breakEvenCpp: number;
    maxAcceptableCpc: number;
    maxAcceptableCpm: number;
    projectedMonthlyProfit: number;
  };
  creativeRanking: Array<{
    adName: string;
    rank: number;
    ctr: number;
    spend: number;
    orders: number;
    status: "WINNER" | "AVERAGE" | "LOSER";
    insights: string;
  }>;
  winningAdSets: Array<{
    adSetName: string;
    spend: number;
    orders: number;
    cpp: number;
    roas: number;
    reason: string;
  }>;
  losingAdSets: Array<{
    adSetName: string;
    spend: number;
    orders: number;
    cpp: number;
    roas: number;
    issue: string;
    recommendation: string;
  }>;
  fatigueWarnings: Array<{
    targetName: string;
    frequency: number;
    warningType: string;
    remedy: string;
  }>;
  optimizationActions: Array<{
    action: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    rationale: string;
  }>;
  actionPlan: {
    immediate: string[];
    monitor: string[];
    scaling: string[];
    risk: string[];
    nextBudget: number;
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
                      {/* KPI Cards Row */}
                      <div className="grid gap-6 md:grid-cols-4">
                        {/* Health Score */}
                        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-900 flex flex-col justify-between relative overflow-hidden">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Health Score</span>
                            <div className="text-3xl font-black mt-2 text-white">
                              {activeAnalysis.campaignHealthScore}
                              <span className="text-xs font-normal text-zinc-500">/100</span>
                            </div>
                          </div>
                          <div className="h-1 bg-zinc-950 rounded-full mt-6 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${activeAnalysis.campaignHealthScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Overall Decision */}
                        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-900 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Macro Decision</span>
                            <div className="mt-2.5">
                              {getDecisionBadge(activeAnalysis.overallDecision)}
                            </div>
                          </div>
                          <span className="text-[9px] text-zinc-500 uppercase font-semibold mt-4">
                            Confidence: {activeAnalysis.confidenceScore}%
                          </span>
                        </div>

                        {/* True Net Profit */}
                        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-900 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-500">True Net Profit</span>
                            <div className={`text-2xl font-black mt-2 ${
                              activeAnalysis.businessIntel.trueProfit >= 0 ? "text-emerald-400" : "text-rose-500"
                            }`}>
                              ${activeAnalysis.businessIntel.trueProfit.toFixed(2)}
                            </div>
                          </div>
                          <span className="text-[9px] text-zinc-400 uppercase font-semibold mt-4">
                            Margin: {activeAnalysis.businessIntel.netMargin.toFixed(1)}%
                          </span>
                        </div>

                        {/* Monthly Profit Projection */}
                        <div className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-900 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Projected Runrate</span>
                            <div className={`text-2xl font-black mt-2 ${
                              activeAnalysis.businessIntel.projectedMonthlyProfit >= 0 ? "text-emerald-400" : "text-rose-500"
                            }`}>
                              ${activeAnalysis.businessIntel.projectedMonthlyProfit.toFixed(2)}
                            </div>
                          </div>
                          <span className="text-[9px] text-zinc-500 uppercase font-semibold mt-4">
                            Per month estimation
                          </span>
                        </div>
                      </div>

                      {/* COD Business Intelligence Math */}
                      <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-6">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                          <DollarSign className="h-4 w-4" />
                          COD Economics vs Facebook metrics (The Truth)
                        </h4>

                        {activeAnalysis.csvUpload && (
                          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-xs">
                            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 space-y-1">
                              <p className="text-zinc-500">Facebook Ad Spend</p>
                              <p className="text-lg font-bold">${activeAnalysis.csvUpload.kpiSummary.spend.toFixed(2)}</p>
                            </div>
                            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 space-y-1">
                              <p className="text-zinc-500">Facebook Purchases</p>
                              <p className="text-lg font-bold">{activeAnalysis.csvUpload.kpiSummary.orders}</p>
                            </div>
                            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 space-y-1">
                              <p className="text-zinc-500">Facebook CPC</p>
                              <p className="text-lg font-bold">${activeAnalysis.csvUpload.kpiSummary.cpc.toFixed(2)}</p>
                            </div>
                            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 space-y-1">
                              <p className="text-zinc-500">Facebook CPM</p>
                              <p className="text-lg font-bold">${activeAnalysis.csvUpload.kpiSummary.cpm.toFixed(2)}</p>
                            </div>
                          </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-3 pt-2 text-xs">
                          {/* Break-evens */}
                          <div className="space-y-3">
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500 tracking-wider">Break-Even Limits</p>
                            <div className="space-y-2">
                              <div className="flex justify-between p-2 rounded bg-zinc-950 border border-zinc-900">
                                <span className="text-zinc-400">Break-even CPP:</span>
                                <span className="font-bold text-zinc-200">${activeAnalysis.businessIntel.breakEvenCpp.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between p-2 rounded bg-zinc-950 border border-zinc-900">
                                <span className="text-zinc-400">Break-even CPA (Leads):</span>
                                <span className="font-bold text-zinc-200">${activeAnalysis.businessIntel.breakEvenCpa.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Max Acceptable Costs */}
                          <div className="space-y-3">
                            <p className="uppercase font-extrabold text-[10px] text-zinc-500 tracking-wider">Max Acceptable Costs</p>
                            <div className="space-y-2">
                              <div className="flex justify-between p-2 rounded bg-zinc-950 border border-zinc-900">
                                <span className="text-zinc-400">Max Acceptable CPC:</span>
                                <span className="font-bold text-zinc-200">${activeAnalysis.businessIntel.maxAcceptableCpc.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between p-2 rounded bg-zinc-950 border border-zinc-900">
                                <span className="text-zinc-400">Max Acceptable CPM:</span>
                                <span className="font-bold text-zinc-200">${activeAnalysis.businessIntel.maxAcceptableCpm.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Projections info */}
                          <div className="p-4 rounded-lg bg-indigo-600/5 border border-indigo-500/10 space-y-2">
                            <h5 className="font-extrabold text-indigo-400 uppercase tracking-wider text-[10px]">Logistics Correction Notice</h5>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                              These economic calculations include local courier pricing, outbound logistics delivery drop-off success, warehouse order confirmation parameters, and courier return penalties.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Creative rankings, Optimization Engine */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Optimization Engine */}
                        <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-4">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                            <Activity className="h-4 w-4 text-indigo-500" />
                            AI Optimization Actions
                          </h4>

                          <div className="space-y-3">
                            {activeAnalysis.optimizationActions.map((opt, idx) => (
                              <div key={idx} className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-xs text-white">{opt.action}</span>
                                  <Badge className={
                                    opt.priority === "HIGH" ? "bg-rose-500 text-white" : opt.priority === "MEDIUM" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                                  }>
                                    {opt.priority}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-zinc-400">{opt.rationale}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Fatigue warnings */}
                        <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-4">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                            Ad Fatigue & Creative wear Alerts
                          </h4>

                          {activeAnalysis.fatigueWarnings.length === 0 ? (
                            <div className="flex items-center justify-center p-8 text-zinc-500 text-xs font-semibold">
                              All clear! No ad frequency fatigue warnings.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {activeAnalysis.fatigueWarnings.map((w, idx) => (
                                <div key={idx} className="p-3 bg-rose-500/5 rounded-lg border border-rose-500/10 space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-xs text-rose-400 truncate max-w-[70%]">{w.targetName}</span>
                                    <Badge variant="outline" className="text-[9px] uppercase border-rose-500/40 text-rose-400">
                                      Freq: {w.frequency.toFixed(1)}x
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase text-[9px]">{w.warningType}</p>
                                  <p className="text-[11px] text-zinc-300"><strong className="text-zinc-500">Fix:</strong> {w.remedy}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Creative rankings, Ad Set performance lists */}
                      <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-6">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                          <Award className="h-4 w-4 text-indigo-500" />
                          Creative Rankings & Ad Set Analysis
                        </h4>

                        {/* Creative Performance Rankings */}
                        <div className="space-y-3">
                          <p className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">Creative Performance</p>
                          <div className="space-y-2">
                            {activeAnalysis.creativeRanking.map((creative) => (
                              <div key={creative.adName} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-950 p-4 rounded border border-zinc-900 gap-4 text-xs">
                                <div className="space-y-1 max-w-[70%]">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-white">#{creative.rank} {creative.adName}</span>
                                    <Badge className={
                                      creative.status === "WINNER" ? "bg-emerald-600" : creative.status === "LOSER" ? "bg-rose-500" : "bg-zinc-700"
                                    }>
                                      {creative.status}
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-zinc-400 italic">{creative.insights}</p>
                                </div>
                                <div className="flex gap-4 font-semibold text-zinc-300">
                                  <span>Spend: <strong className="text-white">${creative.spend.toFixed(0)}</strong></span>
                                  <span>CTR: <strong className="text-white">{creative.ctr.toFixed(2)}%</strong></span>
                                  <span>Facebook Orders: <strong className="text-white">{creative.orders}</strong></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ad Sets Analysis Winners vs Losers */}
                        <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-zinc-900/80">
                          {/* Winners */}
                          <div className="space-y-3">
                            <p className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">Winning Targetings (Scale)</p>
                            {activeAnalysis.winningAdSets.length === 0 ? (
                              <p className="text-xs text-zinc-500 italic">No ad sets flagged as clear scaling winners yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {activeAnalysis.winningAdSets.map((ws, i) => (
                                  <div key={i} className="p-3 bg-emerald-500/5 rounded border border-emerald-500/10 space-y-1.5 text-xs">
                                    <p className="font-bold text-white truncate">{ws.adSetName}</p>
                                    <div className="flex justify-between text-[10px] text-zinc-400">
                                      <span>Spent: ${ws.spend.toFixed(0)}</span>
                                      <span>Orders: {ws.orders}</span>
                                      <span>CPP: ${ws.cpp.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400"><strong className="text-emerald-400">Scale Plan:</strong> {ws.reason}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Losers */}
                          <div className="space-y-3">
                            <p className="text-xs uppercase font-extrabold text-rose-400 tracking-wider">Losing Targetings (Pause)</p>
                            {activeAnalysis.losingAdSets.length === 0 ? (
                              <p className="text-xs text-zinc-500 italic">No ad sets flagged as losing bottlenecks.</p>
                            ) : (
                              <div className="space-y-2">
                                {activeAnalysis.losingAdSets.map((ls, i) => (
                                  <div key={i} className="p-3 bg-rose-500/5 rounded border border-rose-500/10 space-y-1.5 text-xs">
                                    <p className="font-bold text-white truncate">{ls.adSetName}</p>
                                    <div className="flex justify-between text-[10px] text-zinc-400">
                                      <span>Spent: ${ls.spend.toFixed(0)}</span>
                                      <span>Orders: {ls.orders}</span>
                                      <span>CPP: ${ls.cpp.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[11px] text-rose-400 font-bold uppercase text-[9px]">Issue: {ls.issue}</p>
                                    <p className="text-[11px] text-zinc-400"><strong className="text-white">Recommendation:</strong> {ls.recommendation}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Strategic Action Plan checklist & daily budget */}
                      <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-900 space-y-6">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2 pb-2 border-b border-zinc-900">
                          <Brain className="h-4 w-4" />
                          AI Growth Blueprint & Action Plan
                        </h4>

                        <div className="grid gap-6 md:grid-cols-2 text-xs">
                          {/* Immediate 24h & monitor */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h5 className="font-extrabold text-rose-400 uppercase tracking-wider text-[10px]">1. Immediate Operational Action (24h)</h5>
                              <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                                {activeAnalysis.actionPlan.immediate.map((item, idx) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <h5 className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px]">2. Monitor metrics closely (3-7 Days)</h5>
                              <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                                {activeAnalysis.actionPlan.monitor.map((item, idx) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                          </div>

                          {/* Scaling & risks */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h5 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[10px]">3. Horizontal/Vertical Scaling blueprint</h5>
                              <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                                {activeAnalysis.actionPlan.scaling.map((item, idx) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <h5 className="font-extrabold text-indigo-400 uppercase tracking-wider text-[10px]">4. Logistical & account operational risks</h5>
                              <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                                {activeAnalysis.actionPlan.risk.map((item, idx) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-950 p-4 rounded-lg border border-zinc-900 gap-4 mt-4">
                          <div className="text-xs">
                            <p className="font-extrabold text-zinc-300 uppercase tracking-wider text-[10px]">Recommended Testing Daily Budget</p>
                            <p className="text-zinc-500">AI recommended media spend scaling limit for the next cycle.</p>
                          </div>
                          <div className="text-2xl font-black text-indigo-400">
                            ${activeAnalysis.actionPlan.nextBudget.toFixed(2)}
                            <span className="text-xs font-normal text-zinc-500">/day</span>
                          </div>
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
