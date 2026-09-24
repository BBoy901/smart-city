import prisma from "../src/lib/prisma";

async function main() {
  const conversations = await prisma.conversation.findMany({
    include: {
      participants: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const groups = new Map<string, typeof conversations>();

  for (const conversation of conversations) {
    if (conversation.participants.length !== 2) continue;

    const userIds = conversation.participants
      .map((participant) => participant.userId)
      .sort();

    const key = userIds.join(":");
    const group = groups.get(key) ?? [];
    group.push(conversation);
    groups.set(key, group);
  }

  let merged = 0;
  let deleted = 0;
  let movedMessages = 0;

  for (const [, group] of groups) {
    if (group.length <= 1) continue;

    group.sort((a, b) => {
      const aActivity = a.messages[0]?.createdAt.getTime() ?? a.updatedAt.getTime();
      const bActivity = b.messages[0]?.createdAt.getTime() ?? b.updatedAt.getTime();
      return bActivity - aActivity;
    });

    const primary = group[0];
    const duplicates = group.slice(1);

    await prisma.$transaction(async (tx) => {
      for (const duplicate of duplicates) {
        const result = await tx.message.updateMany({
          where: { conversationId: duplicate.id },
          data: { conversationId: primary.id },
        });

        movedMessages += result.count;

        await tx.conversation.delete({
          where: { id: duplicate.id },
        });

        deleted += 1;
      }

      const newest = await tx.message.findFirst({
        where: { conversationId: primary.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      if (newest) {
        await tx.conversation.update({
          where: { id: primary.id },
          data: { updatedAt: newest.createdAt },
        });
      }
    });

    merged += 1;
  }

  console.log(`Duplicate conversation groups merged: ${merged}`);
  console.log(`Duplicate conversations deleted: ${deleted}`);
  console.log(`Messages moved: ${movedMessages}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
