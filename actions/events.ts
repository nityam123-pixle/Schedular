'use server'
import { eventSchema } from "@/app/_lib/schema";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { addDays, startOfDay, format, parseISO, isBefore, addMinutes } from "date-fns";

export async function createEvent(data) {
    const { userId } = auth();
  
    if (!userId) {
      throw new Error("Unauthorized");
    }
  
    const validatedData = eventSchema.parse(data);
  
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });
  
    if (!user) {
      throw new Error("User not found");
    }
  
    const event = await prisma.event.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });
  
    return event;
  }

  export async function getUserEvents() {
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
  
    const events = await prisma.event.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });
  
    return { events, username: user.username };
  }

  export async function deleteEvent(eventId) {
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
  
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
  
    if (!event || event.userId !== user.id) {
      throw new Error("Event not found or unauthorized");
    }
  
    await prisma.event.delete({
      where: { id: eventId },
    });
  
    return { success: true };
  }

  export async function getEventDetails(username, eventId) {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        user: {
          username: username,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });
  
    return event;
  }

  export async function getEventAvailability(eventId) {
    const event =  await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        user: {
          select: {
            availability: {
              select: {
                days: true,
                timeGap: true,
              },
            },

            bookings: {
              select: {
                startTime: true,
                endTime: true,
              },
            }
          },
        }
      }
    })

    if(!event ||!event.user ||!event.user.availability) {
      return []
    }

    const { availability, bookings } = event.user

    const startDate = startOfDay(new Date())
    const endDate = addDays(startDate, 30)

    const availableDates = [];

    for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
      const dayOfWeek = format(date, "EEEE").toUpperCase();
      const dayAvailability = availability?.days?.find(
        (d) => d.day === dayOfWeek
      );
  
      if (dayAvailability) {
        const dateStr = format(date, "yyyy-MM-dd");
  
        const slots = generateAvailableTimeSlots(
          dayAvailability.startTime,
          dayAvailability.endTime,
          event.duration,
          bookings,
          dateStr,
          availability.timeGap
        );
  
        availableDates.push({
          date: dateStr,
          slots,
        });
      }
    }
  
    return availableDates;
  }

  interface Booking {
    startTime: Date;
    endTime: Date;
  }
  function generateAvailableTimeSlots(
    startTime: Date,        // assuming this is a Date object
    endTime: Date,          // assuming this is a Date object
    duration: number,       // duration in minutes
    bookings: Booking[],    // array of booking objects
    dateStr: string,        // a string in the format "yyyy-MM-dd"
    timeGap: number = 0     // time gap in minutes (optional)
  ): string[] {
    const slots: string[] = [];
    let currentTime = parseISO(`${dateStr}T${startTime.toISOString().slice(11, 16)}`);
    const slotEndTime = parseISO(`${dateStr}T${endTime.toISOString().slice(11, 16)}`);
  
    const now = new Date();
    if (format(now, "yyyy-MM-dd") === dateStr) {
      currentTime = isBefore(currentTime, now)
        ? addMinutes(now, timeGap)
        : currentTime;
    }
  
    while (currentTime < slotEndTime) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
  
      const isSlotAvailable = !bookings.some((booking) => {
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;
        return (
          (currentTime >= bookingStart && currentTime < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (currentTime <= bookingStart && slotEnd >= bookingEnd)
        );
      });
  
      if (isSlotAvailable) {
        slots.push(format(currentTime, "HH:mm"));
      }
  
      currentTime = slotEnd;
    }
  
    return slots;
  }