import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";
import cloudinary from "../lib/cloudinary";

const router = Router();

/**
 * Shared product data returned inside messages.
 */
const productSelect = {
  id: true,
  shopId: true,
  name: true,
  description: true,
  price: true,
  currency: true,
  availability: true,
  isActive: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: {
      url: true,
      isPrimary: true,
      sortOrder: true,
    },
  },
  shop: {
    select: {
      id: true,
      name: true,
      sellerProfileId: true,
    },
  },
};

/**
 * GET ALL CONVERSATIONS
 */
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                roles: true,
                sellerProfile: {
                  select: {
                    id: true,
                    approvalStatus: true,
                  },
                },
              },
            },
          },
        },
        originalProduct: {
          select: productSelect,
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            product: {
              select: productSelect,
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        const hidden = await prisma.$queryRaw<{ hiddenAt: Date }[]>`
          SELECT "hiddenAt"
          FROM "conversation_hidden_for_user"
          WHERE "conversationId" = ${conversation.id}
            AND "userId" = ${userId}
          LIMIT 1
        `;

        const hiddenAt = hidden[0]?.hiddenAt ?? null;
        const lastMessage = conversation.messages[0];

        // A hidden chat stays hidden until a newer message arrives.
        if (
          hiddenAt &&
          (!lastMessage ||
            new Date(lastMessage.createdAt).getTime() <=
              new Date(hiddenAt).getTime())
        ) {
          return null;
        }

        const other = conversation.participants.find(
          (participant) => participant.userId !== userId,
        );

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            isRead: false,
          },
        });

        const messageCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
          },
        });

        const sentCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: userId,
          },
        });

        return {
          id: conversation.id,
          otherUser: other?.user,
          originalProduct: conversation.originalProduct,
          lastMessage,
          unreadCount,
          messageCount,
          sentCount,
          lastMessageAt: lastMessage?.createdAt || conversation.updatedAt,
          updatedAt: conversation.updatedAt,
        };
      }),
    );

    res.json(enriched.filter(Boolean));
  } catch (error) {
    console.error("GET /messages error:", error);
    res.status(500).json({
      error: "Failed to load conversations",
    });
  }
});

/**
 * START / OPEN CONVERSATION
 *
 * Body:
 * {
 *   recipientId: string,
 *   productId?: string
 * }
 *
 * If productId is supplied and the conversation doesn't exist,
 * that product becomes the original product context.
 */
router.post("/start", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId, productId } = req.body;
    const userId = req.user!.id;

    if (!recipientId) {
      return res.status(400).json({
        error: "Recipient required",
      });
    }

    if (recipientId === userId) {
      return res.status(400).json({
        error: "Cannot message yourself",
      });
    }

    let originalProduct = null;

    if (productId) {
      originalProduct = await prisma.product.findFirst({
        where: {
          id: String(productId),
          isActive: true,
          shop: {
            sellerProfile: {
              userId: recipientId,
            },
          },
        },
        select: productSelect,
      });

      if (!originalProduct) {
        return res.status(400).json({
          error: "Product does not belong to the seller",
        });
      }
    }

    /*
     * IMPORTANT:
     * Lock the user pair inside the PostgreSQL transaction.
     *
     * This prevents two simultaneous requests from both deciding
     * that the conversation does not exist and creating duplicates.
     */
    const conversation = await prisma.$transaction(async (tx) => {
      const lockKey = [userId, recipientId].sort().join(":");

      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          hashtextextended(${lockKey}, 0)
        )
      `;

      /*
       * Find the existing conversation between these two users.
       *
       * We deliberately do not use productId here because all
       * products between the same customer and seller belong
       * to the same conversation.
       */
      const existing = await tx.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  userId,
                },
              },
            },
            {
              participants: {
                some: {
                  userId: recipientId,
                },
              },
            },
          ],
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  roles: true,
                  sellerProfile: {
                    select: {
                      id: true,
                      approvalStatus: true,
                    },
                  },
                },
              },
            },
          },
          originalProduct: {
            select: productSelect,
          },
        },
      });

      if (existing) {
        /*
         * If this conversation has no original product yet,
         * attach the product that started this conversation.
         *
         * IMPORTANT:
         * If an original product already exists, NEVER replace it.
         */
        if (!existing.productId && originalProduct?.id) {
          await tx.conversation.update({
            where: {
              id: existing.id,
            },
            data: {
              productId: originalProduct.id,
            },
          });

          const updatedConversation = await tx.conversation.findUnique({
            where: {
              id: existing.id,
            },
            include: {
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true,
                      roles: true,
                      sellerProfile: {
                        select: {
                          id: true,
                          approvalStatus: true,
                        },
                      },
                    },
                  },
                },
              },
              originalProduct: {
                select: productSelect,
              },
            },
          });

          if (originalProduct?.id) {
            await tx.message.create({
              data: {
                conversationId: existing.id,
                senderId: userId,
                type: "PRODUCT",
                content: `Shared product: ${originalProduct.name}`,
                productId: originalProduct.id,
              },
            });

            await tx.conversation.update({
              where: { id: existing.id },
              data: { updatedAt: new Date() },
            });
          }

          await tx.$executeRaw`
      DELETE FROM "conversation_hidden_for_user"
      WHERE "conversationId" = ${existing.id}
        AND "userId" = ${userId}
    `;

          return updatedConversation!;
        }

        /*
         * The conversation is shared by the same customer/seller pair,
         * so a later "Message Seller" action must not replace the
         * conversation's original product. Instead, add the newly
         * requested product as a PRODUCT message so it appears in the
         * chat as another product card.
         */
        if (originalProduct?.id) {
          await tx.message.create({
            data: {
              conversationId: existing.id,
              senderId: userId,
              type: "PRODUCT",
              content: `Shared product: ${originalProduct.name}`,
              productId: originalProduct.id,
            },
          });

          await tx.conversation.update({
            where: { id: existing.id },
            data: { updatedAt: new Date() },
          });
        }

        await tx.$executeRaw`
    DELETE FROM "conversation_hidden_for_user"
    WHERE "conversationId" = ${existing.id}
      AND "userId" = ${userId}
  `;

        return existing;
      }

      /*
       * No conversation exists.
       *
       * Because the advisory lock is held for this transaction,
       * another simultaneous request for the same user pair
       * must wait until this transaction finishes.
       */
      const createdConversation = await tx.conversation.create({
        data: {
          productId: originalProduct?.id ?? null,
          participants: {
            create: [{ userId }, { userId: recipientId }],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  roles: true,
                  sellerProfile: {
                    select: {
                      id: true,
                      approvalStatus: true,
                    },
                  },
                },
              },
            },
          },
          originalProduct: {
            select: productSelect,
          },
        },
      });

      // A product selected from "Message Seller" is an actual chat
      // message. This makes the exact product appear as a sent card
      // in the conversation, not only as conversation metadata.
      if (originalProduct?.id) {
        await tx.message.create({
          data: {
            conversationId: createdConversation.id,
            senderId: userId,
            type: "PRODUCT",
            content: `Shared product: ${originalProduct.name}`,
            productId: originalProduct.id,
          },
        });
      }

      return createdConversation;
    });

    res.json(conversation);
  } catch (error) {
    console.error("POST /messages/start error:", error);

    res.status(500).json({
      error: "Failed to start conversation",
    });
  }
});

/**
 * GET SELLER PRODUCTS AVAILABLE TO SHARE
 *
 * GET /messages/:id/products
 *
 * Returns products belonging to the seller in this conversation.
 */
router.get(
  "/:id/products",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const conversationId = String(req.params.id);
      const userId = req.user!.id;

      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        return res.status(403).json({
          error: "Not a participant",
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          originalProduct: {
            select: {
              shopId: true,
              shop: {
                select: {
                  sellerProfile: {
                    select: {
                      userId: true,
                    },
                  },
                },
              },
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  sellerProfile: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!conversation) {
        return res.status(404).json({
          error: "Conversation not found",
        });
      }

      /**
       * Prefer the seller attached to the original product.
       * For old conversations without an original product,
       * find the participant who has a seller profile.
       */
      let sellerUserId =
        conversation.originalProduct?.shop?.sellerProfile?.userId ?? null;

      if (!sellerUserId) {
        const sellerParticipant = conversation.participants.find(
          (participant) => participant.user.sellerProfile,
        );

        sellerUserId = sellerParticipant?.user.id ?? null;
      }

      if (!sellerUserId) {
        return res.status(400).json({
          error: "Seller could not be determined",
        });
      }

      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          shop: {
            sellerProfile: {
              userId: sellerUserId,
            },
          },
        },
        select: productSelect,
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(products);
    } catch (error) {
      console.error("GET /messages/:id/products error:", error);

      res.status(500).json({
        error: "Failed to load seller products",
      });
    }
  },
);

/**
 * GET MESSAGES IN CONVERSATION
 */
router.get(
  "/:id/messages",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const conversationId = String(req.params.id);
      const userId = req.user!.id;

      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        return res.status(403).json({
          error: "Not a participant",
        });
      }

      const messages = await prisma.$queryRaw<
        {
          id: string;
          conversationId: string;
          senderId: string;
          type: "TEXT" | "PHOTO" | "PRODUCT";
          content: string;
          imageUrl: string | null;
          productId: string | null;
          isRead: boolean;
          createdAt: Date;
          sender: {
            id: string;
            name: string;
            avatarUrl: string | null;
          };
          product: {
            id: string;
            name: string;
            description: string | null;
            price: number | null;
            currency: string;
            availability: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
            isActive: boolean;
            imageUrl: string | null;
          } | null;
        }[]
      >`
        SELECT
          m."id",
          m."conversation_id" AS "conversationId",
          m."sender_id" AS "senderId",
          m."type"::text AS "type",
          m."content",
          m."image_url" AS "imageUrl",
          m."product_id" AS "productId",
          m."is_read" AS "isRead",
          m."created_at" AS "createdAt",

          json_build_object(
            'id', u."id",
            'name', u."name",
            'avatarUrl', u."avatar_url"
          ) AS "sender",

          CASE
            WHEN p."id" IS NULL THEN NULL
            ELSE json_build_object(
              'id', p."id",
              'name', p."name",
              'description', p."description",
              'price', p."price",
              'currency', p."currency",
              'availability', p."availability"::text,
              'isActive', p."is_active",
              'shopId', p."shop_id",
              'shop', json_build_object(
                'id', p."shop_id",
                'name', (
                  SELECT s."name"
                  FROM "shops" s
                  WHERE s."id" = p."shop_id"
                  LIMIT 1
                )
              ),
              'imageUrl', (
                SELECT pi."url"
                FROM "product_images" pi
                WHERE pi."product_id" = p."id"
                ORDER BY pi."is_primary" DESC, pi."sort_order" ASC
                LIMIT 1
              )
            )
          END AS "product"

        FROM "messages" m

        INNER JOIN "users" u
          ON u."id" = m."sender_id"

        LEFT JOIN "products" p
          ON p."id" = m."product_id"

        WHERE m."conversation_id" = ${conversationId}

          AND NOT EXISTS (
            SELECT 1
            FROM "message_hidden_for_user" h
            WHERE h."messageId" = m."id"
              AND h."userId" = ${userId}
          )

        ORDER BY m."created_at" ASC
      `;

      // Opening the conversation marks incoming messages as read.
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      res.json(messages);
    } catch (error) {
      console.error("GET /messages/:id/messages error:", error);

      res.status(500).json({
        error: "Failed to load messages",
      });
    }
  },
);

/**
 * SEND TEXT MESSAGE
 */
router.post(
  "/:id/messages",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const conversationId = String(req.params.id);
      const userId = req.user!.id;
      const { content } = req.body;

      if (!content?.trim()) {
        return res.status(400).json({
          error: "Message content required",
        });
      }

      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        return res.status(403).json({
          error: "Not a participant",
        });
      }

      // Sending a message makes the conversation visible again
      // for this user.
      await prisma.$executeRaw`
        DELETE FROM "conversation_hidden_for_user"
        WHERE "conversationId" = ${conversationId}
          AND "userId" = ${userId}
      `;

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          type: "TEXT",
          content: content.trim(),
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          product: {
            select: productSelect,
          },
        },
      });

      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      res.status(201).json(message);
    } catch (error) {
      console.error("POST /messages/:id/messages error:", error);

      res.status(500).json({
        error: "Failed to send message",
      });
    }
  },
);

/**
 * SEND PHOTO MESSAGE
 *
 * multipart/form-data
 * field: image
 */
router.post(
  "/:id/messages/photo",
  authenticate,
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    try {
      const conversationId = String(req.params.id);
      const userId = req.user!.id;

      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        return res.status(403).json({
          error: "Not a participant",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "Image required",
        });
      }

      /**
       * The generic upload middleware allows videos too.
       * This route explicitly allows images only.
       */
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Only image files are allowed",
        });
      }

      const imageUrl = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "smart-city/messages",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed"));
              return;
            }

            resolve(result.secure_url);
          },
        );

        stream.end(req.file!.buffer);
      });

      await prisma.$executeRaw`
        DELETE FROM "conversation_hidden_for_user"
        WHERE "conversationId" = ${conversationId}
          AND "userId" = ${userId}
      `;

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          type: "PHOTO",
          content: "",
          imageUrl,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      res.status(201).json(message);
    } catch (error) {
      console.error("POST /messages/:id/messages/photo error:", error);

      res.status(500).json({
        error: "Failed to send photo",
      });
    }
  },
);

/**
 * SEND PRODUCT MESSAGE
 *
 * Body:
 * {
 *   productId: string
 * }
 */
router.post(
  "/:id/messages/product",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const conversationId = String(req.params.id);
      const userId = req.user!.id;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          error: "Product required",
        });
      }

      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        return res.status(403).json({
          error: "Not a participant",
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          originalProduct: {
            select: {
              shop: {
                select: {
                  sellerProfile: {
                    select: {
                      userId: true,
                    },
                  },
                },
              },
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  sellerProfile: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!conversation) {
        return res.status(404).json({
          error: "Conversation not found",
        });
      }

      let sellerUserId =
        conversation.originalProduct?.shop?.sellerProfile?.userId ?? null;

      if (!sellerUserId) {
        const sellerParticipant = conversation.participants.find(
          (p) => p.user.sellerProfile,
        );

        sellerUserId = sellerParticipant?.user.id ?? null;
      }

      if (!sellerUserId) {
        return res.status(400).json({
          error: "Seller could not be determined",
        });
      }

      /**
       * Security:
       * A product message can ONLY contain a product
       * belonging to the seller in this conversation.
       */
      const product = await prisma.product.findFirst({
        where: {
          id: String(productId),
          isActive: true,
          shop: {
            sellerProfile: {
              userId: sellerUserId,
            },
          },
        },
        select: productSelect,
      });

      if (!product) {
        return res.status(400).json({
          error: "Product does not belong to this seller",
        });
      }

      await prisma.$executeRaw`
        DELETE FROM "conversation_hidden_for_user"
        WHERE "conversationId" = ${conversationId}
          AND "userId" = ${userId}
      `;

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          type: "PRODUCT",
          content: "",
          productId: product.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          product: {
            select: productSelect,
          },
        },
      });

      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      res.status(201).json(message);
    } catch (error) {
      console.error("POST /messages/:id/messages/product error:", error);

      res.status(500).json({
        error: "Failed to send product",
      });
    }
  },
);

/**
 * DELETE ONE MESSAGE
 *
 * mode:
 * - for_me
 * - for_everyone
 */
router.delete(
  "/:id/messages/:messageId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const conversationId = String(req.params.id);
      const messageId = String(req.params.messageId);
      const userId = req.user!.id;
      const { mode = "for_me" } = req.body;

      if (!["for_me", "for_everyone"].includes(mode)) {
        return res.status(400).json({
          error: "Invalid delete mode",
        });
      }

      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        return res.status(403).json({
          error: "Not a participant",
        });
      }

      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          conversationId,
        },
      });

      if (!message) {
        return res.status(404).json({
          error: "Message not found",
        });
      }

      // Delete for everyone is only allowed for the sender.
      if (mode === "for_everyone") {
        if (message.senderId !== userId) {
          return res.status(403).json({
            error: "You can only delete your own messages for everyone",
          });
        }

        await prisma.message.delete({
          where: {
            id: messageId,
          },
        });

        await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return res.json({
          success: true,
          mode: "for_everyone",
          messageId,
        });
      }

      // Delete for me: hide only this message for this user.
      await prisma.$executeRaw`
        INSERT INTO "message_hidden_for_user"
          ("messageId", "userId")
        VALUES
          (${messageId}, ${userId})
        ON CONFLICT ("messageId", "userId")
        DO NOTHING
      `;

      res.json({
        success: true,
        mode: "for_me",
        messageId,
      });
    } catch (error) {
      console.error("DELETE message error:", error);

      res.status(500).json({
        error: "Failed to delete message",
      });
    }
  },
);

/**
 * DELETE WHOLE CHAT FOR CURRENT USER
 *
 * This NEVER deletes the conversation for everyone.
 */
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = String(req.params.id);
    const userId = req.user!.id;

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      return res.status(403).json({
        error: "Not a participant",
      });
    }

    await prisma.$executeRaw`
        INSERT INTO "conversation_hidden_for_user"
          ("conversationId", "userId")
        VALUES
          (${conversationId}, ${userId})
        ON CONFLICT ("conversationId", "userId")
        DO UPDATE SET "hiddenAt" = CURRENT_TIMESTAMP
      `;

    res.json({
      success: true,
      conversationId,
    });
  } catch (error) {
    console.error("DELETE conversation error:", error);

    res.status(500).json({
      error: "Failed to delete conversation",
    });
  }
});

export default router;
