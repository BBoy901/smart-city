import prisma from "./src/lib/prisma";

async function main() {
  const conversations = await prisma.conversation.findMany({
    include: {
      participants: {
        select: {
          userId: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      originalProduct: {
        select: {
          id: true,
          name: true,
        },
      },
      messages: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const groups = new Map<string, typeof conversations>();

  for (const conversation of conversations) {
    const users = conversation.participants
      .map((participant) => participant.userId)
      .sort();

    const key = users.join(":");

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(conversation);
  }

  let duplicateCount = 0;

  for (const [key, group] of groups) {
    if (group.length > 1) {
      duplicateCount++;

      console.log("");
      console.log("========================================");
      console.log("DUPLICATE GROUP:", key);
      console.log("========================================");

      for (const conversation of group) {
        console.log({
          id: conversation.id,
          users: conversation.participants.map(
            (participant) => participant.user.name
          ),
          originalProduct:
            conversation.originalProduct?.name ?? null,
          messages: conversation.messages.length,
          createdAt: conversation.createdAt,
        });
      }
    }
  }

  console.log("");
  console.log("Duplicate groups found:", duplicateCount);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });