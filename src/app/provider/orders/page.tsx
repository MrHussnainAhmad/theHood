"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

interface Order {
  id: string;
  status: string;
  city: string;
  address: string;
  description: string;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
  service: { name: string; icon: string | null };
}

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedOnceRef = useRef(false);

  const fetchOrders = async (silent = false) => {
    try {
      const response = await fetch("/api/provider/orders");
      const data: Order[] = await response.json();

      const incomingIds = new Set<string>(data.map((order) => order.id));
      if (silent && hasLoadedOnceRef.current) {
        let newCount = 0;
        for (const id of incomingIds) {
          if (!knownOrderIdsRef.current.has(id)) newCount++;
        }
        if (newCount > 0) {
          toast.success(`${newCount} new order${newCount > 1 ? "s" : ""} received`);
        }
      }

      knownOrderIdsRef.current = incomingIds;
      hasLoadedOnceRef.current = true;
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(() => {
      fetchOrders(true);
    }, 12000);

    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return orders;
    const q = query.toLowerCase();
    return orders.filter(
      (o) =>
        o.user.name.toLowerCase().includes(q) ||
        o.service.name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
    );
  }, [orders, query]);

  const updateOrderStatus = async (id: string, status: string) => {
    const response = await fetch(`/api/provider/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      toast.error("Failed to update order");
      return;
    }

    toast.success("Order updated");
    fetchOrders(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Assigned Orders</h1>
        <p className="text-neutral-600 mb-6">Track and manage orders for your services.</p>

        <div className="card mb-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer, city, or service"
          />
        </div>

        {isLoading ? (
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div key={order.id} className="card">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{order.service.name}</h3>
                    <p className="text-sm text-neutral-600">
                      Order #{order.id.slice(-8)} - {order.user.name}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-neutral-100 w-fit">
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 mb-2">{order.description}</p>
                <p className="text-sm text-neutral-600 mb-4">
                  {order.city} - {order.address}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {order.status === "PROCESSING" && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, "ON_WAY")}>
                      Mark ON_WAY
                    </Button>
                  )}
                  {order.status === "ON_WAY" && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, "WORKING")}>
                      Mark WORKING
                    </Button>
                  )}
                  {order.status === "WORKING" && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, "COMPLETED")}>
                      Mark COMPLETED
                    </Button>
                  )}
                  {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200"
                      onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="card text-center text-neutral-500">No orders found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
