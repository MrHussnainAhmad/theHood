import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

async function getUserOrders(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      service: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// Infer types from the return value
type Orders = Awaited<ReturnType<typeof getUserOrders>>;
type Order = Orders[number];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const orders = await getUserOrders(session.user.id);

  const stats = {
    total: orders.length,
    processing: orders.filter((o: Order) => o.status === "PROCESSING").length,
    onWay: orders.filter((o: Order) => o.status === "ON_WAY").length,
    completed: orders.filter((o: Order) => o.status === "COMPLETED").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "ON_WAY":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-red-600" />;
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
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-neutral-600">
            Manage your orders and track services
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Processing</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.processing}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">On the Way</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.onWay}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-neutral-900">
              Recent Orders
            </h2>
            <Link href="/services">
              <Button size="sm">Book New Service</Button>
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No orders yet
              </h3>
              <p className="text-neutral-600 mb-6">
                Start by booking your first service
              </p>
              <Link href="/services">
                <Button>Browse Services</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: Order) => (
                <div
                  key={order.id}
                  className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {order.service.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        {order.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                        <span>📍 {order.city}</span>
                        <span>
                          📅{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  {order.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {order.images.slice(0, 3).map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden"
                        >
                          <img
                            src={img}
                            alt="Order"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.images.length > 3 && (
                        <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-600 text-sm font-medium">
                          +{order.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {order.status === "COMPLETED" && !order.review && (
                      <Link href={`/orders/${order.id}/review`}>
                        <Button size="sm" variant="secondary">
                          Leave Review
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}