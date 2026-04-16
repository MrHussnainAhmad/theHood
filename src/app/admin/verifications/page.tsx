"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

interface VerificationItem {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  companyName: string | null;
  companyRegistrationNumber: string | null;
  companyTaxId: string | null;
  companyAddress: string | null;
  companyContactName: string | null;
  companyContactPhone: string | null;
  companyVerificationFiles: string[];
  companyVerificationStatus: string;
  createdAt: string;
}

export default function AdminVerificationsPage() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectReasonByUser, setRejectReasonByUser] = useState<Record<string, string>>({});

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/admin/verifications");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch verifications");
      setItems(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch verifications";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateVerification = async (item: VerificationItem, status: "VERIFIED" | "REJECTED") => {
    const reason = (rejectReasonByUser[item.id] || "").trim();
    if (status === "REJECTED" && !reason) {
      toast.error("Rejection reason is required");
      return;
    }

    const response = await fetch(`/api/admin/users/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyVerificationStatus: status,
        companyVerificationReviewNote: status === "REJECTED" ? reason : "Verified by admin",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Failed to update verification");
      return;
    }
    toast.success(status === "VERIFIED" ? "Verification approved" : "Verification rejected");
    setItems((prev) => prev.filter((x) => x.id !== item.id));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Verifications</h1>
      <p className="text-neutral-600 mb-6">Pending company verification submissions.</p>

      {isLoading ? (
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600" />
      ) : items.length === 0 ? (
        <div className="card text-center text-neutral-600">No pending verification alerts.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-neutral-900">{item.name || "Unnamed"}</p>
                  <p className="text-neutral-600">{item.email}</p>
                  {item.companyName && <p>Company: {item.companyName}</p>}
                  {item.companyRegistrationNumber && <p>Reg#: {item.companyRegistrationNumber}</p>}
                  {item.companyTaxId && <p>Tax ID: {item.companyTaxId}</p>}
                  {item.companyAddress && <p>Address: {item.companyAddress}</p>}
                  {item.companyContactName && <p>Contact: {item.companyContactName}</p>}
                  {item.companyContactPhone && <p>Phone: {item.companyContactPhone}</p>}
                  <div className="pt-1 flex flex-wrap gap-2">
                    {item.companyVerificationFiles?.map((file, idx) => (
                      <a
                        key={idx}
                        href={file}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-700 text-xs"
                      >
                        File {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:max-w-[420px]">
                  <Button size="sm" onClick={() => updateVerification(item, "VERIFIED")}>
                    Verify
                  </Button>
                  <Input
                    placeholder="Reason for rejection"
                    value={rejectReasonByUser[item.id] || ""}
                    onChange={(e) =>
                      setRejectReasonByUser((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="min-w-[220px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200"
                    onClick={() => updateVerification(item, "REJECTED")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

