"use server"

import prisma from "@/lib/prisma"
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function updateUsername(username) {
    const { userId } = auth()
    if(!userId) throw new Error("Unauthorized")
    
    const existingUsername = await prisma.user.findUnique({
        where: {
            username
        }
    })

    if(existingUsername && existingUsername.id !== userId) {
        throw new Error("Username already taken")
    }

    await prisma.user.update({
        where: { clerkUserId: userId },
        data: { username },
    })

    await clerkClient.users.updateUser(userId, {
        username,
    })

    return { success: true }
}

export async function getUserByUsername(username) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        events: {
          where: {
            isPrivate: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            isPrivate: true,
            _count: {
              select: { bookings: true },
            },
          },
        },
      },
    });
  
    return user;
  }