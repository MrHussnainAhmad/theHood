import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

async function getOrderId(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  return params.orderId;
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ orderId: string }> }
) {
  const session = await getServerSession(authOptions);
  const orderId = await getOrderId(props);

  if (!session || !["PROVIDER", "ADMIN"].includes(session.user.role) || session.user.isBanned) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      providerId: true,
      paymentStatus: true,
      payoutStatus: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN" && order.providerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updateData: Prisma.OrderUpdateInput = { status };
  if (status === "COMPLETED") {
    updateData.completedDate = new Date();
    if (order.paymentStatus === "PAID" && order.payoutStatus !== "PAID") {
      updateData.payoutStatus = "READY";
    }
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      user: { select: { name: true, email: true } },
      service: true,
    },
  });

  return NextResponse.json(updatedOrder);
}
