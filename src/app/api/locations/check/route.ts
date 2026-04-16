import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { city, area, pincode, serviceId } = body;

    if (!city && !area && !pincode) {
      return NextResponse.json(
        { error: "At least one of city, area, or pincode is required" },
        { status: 400 }
      );
    }

    const orConditions: Record<string, unknown>[] = [];
    if (pincode) orConditions.push({ pincode });
    if (city) {
      orConditions.push({
        city: {
          equals: city,
          mode: "insensitive" as const,
        },
      });
    }
    if (area) {
      orConditions.push({
        area: {
          equals: area,
          mode: "insensitive" as const,
        },
      });
    }

    const baseWhere = {
      active: true,
      OR: orConditions,
    };

    let location: unknown = null;

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { providerId: true },
      });

      if (service?.providerId) {
        const p = prisma as unknown as {
          providerLocation?: { findFirst: (args: unknown) => Promise<unknown> };
        };

        if (p.providerLocation) {
          location = await p.providerLocation.findFirst({
            where: {
              providerId: service.providerId,
              ...baseWhere,
            },
          });
        } else {
          location = await prisma.availableLocation.findFirst({ where: baseWhere });
        }
      } else {
        location = await prisma.availableLocation.findFirst({ where: baseWhere });
      }
    } else {
      location = await prisma.availableLocation.findFirst({ where: baseWhere });
    }

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
