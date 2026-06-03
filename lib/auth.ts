import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export async function requireCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Authenticated Clerk user does not have an email address.");
  }

  const user = await prisma.user.upsert({
    where: {
      clerkId: clerkUser.id,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      usage: {
        create: {},
      },
    },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    include: {
      usage: true,
    },
  });

  if (user.usage) {
    return user;
  }

  return prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      usage: {
        create: {},
      },
    },
    include: {
      usage: true,
    },
  });
}
