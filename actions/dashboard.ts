"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getLatestUpdates() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  const upcomingMeetings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      startTime: { gte: now },
    },
    include: {
      event: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
    take: 3,
  });

  return upcomingMeetings;
}