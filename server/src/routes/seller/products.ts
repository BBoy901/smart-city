import cloudinary from "../../lib/cloudinary";
import { Router, Response } from "express";
import prisma from "../../lib/prisma";
import {
  authenticate,
  requireRole,
  requireApprovedSeller,
  AuthRequest,
} from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { Role } from "@prisma/client";

const router = Router();

const MAX_PRODUCT_IMAGES = 10;

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  category: true,
  shop: { include: { location: true } },
};

/**
 * Get products belonging to the logged-in seller
 */
router.get(
  "/my",
  authenticate,
  requireRole(Role.SELLER),
  requireApprovedSeller,
  async (req: AuthRequest, res: Response) => {
    try {
      const seller = await prisma.sellerProfile.findUnique({
        where: { userId: req.user!.id },
        include: {
          shops: {
            select: { id: true },
          },
        },
      });

      if (!seller) {
        return res.status(404).json({
          error: "Seller profile not found",
        });
      }

      const shopIds = seller.shops.map((shop) => shop.id);

      const products = await prisma.product.findMany({
        where: {
          shopId: {
            in: shopIds,
          },
        },
        include: productInclude,
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.json(products);
    } catch (err) {
      console.error("Get seller products error:", err);

      return res.status(500).json({
        error: "Failed to load products",
      });
    }
  },
);

/**
 * Create product
 */
router.post(
  "/",
  authenticate,
  requireRole(Role.SELLER),
  requireApprovedSeller,
  upload.array("images", MAX_PRODUCT_IMAGES),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        shopId,
        name,
        description,
        price,
        categoryId,
        availability,
        videoUrl,
      } = req.body;

      if (!shopId || !name) {
        return res.status(400).json({
          error: "Shop and product name are required",
        });
      }

      /**
       * Verify that the shop belongs to the logged-in seller
       */
      const seller = await prisma.sellerProfile.findUnique({
        where: {
          userId: req.user!.id,
        },
        include: {
          shops: true,
        },
      });

      if (!seller?.shops.some((shop) => shop.id === shopId)) {
        return res.status(403).json({
          error: "Shop not found or not owned by you",
        });
      }

      const files = req.files as Express.Multer.File[];

      /**
       * CREATE:
       * A new product can have a maximum of 10 images.
       */
      if (files?.length > MAX_PRODUCT_IMAGES) {
        return res.status(400).json({
          error: `A product can have a maximum of ${MAX_PRODUCT_IMAGES} images`,
        });
      }

      /**
       * Upload images to Cloudinary
       */
      const uploadedImages = files?.length
        ? await Promise.all(
            files.map(
              (file) =>
                new Promise<any>((resolve, reject) => {
                  const stream = cloudinary.uploader.upload_stream(
                    {
                      folder: "smart-city/products",
                      resource_type: "auto",
                    },
                    (error, result) => {
                      if (error) {
                        reject(error);
                      } else {
                        resolve(result);
                      }
                    },
                  );

                  stream.end(file.buffer);
                }),
            ),
          )
        : [];

      /**
       * Create product
       */
      const product = await prisma.product.create({
        data: {
          shopId,
          name: name.trim(),
          description: description?.trim() || null,
          price: price ? Number(price) : null,
          categoryId: categoryId || null,
          availability: availability || "IN_STOCK",
          videoUrl: videoUrl || null,

          images: files?.length
            ? {
                create: files.map((file, index) => ({
                  url: uploadedImages[index].secure_url,
                  isPrimary: index === 0,
                  sortOrder: index,
                })),
              }
            : undefined,
        },

        include: productInclude,
      });

      return res.status(201).json(product);
    } catch (err) {
      console.error("Create product error:", err);

      return res.status(500).json({
        error: "Failed to create product",
      });
    }
  },
);

/**
 * Update product
 */
router.patch(
  "/:id",
  authenticate,
  requireRole(Role.SELLER),
  requireApprovedSeller,
  upload.array("images", MAX_PRODUCT_IMAGES),
  async (req: AuthRequest, res: Response) => {
    try {
      /**
       * Find product and verify ownership
       */
      const product = await prisma.product.findUnique({
        where: {
          id: String(req.params.id),
        },
        include: {
          shop: {
            include: {
              sellerProfile: true,
            },
          },
          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

      if (
        !product ||
        product.shop.sellerProfile.userId !== req.user!.id
      ) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      const {
        name,
        description,
        price,
        categoryId,
        availability,
        videoUrl,
        isActive,
      } = req.body;

      const files = req.files as Express.Multer.File[];

      /**
       * EDIT:
       * Existing images + new images must never exceed 10.
       */
      const existingImageCount = product.images.length;
      const newImageCount = files?.length || 0;

      if (
        existingImageCount + newImageCount >
        MAX_PRODUCT_IMAGES
      ) {
        const remainingSlots = Math.max(
          MAX_PRODUCT_IMAGES - existingImageCount,
          0,
        );

        return res.status(400).json({
          error:
            remainingSlots === 0
              ? `This product already has the maximum of ${MAX_PRODUCT_IMAGES} images`
              : `This product already has ${existingImageCount} images. You can only add ${remainingSlots} more`,
        });
      }

      /**
       * Upload new images if supplied
       */
      const uploadedImages = files?.length
        ? await Promise.all(
            files.map(
              (file) =>
                new Promise<any>((resolve, reject) => {
                  const stream = cloudinary.uploader.upload_stream(
                    {
                      folder: "smart-city/products",
                      resource_type: "auto",
                    },
                    (error, result) => {
                      if (error) {
                        reject(error);
                      } else {
                        resolve(result);
                      }
                    },
                  );

                  stream.end(file.buffer);
                }),
            ),
          )
        : [];

      /**
       * Update the product itself
       */
      await prisma.product.update({
        where: {
          id: product.id,
        },

        data: {
          name:
            name !== undefined
              ? String(name).trim()
              : product.name,

          description:
            description !== undefined
              ? String(description).trim() || null
              : product.description,

          price:
            price !== undefined && price !== ""
              ? Number(price)
              : price === ""
                ? null
                : product.price,

          categoryId:
            categoryId !== undefined
              ? categoryId || null
              : product.categoryId,

          availability:
            availability !== undefined
              ? availability
              : product.availability,

          videoUrl:
            videoUrl !== undefined
              ? videoUrl || null
              : product.videoUrl,

          isActive:
            isActive !== undefined
              ? isActive === "true" || isActive === true
              : product.isActive,
        },
      });

      /**
       * Add new images after existing images.
       *
       * This prevents duplicate sortOrder values.
       */
      if (files?.length) {
        const existingImages = await prisma.productImage.findMany({
          where: {
            productId: product.id,
          },
          orderBy: {
            sortOrder: "desc",
          },
          take: 1,
        });

        const highestSortOrder =
          existingImages.length > 0
            ? existingImages[0].sortOrder
            : -1;

        await prisma.productImage.createMany({
          data: files.map((file, index) => ({
            productId: product.id,
            url: uploadedImages[index].secure_url,
            isPrimary:
              product.images.length === 0 && index === 0,
            sortOrder: highestSortOrder + index + 1,
          })),
        });
      }

      /**
       * Return the complete updated product
       */
      const updatedProduct = await prisma.product.findUnique({
        where: {
          id: product.id,
        },
        include: productInclude,
      });

      return res.json(updatedProduct);
    } catch (err) {
      console.error("Update product error:", err);

      return res.status(500).json({
        error: "Failed to update product",
      });
    }
  },
);

/**
 * Delete a product
 */
router.delete(
  "/:id",
  authenticate,
  requireRole(Role.SELLER),
  requireApprovedSeller,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await prisma.product.findUnique({
        where: {
          id: String(req.params.id),
        },
        include: {
          shop: {
            include: {
              sellerProfile: true,
            },
          },
        },
      });

      if (
        !product ||
        product.shop.sellerProfile.userId !== req.user!.id
      ) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      await prisma.product.delete({
        where: {
          id: product.id,
        },
      });

      return res.json({
        success: true,
      });
    } catch (err) {
      console.error("Delete product error:", err);

      return res.status(500).json({
        error: "Failed to delete product",
      });
    }
  },
);

/**
 * Delete one product image
 */
router.delete(
  "/:productId/images/:imageId",
  authenticate,
  requireRole(Role.SELLER),
  requireApprovedSeller,
  async (req: AuthRequest, res: Response) => {
    try {
      const productId = String(req.params.productId);
      const imageId = String(req.params.imageId);

      const image = await prisma.productImage.findUnique({
        where: {
          id: imageId,
        },
        include: {
          product: {
            include: {
              shop: {
                include: {
                  sellerProfile: true,
                },
              },
            },
          },
        },
      });

      if (
        !image ||
        image.productId !== productId ||
        image.product.shop.sellerProfile.userId !== req.user!.id
      ) {
        return res.status(404).json({
          error: "Image not found",
        });
      }

      const wasPrimary = image.isPrimary;

      await prisma.productImage.delete({
        where: {
          id: image.id,
        },
      });

      if (wasPrimary) {
        const nextImage = await prisma.productImage.findFirst({
          where: {
            productId,
          },
          orderBy: {
            sortOrder: "asc",
          },
        });

        if (nextImage) {
          await prisma.productImage.update({
            where: {
              id: nextImage.id,
            },
            data: {
              isPrimary: true,
            },
          });
        }
      }

      const images = await prisma.productImage.findMany({
        where: {
          productId,
        },
        orderBy: {
          sortOrder: "asc",
        },
      });

      return res.json({
        success: true,
        images,
      });
    } catch (err) {
      console.error("Delete product image error:", err);

      return res.status(500).json({
        error: "Failed to delete product image",
      });
    }
  },
);

export { router as sellerProductRoutes };