"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Folder, ExternalLink, DollarSign, Loader2, Sparkles, X } from "lucide-react";

type Project = {
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
};

type ProjectListProps = {
  initialProjects: Project[];
};

export function ProjectList({ initialProjects }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [productCost, setProductCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [serviceFee, setServiceFee] = useState("");
  const [targetCountry, setTargetCountry] = useState("Nigeria");
  const [productUrl, setProductUrl] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          productName,
          productCost: parseFloat(productCost),
          sellingPrice: parseFloat(sellingPrice),
          shippingCost: parseFloat(shippingCost),
          serviceFee: parseFloat(serviceFee),
          targetCountry,
          productUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      setProjects((prev) => [
        {
          ...data.project,
          productCost: Number(data.project.productCost),
          sellingPrice: Number(data.project.sellingPrice),
          shippingCost: Number(data.project.shippingCost),
          serviceFee: Number(data.project.serviceFee),
        },
        ...prev,
      ]);
      setIsOpen(false);
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this project? This will erase all research and ad intelligence data permanently.")) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete project");
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeletingId(null);
    }
  };

  const resetForm = () => {
    setName("");
    setProductName("");
    setProductCost("");
    setSellingPrice("");
    setShippingCost("");
    setServiceFee("");
    setTargetCountry("Nigeria");
    setProductUrl("");
  };

  return (
    <div className="space-y-8">
      {/* Upper Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/40 p-6 rounded-xl border border-zinc-900">
        <div>
          <h2 className="text-xl font-bold tracking-tight">COD Campaigns & Projects</h2>
          <p className="text-sm text-zinc-400">Launch AI research & ad audits for your e-commerce inventory.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
          <Folder className="h-10 w-10 text-zinc-600 mb-3 animate-pulse" />
          <h3 className="font-bold text-sm text-zinc-300">No projects yet</h3>
          <p className="text-xs text-zinc-500 max-w-xs mt-1 mb-5">
            Create your first project configuration to run automated product analysis and COD campaign mapping.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-xs font-bold text-indigo-500 hover:text-indigo-400"
          >
            Create your first project →
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/[0.02] transition-all relative overflow-hidden"
            >
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start">
                <div className="space-y-1 max-w-[80%]">
                  <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                    {project.targetCountry}
                  </span>
                  <h3 className="font-bold text-base truncate text-white group-hover:text-indigo-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate">
                    Product: {project.productName}
                  </p>
                </div>

                <button
                  onClick={(e) => handleDelete(project.id, e)}
                  disabled={isDeletingId === project.id}
                  className="text-zinc-600 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                >
                  {isDeletingId === project.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Economic KPI Mini Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-zinc-900/80 text-xs">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Selling Price</p>
                  <p className="font-bold text-zinc-300 flex items-center">
                    <DollarSign className="h-3.5 w-3.5 text-indigo-500 mr-0.5" />
                    {project.sellingPrice.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Product Cost</p>
                  <p className="font-bold text-zinc-300 flex items-center">
                    <DollarSign className="h-3.5 w-3.5 text-indigo-500 mr-0.5" />
                    {project.productCost.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Bottom date */}
              <div className="flex justify-between items-center mt-6 text-[10px] text-zinc-500">
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors font-semibold">
                  Open Terminal <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Creation Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Configure New COD Project
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electric Kettle Launch"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pro Kettle V2"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Product Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 5.50"
                    value={productCost}
                    onChange={(e) => setProductCost(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 29.99"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Outbound Shipping Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 3.50"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Service Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1.20"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Target Country</label>
                  <select
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Egypt">Egypt</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Ivory Coast">Ivory Coast</option>
                    <option value="Senegal">Senegal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Supplier/Competitor URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://aliexpress.com/..."
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
