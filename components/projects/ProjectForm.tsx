"use client";

import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectResponse } from "@/lib/validators";
import {
  imageContentTypes,
  maxProjectImageSize,
  productTypes,
  projectCreateSchema,
} from "@/lib/validators";
import type { ProjectDetailResponse, ProjectImageUploadResponse } from "@/types/api";

type ProjectFormProps = {
  project?: ProjectResponse;
};

type FormState = {
  name: string;
  productName: string;
  productUrl: string;
  imageUrl: string;
  productCost: string;
  sellingPrice: string;
  shippingCost: string;
  serviceFee: string;
  desiredProfit: string;
  targetCountry: string;
  productType: string;
};

const emptyFormState: FormState = {
  name: "",
  productName: "",
  productUrl: "",
  imageUrl: "",
  productCost: "",
  sellingPrice: "",
  shippingCost: "0",
  serviceFee: "0",
  desiredProfit: "",
  targetCountry: "",
  productType: "",
};

function initialState(project?: ProjectResponse): FormState {
  if (!project) {
    return emptyFormState;
  }

  return {
    name: project.name,
    productName: project.productName,
    productUrl: project.productUrl ?? "",
    imageUrl: project.imageUrl ?? "",
    productCost: String(project.productCost),
    sellingPrice: String(project.sellingPrice),
    shippingCost: String(project.shippingCost),
    serviceFee: String(project.serviceFee),
    desiredProfit: String(project.desiredProfit),
    targetCountry: project.targetCountry ?? "",
    productType: project.productType ?? "",
  };
}

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(project));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectImage(file: File | null) {
    setError(null);

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!imageContentTypes.includes(file.type as (typeof imageContentTypes)[number])) {
      setError("Only JPG, PNG, and WEBP images are supported.");
      return;
    }

    if (file.size > maxProjectImageSize) {
      setError("Project image must be 5MB or smaller.");
      return;
    }

    setImageFile(file);
  }

  async function uploadImage() {
    if (!imageFile) {
      return form.imageUrl || undefined;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch("/api/uploads/project-image", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as ProjectImageUploadResponse & {
      message?: string;
    };

    if (!response.ok) {
      throw new Error(payload.message ?? "Unable to upload image.");
    }

    return payload.imageUrl;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const imageUrl = await uploadImage();
      const payload = {
        name: form.name,
        productName: form.productName,
        productUrl: optionalValue(form.productUrl),
        imageUrl,
        productCost: form.productCost,
        sellingPrice: form.sellingPrice,
        shippingCost: form.shippingCost || "0",
        serviceFee: form.serviceFee || "0",
        desiredProfit: form.desiredProfit,
        targetCountry: optionalValue(form.targetCountry),
        productType: optionalValue(form.productType),
      };

      const parsed = projectCreateSchema.safeParse(payload);

      if (!parsed.success) {
        const firstError = Object.values(parsed.error.flatten().fieldErrors)
          .flat()
          .find(Boolean);
        setError(firstError ?? "Please check the project fields.");
        return;
      }

      const response = await fetch(
        project ? `/api/projects/${project.id}` : "/api/projects",
        {
          method: project ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed.data),
        },
      );

      const result = (await response.json()) as ProjectDetailResponse & {
        message?: string;
      };

      if (!response.ok) {
        setError(result.message ?? "Unable to save project.");
        return;
      }

      router.push(
        (project ? `/projects/${project.id}` : `/projects/${result.project.id}`) as Route,
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save project.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
        <Button disabled={isSaving} type="submit">
          <Save className="mr-2 h-4 w-4" aria-hidden="true" />
          {isSaving ? "Saving..." : "Save project"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Project Name">
            <Input
              onChange={(event) => updateField("name", event.target.value)}
              required
              value={form.name}
            />
          </Field>
          <Field label="Product Name">
            <Input
              onChange={(event) => updateField("productName", event.target.value)}
              required
              value={form.productName}
            />
          </Field>
          <Field label="Product URL">
            <Input
              onChange={(event) => updateField("productUrl", event.target.value)}
              placeholder="https://example.com/product"
              type="url"
              value={form.productUrl}
            />
          </Field>
          <Field label="Target Country">
            <Input
              onChange={(event) =>
                updateField("targetCountry", event.target.value)
              }
              placeholder="Nigeria, Ghana, Morocco..."
              value={form.targetCountry}
            />
          </Field>
          <Field label="Product Type">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(event) => updateField("productType", event.target.value)}
              value={form.productType}
            >
              <option value="">Select type</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Product Image Upload">
            <div className="space-y-3">
              <Input
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  selectImage(event.target.files?.item(0) ?? null)
                }
                type="file"
              />
              {form.imageUrl || imageFile ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  {imageFile ? imageFile.name : "Current image saved"}
                </div>
              ) : null}
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unit economics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Product Cost">
            <Input
              min="0"
              onChange={(event) => updateField("productCost", event.target.value)}
              required
              step="0.01"
              type="number"
              value={form.productCost}
            />
          </Field>
          <Field label="Selling Price">
            <Input
              min="0"
              onChange={(event) => updateField("sellingPrice", event.target.value)}
              required
              step="0.01"
              type="number"
              value={form.sellingPrice}
            />
          </Field>
          <Field label="Shipping Cost">
            <Input
              min="0"
              onChange={(event) => updateField("shippingCost", event.target.value)}
              step="0.01"
              type="number"
              value={form.shippingCost}
            />
          </Field>
          <Field label="Service Fee">
            <Input
              min="0"
              onChange={(event) => updateField("serviceFee", event.target.value)}
              step="0.01"
              type="number"
              value={form.serviceFee}
            />
          </Field>
          <Field label="Desired Profit %">
            <Input
              max="100"
              min="0"
              onChange={(event) => updateField("desiredProfit", event.target.value)}
              required
              step="0.01"
              type="number"
              value={form.desiredProfit}
            />
          </Field>
        </CardContent>
      </Card>
    </form>
  );
}
