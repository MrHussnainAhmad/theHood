"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Link from "next/link";

interface VerificationData {
  providerEmployeeRange: string | null;
  companyVerificationStatus: string;
  companyVerificationReviewNote: string | null;
  companyName: string | null;
  companyRegistrationNumber: string | null;
  companyTaxId: string | null;
  companyAddress: string | null;
  companyContactName: string | null;
  companyContactPhone: string | null;
  companyVerificationFiles: string[];
}

export default function ProviderVerificationPage() {
  const [data, setData] = useState<VerificationData | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    companyRegistrationNumber: "",
    companyTaxId: "",
    companyAddress: "",
    companyContactName: "",
    companyContactPhone: "",
    files: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    const response = await fetch("/api/provider/verification");
    const json = await response.json();
    if (!response.ok) {
      toast.error(json.error || "Failed to fetch verification");
      return;
    }
    setData(json);
    setForm({
      companyName: json.companyName || "",
      companyRegistrationNumber: json.companyRegistrationNumber || "",
      companyTaxId: json.companyTaxId || "",
      companyAddress: json.companyAddress || "",
      companyContactName: json.companyContactName || "",
      companyContactPhone: json.companyContactPhone || "",
      files: Array.isArray(json.companyVerificationFiles) ? json.companyVerificationFiles : [],
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const readers = Array.from(selected).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers)
      .then((base64s) =>
        setForm((prev) => ({
          ...prev,
          files: [...prev.files, ...base64s].slice(0, 5),
        }))
      )
      .catch(() => toast.error("Failed to read one or more files"));
  };

  const submit = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/provider/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to submit document");
      toast.success("Company verification submitted");
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit document";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const locked =
    data?.companyVerificationStatus === "SUBMITTED" ||
    data?.companyVerificationStatus === "VERIFIED";

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Company Verification</h1>
        <p className="text-neutral-600 mb-8">Required only for providers with 10+ employees.</p>
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          It can take 2-3 business days to get verified. Meanwhile, you can create services.
          <div className="mt-2">
            <Link href="/provider/services" className="underline font-medium">Go to Create Services</Link>
          </div>
        </div>

        {!data ? (
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        ) : data.providerEmployeeRange !== "10+" ? (
          <div className="card text-neutral-700">
            Your provider account is not marked as company (10+), so verification is not required.
          </div>
        ) : (
          <div className="card space-y-4">
            <div>
              <p className="text-sm text-neutral-500">Current Status</p>
              <p className="text-lg font-semibold text-neutral-900">{data.companyVerificationStatus}</p>
              {data.companyVerificationStatus === "REJECTED" && data.companyVerificationReviewNote && (
                <p className="mt-2 text-sm text-red-700">
                  <span className="font-semibold">Platform:</span> {data.companyVerificationReviewNote}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="input-field"
                placeholder="Acme Services Pvt Ltd"
                disabled={locked}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={form.companyRegistrationNumber}
                onChange={(e) => setForm({ ...form, companyRegistrationNumber: e.target.value })}
                className="input-field"
                placeholder="Company Registration Number"
                disabled={locked}
              />
              <input
                type="text"
                value={form.companyTaxId}
                onChange={(e) => setForm({ ...form, companyTaxId: e.target.value })}
                className="input-field"
                placeholder="Tax ID / VAT / NTN"
                disabled={locked}
              />
            </div>
            <input
              type="text"
              value={form.companyAddress}
              onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
              className="input-field"
              placeholder="Business Address"
              disabled={locked}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={form.companyContactName}
                onChange={(e) => setForm({ ...form, companyContactName: e.target.value })}
                className="input-field"
                placeholder="Authorized Contact Person"
                disabled={locked}
              />
              <input
                type="text"
                value={form.companyContactPhone}
                onChange={(e) => setForm({ ...form, companyContactPhone: e.target.value })}
                className="input-field"
                placeholder="Contact Phone"
                disabled={locked}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Upload verification files (up to 5)
              </label>
              <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFiles} disabled={locked} />
              <p className="text-xs text-neutral-500 mt-2">{form.files.length} file(s) selected</p>
            </div>
            <Button onClick={submit} isLoading={isSaving} disabled={locked}>
              {data.companyVerificationStatus === "REJECTED" ? "Resubmit Verification" : "Submit Verification"}
            </Button>
            {locked && (
              <p className="text-xs text-neutral-500">
                Submission is locked while status is {data.companyVerificationStatus}.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
