import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

async function getProviderStats(providerId: string) {
  const [servicesCount, ordersCount, processingCount, completedCount, locationsCount] = await Promise.all([
    prisma.service.count({ where: { providerId } }),
    prisma.order.count({ where: { providerId } }),
    prisma.order.count({ where: { providerId, status: "PROCESSING" } }),
    prisma.order.count({ where: { providerId, status: "COMPLETED" } }),
    prisma.providerLocation.count({ where: { providerId, active: true } }),
  ]);

  return { servicesCount, ordersCount, processingCount, completedCount, locationsCount };
}

async function getProviderVerification(providerId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: providerId },
      select: {
        providerEmployeeRange: true,
        companyVerificationStatus: true,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Unknown field `providerEmployeeRange`")) {
      return null;
    }
    throw error;
  }
}

export default async function ProviderDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "PROVIDER") {
    redirect("/dashboard");
  }

  const stats = await getProviderStats(session.user.id);
  const verification = await getProviderVerification(session.user.id);
  const isCompany = verification?.providerEmployeeRange === "10+";

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Provider Panel</h1>
        <p className="text-neutral-600 mb-8">Manage your services and assigned orders.</p>
        {isCompany && verification?.companyVerificationStatus !== "VERIFIED" && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Company verification status: <strong>{verification?.companyVerificationStatus}</strong>. Please submit/complete verification to build trust with customers.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="card"><p className="text-sm text-neutral-500">Your Services</p><p className="text-3xl font-bold">{stats.servicesCount}</p></div>
          <div className="card"><p className="text-sm text-neutral-500">Total Orders</p><p className="text-3xl font-bold">{stats.ordersCount}</p></div>
          <div className="card"><p className="text-sm text-neutral-500">Processing</p><p className="text-3xl font-bold">{stats.processingCount}</p></div>
          <div className="card"><p className="text-sm text-neutral-500">Completed</p><p className="text-3xl font-bold">{stats.completedCount}</p></div>
          <div className="card"><p className="text-sm text-neutral-500">Active Areas</p><p className="text-3xl font-bold">{stats.locationsCount}</p></div>
        </div>

        <div className="flex gap-3">
          <Link href="/provider/services"><Button>Manage Services</Button></Link>
          <Link href="/provider/orders"><Button variant="outline">Manage Orders</Button></Link>
          <Link href="/provider/earnings"><Button variant="outline">Earnings</Button></Link>
          <Link href="/provider/locations"><Button variant="outline">Service Areas</Button></Link>
          {isCompany && <Link href="/provider/verification"><Button variant="outline">Company Verification</Button></Link>}
        </div>
      </div>
    </div>
  );
}
