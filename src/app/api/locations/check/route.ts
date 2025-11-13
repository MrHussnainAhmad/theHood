import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { city, area, pincode } = body;

    if (!city) {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      );
    }

    // Check if location is available
    const location = await prisma.availableLocation.findFirst({
      where: {
        active: true,
        city: {
          equals: city,
          mode: "insensitive",
        },
        ...(area && {
          area: {
            equals: area,
            mode: "insensitive",
          },
        }),
        ...(pincode && { pincode }),
      },
    });

    return NextResponse.json({
      available: !!location,
      location: location || null,
    });
  } catch (error) {
    console.error("Location check error:", error);
    return NextResponse.json(
      { error: "Failed to check location" },
      { status: 500 }
    );
  }
}