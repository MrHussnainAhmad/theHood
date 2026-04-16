"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface EarningOrder {
  id: string;
  status: string;
  payoutStatus: string;
  payoutReleasedAt: string | null;
  amount: number | null;
  platformFee: number | null;
  providerPayoutAmount: number | null;
  createdAt: string;
  service: { name: string };
  user: { name: string | null; email: string };
}

interface EarningsResponse {
  summary: {
    total: number;
    paid: number;
    ready: number;
    pending: number;
  };
  orders: EarningOrder[];
}

interface ConnectStatus {
  connected: boolean;
  onboarded: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  accountId?: string;
}

export default function ProviderEarningsPage() {
  const [data, setData] = useState<EarningsResponse | null>(null);
  const [connect, setConnect] = useState<ConnectStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    const readJsonSafe = async (response: Response) => {
      const text = await response.text();
      if (!text) return {};
      try {
        return JSON.parse(text) as Record<string, unknown>;
      } catch {
        return {};
      }
    };
    const getErrorMessage = (json: Record<string, unknown>, fallback: string) => {
      return typeof json.error === "string" && json.error.trim() ? json.error : fallback;
    };

    const fetchEarnings = async () => {
      try {
        const response = await fetch("/api/provider/earnings");
        const json = await readJsonSafe(response);
        if (!response.ok) throw new Error(getErrorMessage(json, "Failed to fetch earnings"));
        setData(json as unknown as EarningsResponse);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch earnings";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchConnect = async () => {
      try {
        const response = await fetch("/api/provider/connect/status");
        const json = await readJsonSafe(response);
        if (!response.ok) throw new Error(getErrorMessage(json, "Failed to fetch connect status"));
        setConnect(json as unknown as ConnectStatus);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch connect status";
        toast.error(message);
      }
    };
    fetchEarnings();
    fetchConnect();
  }, []);

  const startOnboarding = async () => {
    setIsOnboarding(true);
    try {
      const response = await fetch("/api/provider/connect/onboard", { method: "POST" });
      const text = await response.text();
      const json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      if (!response.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to start onboarding");
      if (typeof json.url !== "string" || !json.url) {
        throw new Error("Stripe onboarding URL was not returned");
      }
      window.location.href = json.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to start onboarding";
      toast.error(message);
      setIsOnboarding(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Earnings</h1>
        <p className="text-neutral-600 mb-8">Track what you have earned and what admin has released.</p>

        <div className="card mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-neutral-500">Stripe Connect</p>
              <p className="font-semibold text-neutral-900">
                {connect?.onboarded ? "Connected for payouts" : "Complete onboarding to receive payouts"}
              </p>
              {connect?.connected && (
                <p className="text-xs text-neutral-500 mt-1">
                  Account: {connect.accountId}
                </p>
              )}
            </div>
            <Button onClick={startOnboarding} isLoading={isOnboarding}>
              {connect?.onboarded ? "Update Stripe Details" : "Connect Stripe"}
            </Button>
          </div>
        </div>

        {isLoading || !data ? (
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="card"><p className="text-sm text-neutral-500">Total Earned</p><p className="text-3xl font-bold">${data.summary.total.toFixed(2)}</p></div>
              <div className="card"><p className="text-sm text-neutral-500">Paid Out</p><p className="text-3xl font-bold text-emerald-600">${data.summary.paid.toFixed(2)}</p></div>
              <div className="card"><p className="text-sm text-neutral-500">Ready for Payout</p><p className="text-3xl font-bold text-blue-600">${data.summary.ready.toFixed(2)}</p></div>
              <div className="card"><p className="text-sm text-neutral-500">Pending Completion</p><p className="text-3xl font-bold text-amber-600">${data.summary.pending.toFixed(2)}</p></div>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-600">
                    <th className="py-3 pr-3">Order</th>
                    <th className="py-3 pr-3">Service</th>
                    <th className="py-3 pr-3">Customer</th>
                    <th className="py-3 pr-3">Gross</th>
                    <th className="py-3 pr-3">Fee</th>
                    <th className="py-3 pr-3">You Get</th>
                    <th className="py-3 pr-3">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-100">
                      <td className="py-3 pr-3">#{order.id.slice(-8)}</td>
                      <td className="py-3 pr-3">{order.service.name}</td>
                      <td className="py-3 pr-3">{order.user.name || order.user.email}</td>
                      <td className="py-3 pr-3">${(order.amount || 0).toFixed(2)}</td>
                      <td className="py-3 pr-3">${(order.platformFee || 0).toFixed(2)}</td>
                      <td className="py-3 pr-3 font-semibold text-emerald-700">${(order.providerPayoutAmount || 0).toFixed(2)}</td>
                      <td className="py-3 pr-3">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium border bg-neutral-50">
                          {order.payoutStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
