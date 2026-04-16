import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "PROVIDER" || session.user.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeAccountId: true, stripeOnboarded: true },
    });

    if (!user?.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
        payoutsEnabled: false,
        chargesEnabled: false,
      });
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    const onboarded = Boolean(account.details_submitted);
    const payoutsEnabled = Boolean(account.payouts_enabled);
    const chargesEnabled = Boolean(account.charges_enabled);

    if (onboarded !== user.stripeOnboarded) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeOnboarded: onboarded },
      });
    }

    return NextResponse.json({
      connected: true,
      onboarded,
      payoutsEnabled,
      chargesEnabled,
      accountId: user.stripeAccountId,
    });
  } catch (error: unknown) {
    console.error("Connect status error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch connect status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
