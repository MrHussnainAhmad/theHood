import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Users, Briefcase, Package, MapPin, TrendingUp, Clock } from "lucide-react";

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: { select: { name: true; email: true } };
    service: { select: { name: true } };
  };
}>;

async function getStats() {
  const [
    totalUsers,
    totalServices,
    totalOrders,
    totalLocations,
    processingOrders,
    completedOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.availableLocation.count({ where: { active: true } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.findMany({
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    totalUsers,
    totalServices,
    totalOrders,
    totalLocations,
    processingOrders,
    completedOrders,
    recentOrders,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "ON_WAY":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
          Dashboard
        </h1>
        <p className="text-neutral-600">Welcome to Hood Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Active
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Services</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalServices}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Active services</p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalOrders}
              </p>
              <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {stats.processingOrders} pending
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
              <p className="text-sm text-neutral-600 mb-1">Locations</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.totalLocations}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Service areas</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-display font-semibold text-neutral-900 mb-6">
          Recent Orders
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  Service
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: OrderWithRelations) => (
                <tr key={order.id} className="border-b border-neutral-100">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-neutral-900">
                        {order.user.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {order.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-neutral-900">{order.service.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}