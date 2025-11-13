import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, MapPin, Calendar, Package, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

async function getOrder(orderId: string, userId: string, isAdmin: boolean) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      service: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      review: true,
    },
  });

  if (!order) return null;

  // Check authorization
  if (!isAdmin && order.userId !== userId) {
    return null;
  }

  return order;
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const order = await getOrder(
    orderId,
    session.user.id,
    session.user.role === "ADMIN"
  );

  if (!order) {
    redirect("/dashboard");
  }

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center text-white text-2xl">
                {order.service.icon || "🏠"}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-neutral-900">
                  {order.service.name}
                </h1>
                <p className="text-neutral-600">Order #{order.id.slice(-8)}</p>
              </div>
            </div>

            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.replace("_", " ")}
            </span>
          </div>

          {/* Order Timeline */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">
              Order Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === "PROCESSING" ||
                    order.status === "ON_WAY" ||
                    order.status === "COMPLETED"
                      ? "bg-green-500"
                      : "bg-neutral-300"
                  }`}
                >
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">Order Placed</p>
                  <p className="text-sm text-neutral-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === "ON_WAY" || order.status === "COMPLETED"
                      ? "bg-green-500"
                      : "bg-neutral-300"
                  }`}
                >
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">On the Way</p>
                  <p className="text-sm text-neutral-600">
                    {order.status === "ON_WAY" || order.status === "COMPLETED"
                      ? "In progress"
                      : "Pending"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === "COMPLETED"
                      ? "bg-green-500"
                      : "bg-neutral-300"
                  }`}
                >
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">Completed</p>
                  <p className="text-sm text-neutral-600">
                    {order.completedDate
                      ? new Date(order.completedDate).toLocaleString()
                      : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-neutral-50 rounded-lg p-4">
              <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                Location
              </h3>
              <p className="text-neutral-700">{order.address}</p>
              <p className="text-neutral-600 text-sm mt-1">
                {order.city}
                {order.area && `, ${order.area}`}
                {order.pincode && ` - ${order.pincode}`}
              </p>
            </div>

            {order.scheduledDate && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  Scheduled
                </h3>
                <p className="text-neutral-700">
                  {new Date(order.scheduledDate).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 mb-2">
              Description
            </h3>
            <p className="text-neutral-700">{order.description}</p>
          </div>

          {/* Images */}
          {order.images.length > 0 && (
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">
                Uploaded Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {order.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-neutral-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`Order image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Section */}
          {order.status === "COMPLETED" && !order.review && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <Link href={`/orders/${order.id}/review`}>
                <Button className="w-full">
                  <Star className="w-5 h-5" />
                  Leave a Review
                </Button>
              </Link>
            </div>
          )}

          {order.review && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-3">
                Your Review
              </h3>
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        order.review && i < order.review.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-neutral-300"
                      }`}
                    />
                  ))}
                </div>
                {order.review.comment && (
                  <p className="text-neutral-700">{order.review.comment}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}