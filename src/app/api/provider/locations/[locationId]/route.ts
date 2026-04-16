import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getLocationId(props: { params: Promise<{ locationId: string }> }) {
  const params = await props.params;
  return params.locationId;
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  const session = await getServerSession(authOptions);
  const locationId = await getLocationId(props);

  if (!session || session.user.role !== "PROVIDER" || session.user.isBanned) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await prisma.providerLocation.findUnique({
    where: { id: locationId },
    select: { providerId: true },
  });

  if (!current || current.providerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updated = await prisma.providerLocation.update({
    where: { id: locationId },
    data: {
      city: body.city,
      area: body.area,
      pincode: body.pincode,
      active: body.active,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  const session = await getServerSession(authOptions);
  const locationId = await getLocationId(props);

  if (!session || session.user.role !== "PROVIDER" || session.user.isBanned) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await prisma.providerLocation.findUnique({
    where: { id: locationId },
    select: { providerId: true },
  });

  if (!current || current.providerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.providerLocation.delete({ where: { id: locationId } });
  return NextResponse.json({ message: "Location deleted" });
}