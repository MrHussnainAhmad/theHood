import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PROVIDER" || session.user.isBanned) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locations = await prisma.providerLocation.findMany({
    where: { providerId: session.user.id },
    orderBy: [{ city: "asc" }, { area: "asc" }],
  });

  return NextResponse.json(locations);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PROVIDER" || session.user.isBanned) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const city = body.city?.trim();
  const area = body.area?.trim() || null;
  const pincode = body.pincode?.trim() || null;
  const active = body.active ?? true;

  if (!city) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  const location = await prisma.providerLocation.create({
    data: {
      providerId: session.user.id,
      city,
      area,
      pincode,
      active,
    },
  });

  return NextResponse.json(location, { status: 201 });
}