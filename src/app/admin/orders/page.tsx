"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Eye,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Order {
  id: string;
  status: string;
  address: string;
  city: string;
  description: string;
  images: string[];
  createdAt: string;
  scheduledDate: string | null;
  completedDate: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  service: {
    id: string;
    name: string;
    icon: string | null;
  };
  review: any;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Order status updated");
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return <Clock className="w-4 h-4" />;
      case "ON_WAY":
        return <Package className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ON_WAY":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "PROCESSING":
        return "ON_WAY";
      case "ON_WAY":
        return "COMPLETED";
      default:
        return null;
    }
  };

  const statusCounts = {
    ALL: orders.length,
    PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
    ON_WAY: orders.filter((o) => o.status === "ON_WAY").length,
    COMPLETED: orders.filter((o) => o.status === "COMPLETED").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
          Orders Management
        </h1>
        <p className="text-neutral-600">Track and manage all service orders</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by customer, service, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? "bg-accent-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {status.replace("_", " ")} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const nextStatus = getNextStatus(order.status);

          return (
            <div key={order.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-white text-xl">
                        {order.service.icon || "🏠"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-neutral-900">
                          {order.service.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Order #{order.id.slice(-8)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">
                        Customer
                      </p>
                      <p className="text-neutral-900">{order.user.name}</p>
                      <p className="text-sm text-neutral-600">
                        {order.user.email}
                      </p>
                      {order.user.phone && (
                        <p className="text-sm text-neutral-600">
                          📞 {order.user.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">
                        Location
                      </p>
                      <p className="text-neutral-900">{order.city}</p>
                      <p className="text-sm text-neutral-600">{order.address}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-700 mb-1">
                      Description
                    </p>
                    <p className="text-neutral-600 text-sm line-clamp-2">
                      {order.description}
                    </p>
                  </div>

                  {/* Images Preview */}
                  {order.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {order.images.slice(0, 4).map((img, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden"
                        >
                          <img
                            src={img}
                            alt="Order"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.images.length > 4 && (
                        <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-600 text-xs font-medium">
                          +{order.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                    <span>
                      📅 Created: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    {order.scheduledDate && (
                      <span>
                        🕐 Scheduled:{" "}
                        {new Date(order.scheduledDate).toLocaleString()}
                      </span>
                    )}
                    {order.completedDate && (
                      <span>
                        ✅ Completed:{" "}
                        {new Date(order.completedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:w-48">
                  <Link href={`/admin/orders/${order.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </Link>

                  {nextStatus && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, nextStatus)}
                      className="flex-1"
                      size="sm"
                      variant="secondary"
                    >
                      Mark as {nextStatus.replace("_", " ")}
                    </Button>
                  )}

                  {order.status !== "CANCELLED" &&
                    order.status !== "COMPLETED" && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        variant="outline"
                        className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                        size="sm"
                      >
                        Cancel Order
                      </Button>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            No orders found
          </h3>
          <p className="text-neutral-600">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Orders will appear here when customers book services"}
          </p>
        </div>
      )}
    </div>
  );
}