import prisma from "./src/lib/prisma";

async function main() {
  const duplicateIds = [
    "e0df980a-304b-4754-9bac-f080a612ab01",
    "d2c6ef7e-5a10-479c-a7a4-7b0df9e93f32",
  ];

  const result = await prisma.conversation.deleteMany({
    where: {
      id: {
        in: duplicateIds,
      },
    },
  });

  console.log(
    `Duplicate conversations removed successfully. Deleted: ${result.count}`
  );
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });