import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role === "PROVIDER" || session.user.role === "ADMIN") {
      return NextResponse.json({ error: "Only consumers can create payments" }, { status: 403 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      select: { amount: true, currency: true, paymentIntentId: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.amount || order.amount <= 0) {
      return NextResponse.json(
        { error: "Order amount is invalid. Please contact support." },
        { status: 400 }
      );
    }

    if (order.paymentIntentId) {
      return NextResponse.json(
        { error: "Payment already initiated for this order" },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.amount * 100),
      currency: order.currency || "usd",
      metadata: {
        orderId,
        userId: session.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await prisma.order.updateMany({
      where: { id: orderId, userId: session.user.id },
      data: {
        paymentIntentId: paymentIntent.id,
        paymentStatus: "PENDING",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: unknown) {
    console.error("Payment intent error:", error);
    const message = error instanceof Error ? error.message : "Payment intent creation failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
