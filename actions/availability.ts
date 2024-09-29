"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { DayOfWeek } from "@prisma/client";

export async function getUserAvailability() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      availability: {
        include: { days: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Initialize availabilityData
  const availabilityData = {
    timeGap: user.availability ? user.availability.timeGap : null,
  };

  // Define the days of the week
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Iterate over days and check availability
  daysOfWeek.forEach((day) => {
    const dayAvailability = user.availability?.days?.find(
      (d) => d.day === day.toUpperCase()
    );

    availabilityData[day] = {
      isAvailable: !!dayAvailability,
      startTime: dayAvailability
        ? dayAvailability.startTime.toISOString().slice(11, 16)
        : "09:00", // Default start time
      endTime: dayAvailability
        ? dayAvailability.endTime.toISOString().slice(11, 16)
        : "17:00", // Default end time
    };
  });

  return availabilityData;
}

export async function updateAvailability(data: {
  timeGap: number;
  [day: string]: {
    isAvailable: boolean;
    startTime: string;
    endTime: string;
  };
}) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { availability: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const dayOfWeekMap: { [key: string]: DayOfWeek } = {
    monday: DayOfWeek.MONDAY,
    tuesday: DayOfWeek.TUESDAY,
    wednesday: DayOfWeek.WEDNESDAY,
    thursday: DayOfWeek.THURSDAY,
    friday: DayOfWeek.FRIDAY,
    saturday: DayOfWeek.SATURDAY,
    sunday: DayOfWeek.SUNDAY,
  };

  const availabilityData = Object.entries(data).flatMap(
    ([day, { isAvailable, startTime, endTime }]) => {
      if (isAvailable) {
        const baseDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

        return [
          {
            day: dayOfWeekMap[day.toLowerCase()], // Use the mapped enum value
            startTime: new Date(`${baseDate}T${startTime}:00Z`),
            endTime: new Date(`${baseDate}T${endTime}:00Z`),
          },
        ];
      }
      return [];
    }
  );

  if (user.availability) {
    await prisma.availability.update({
      where: { id: user.availability.id },
      data: {
        timeGap: data.timeGap,
        days: {
          deleteMany: {},
          create: availabilityData,
        },
      },
    });
  } else {
    await prisma.availability.create({
      data: {
        userId: user.id,
        timeGap: data.timeGap,
        days: {
          create: availabilityData,
        },
      },
    });
  }

  return { success: true };
}