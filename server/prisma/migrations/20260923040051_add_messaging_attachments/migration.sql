-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'PHOTO', 'PRODUCT');

-- Add original product context to conversations
ALTER TABLE "conversations"
ADD COLUMN "product_id" TEXT;

-- Add attachment fields to messages
ALTER TABLE "messages"
ADD COLUMN "image_url" TEXT,
ADD COLUMN "product_id" TEXT,
ADD COLUMN "type" "MessageType" NOT NULL DEFAULT 'TEXT';

-- Create message hidden-for-user table
CREATE TABLE "message_hidden_for_user" (
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_hidden_for_user_pkey"
    PRIMARY KEY ("messageId", "userId")
);

-- Create conversation hidden-for-user table
CREATE TABLE "conversation_hidden_for_user" (
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hiddenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_hidden_for_user_pkey"
    PRIMARY KEY ("conversationId", "userId")
);

-- Indexes
CREATE INDEX "message_hidden_for_user_userId_idx"
ON "message_hidden_for_user"("userId");

CREATE INDEX "conversation_hidden_for_user_userId_idx"
ON "conversation_hidden_for_user"("userId");

CREATE INDEX "conversations_product_id_idx"
ON "conversations"("product_id");

CREATE INDEX "messages_product_id_idx"
ON "messages"("product_id");

-- Original product relation
ALTER TABLE "conversations"
ADD CONSTRAINT "conversations_product_id_fkey"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Shared product message relation
ALTER TABLE "messages"
ADD CONSTRAINT "messages_product_id_fkey"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Message deletion relation
ALTER TABLE "message_hidden_for_user"
ADD CONSTRAINT "message_hidden_for_user_messageId_fkey"
FOREIGN KEY ("messageId")
REFERENCES "messages"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "message_hidden_for_user"
ADD CONSTRAINT "message_hidden_for_user_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Conversation deletion relation
ALTER TABLE "conversation_hidden_for_user"
ADD CONSTRAINT "conversation_hidden_for_user_conversationId_fkey"
FOREIGN KEY ("conversationId")
REFERENCES "conversations"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "conversation_hidden_for_user"
ADD CONSTRAINT "conversation_hidden_for_user_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;