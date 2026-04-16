"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface ProviderPayoutGroup {
  providerId: string;
  providerName: string;
  providerEmail: string;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  totalPayable: number;
  orderCount: number;
  orders: {
    id: string;
    serviceName: string;
    amount: number;
    platformFee: number;
    providerPayoutAmount: number;
    completedDate: string | null;
  }[];
}

export default function AdminPayoutsPage() {
  const [groups, setGroups] = useState<ProviderPayoutGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [releasingId, setReleasingId] = useState("");

  const fetchPayouts = async () => {
    try {
      const response = await fetch("/api/admin/payouts");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch payouts");
      setGroups(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch payouts";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const releaseProviderPayout = async (group: ProviderPayoutGroup) => {
    setReleasingId(group.providerId);
    try {
      const response = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: group.orders.map((o) => o.id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to release payout");
      toast.success(`Released payout for ${data.releasedOrders} orders`);
      fetchPayouts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to release payout";
      toast.error(message);
    } finally {
      setReleasingId("");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Provider Payouts</h1>
        <p className="text-neutral-600">Release completed and paid order amounts to providers.</p>
      </div>

      {isLoading ? (
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      ) : groups.length === 0 ? (
        <div className="card text-center text-neutral-600">No payouts ready right now.</div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.providerId} className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{group.providerName}</h2>
                  <p className="text-sm text-neutral-600">{group.providerEmail}</p>
                  <p className="text-xs mt-1">
                    {group.stripeOnboarded
                      ? "Stripe connected"
                      : "Stripe onboarding incomplete"}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {group.orderCount} order{group.orderCount > 1 ? "s" : ""} ready
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Total Payable</p>
                  <p className="text-3xl font-bold text-emerald-600">${group.totalPayable.toFixed(2)}</p>
                  <Button
                    className="mt-2"
                    size="sm"
                    onClick={() => releaseProviderPayout(group)}
                    isLoading={releasingId === group.providerId}
                    disabled={!group.stripeOnboarded || !group.stripeAccountId}
                  >
                    Release Payout
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-neutral-600">
                      <th className="py-2 pr-3">Order</th>
                      <th className="py-2 pr-3">Service</th>
                      <th className="py-2 pr-3">Gross</th>
                      <th className="py-2 pr-3">Platform Fee</th>
                      <th className="py-2 pr-3">Provider Gets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.orders.map((order) => (
                      <tr key={order.id} className="border-b border-neutral-100">
                        <td className="py-2 pr-3">#{order.id.slice(-8)}</td>
                        <td className="py-2 pr-3">{order.serviceName}</td>
                        <td className="py-2 pr-3">${order.amount.toFixed(2)}</td>
                        <td className="py-2 pr-3">${order.platformFee.toFixed(2)}</td>
                        <td className="py-2 pr-3 font-semibold text-emerald-700">
                          ${order.providerPayoutAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
