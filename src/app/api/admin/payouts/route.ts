import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { getPlatformFeePercent } from "@/lib/platform-fee";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN" || session.user.isBanned) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eligibleOrders = await prisma.order.findMany({
    where: {
      providerId: { not: null },
      paymentStatus: "PAID",
      status: "COMPLETED",
      payoutStatus: { not: "PAID" },
    },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          providerEmployeeRange: true,
          stripeAccountId: true,
          stripeOnboarded: true,
        },
      },
      service: { select: { name: true } },
    },
    orderBy: { completedDate: "asc" },
  });

  const grouped = new Map<
    string,
    {
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
        completedDate: Date | null;
      }[];
    }
  >();

  for (const order of eligibleOrders) {
    if (!order.providerId || !order.provider) continue;
    const existing = grouped.get(order.providerId);
    const gross = order.amount || 0;
    const feePercent = getPlatformFeePercent(order.provider.providerEmployeeRange);
    const fallbackFee = Number(((gross * feePercent) / 100).toFixed(2));
    const fee = order.platformFee ?? fallbackFee;
    const payoutAmount = order.providerPayoutAmount ?? Number((gross - fee).toFixed(2));

    const payload = {
      id: order.id,
      serviceName: order.service.name,
      amount: gross,
      platformFee: fee,
      providerPayoutAmount: payoutAmount,
      completedDate: order.completedDate,
    };

    if (!existing) {
      grouped.set(order.providerId, {
        providerId: order.providerId,
        providerName: order.provider.name || "Provider",
        providerEmail: order.provider.email,
        stripeAccountId: order.provider.stripeAccountId,
        stripeOnboarded: order.provider.stripeOnboarded,
        totalPayable: payoutAmount,
        orderCount: 1,
        orders: [payload],
      });
      continue;
    }

    existing.totalPayable += payoutAmount;
    existing.orderCount += 1;
    existing.orders.push(payload);
  }

  return NextResponse.json(Array.from(grouped.values()));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN" || session.user.isBanned) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const orderIds = Array.isArray(body.orderIds) ? body.orderIds : [];

  if (orderIds.length === 0) {
    return NextResponse.json({ error: "orderIds are required" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: {
      id: { in: orderIds },
      paymentStatus: "PAID",
      status: "COMPLETED",
      payoutStatus: { not: "PAID" },
      providerId: { not: null },
    },
    include: {
      provider: {
        select: {
          id: true,
          stripeAccountId: true,
          stripeOnboarded: true,
        },
      },
    },
  });

  let releasedOrders = 0;
  const failedOrderIds: string[] = [];

  for (const order of orders) {
    try {
      if (!order.provider?.stripeAccountId || !order.provider.stripeOnboarded) {
        failedOrderIds.push(order.id);
        continue;
      }
      const amount = order.providerPayoutAmount || 0;
      if (amount <= 0) {
        failedOrderIds.push(order.id);
        continue;
      }

      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: order.currency || "usd",
        destination: order.provider.stripeAccountId,
        metadata: {
          orderId: order.id,
          providerId: order.provider.id,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          payoutStatus: "PAID",
          payoutReleasedAt: new Date(),
          payoutTransferId: transfer.id,
        },
      });
      releasedOrders += 1;
    } catch {
      failedOrderIds.push(order.id);
    }
  }

  return NextResponse.json({
    success: true,
    releasedOrders,
    failedOrderIds,
  });
}
