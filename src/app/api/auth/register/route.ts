import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role, providerEmployeeRange } = body;
    const normalizedRole = role === "PROVIDER" ? "PROVIDER" : "CONSUMER";
    const allowedRanges = new Set(["1", "2-5", "5-10", "10+"]);

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRange =
      normalizedRole === "PROVIDER" && allowedRanges.has(providerEmployeeRange)
        ? providerEmployeeRange
        : normalizedRole === "PROVIDER"
        ? "1"
        : null;
    const isCompanyProvider = normalizedRole === "PROVIDER" && normalizedRange === "10+";

    // Create user (with backward-compat fallback for stale Prisma client)
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: normalizedRole,
          providerEmployeeRange: normalizedRange,
          isProfessional: false,
          providerCvUrl: null,
          companyVerificationStatus: isCompanyProvider ? "PENDING_DOCUMENTS" : "NOT_REQUIRED",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          providerEmployeeRange: true,
          companyVerificationStatus: true,
        },
      });
    } catch (createError: unknown) {
      const message = createError instanceof Error ? createError.message : String(createError);
      if (!message.includes("Unknown argument `providerEmployeeRange`")) {
        throw createError;
      }
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: normalizedRole,
          isProfessional: false,
          providerCvUrl: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    }

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
