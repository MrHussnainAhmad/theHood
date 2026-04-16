import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "PROVIDER" || session.user.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, stripeAccountId: true },
    });

    if (!user) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

    let accountId = user.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        business_type: "individual",
        metadata: {
          providerId: user.id,
        },
      });
      accountId = account.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId, stripeOnboarded: false },
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${baseUrl}/provider/earnings?connect=refresh`,
      return_url: `${baseUrl}/provider/earnings?connect=return`,
    });

    return NextResponse.json({ url: link.url });
  } catch (error: unknown) {
    console.error("Connect onboarding error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create onboarding link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
