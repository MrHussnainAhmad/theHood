import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providers = await prisma.user.findMany({
      where: {
        role: "PROVIDER",
        providerEmployeeRange: "10+",
        companyVerificationStatus: "SUBMITTED",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        companyRegistrationNumber: true,
        companyTaxId: true,
        companyAddress: true,
        companyContactName: true,
        companyContactPhone: true,
        companyVerificationFiles: true,
        companyVerificationStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Verifications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch verifications" },
      { status: 500 }
    );
  }
}

