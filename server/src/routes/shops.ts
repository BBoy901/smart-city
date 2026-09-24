import { Router, Response } from "express";
import prisma from "../lib/prisma";
import {
  authenticate,
  requireRole,
  requireApprovedSeller,
  AuthRequest,
} from "../middleware/auth";
import { upload } from "../middleware/upload";
import { uploadImageBuffer } from "../lib/cloudinary";
import { Role } from "@prisma/client";

const router = Router();

function parseCategoryIds(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    );
  }
  if (typeof raw !== "string") return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    );
  } catch {
    return [];
  }
}

async function uploadShopLogo(file?: Express.Multer.File) {
  if (!file) return null;
  const uploaded = await uploadImageBuffer(file.buffer, "smart-city/shops");
  return uploaded.secure_url;
}

router.get(
  "/my/shops",
  authenticate,
  requireRole(Role.SELLER),
  async (req: AuthRequest, res: Response) => {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        shops: {
          include: {
            location: true,
            shopCategories: { include: { category: true } },
            _count: { select: { products: true } },
          },
        },
      },
    });
    res.json(seller?.shops || []);
  },
);

router.get("/seller/:sellerId", async (req, res) => {
  const seller = await prisma.sellerProfile.findUnique({
    where: { id: req.params.sellerId },
    include: {
      user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      shops: {
        where: { isActive: true },
        include: {
          location: true,
          shopCategories: { include: { category: true } },
          products: {
            where: { isActive: true },
            include: { images: true },
            take: 12,
          },
        },
      },
    },
  });

  if (!seller) return res.status(404).json({ error: "Seller not found" });
  res.json(seller);
});

router.get("/:id", async (req, res) => {
  const shop = await prisma.shop.findUnique({
    where: { id: String(req.params.id) },
    include: {
      location: true,
      sellerProfile: {
        include: {
          user: {
            select: { id: true, name: true, phone: true, avatarUrl: true },
          },
        },
      },
      shopCategories: { include: { category: true } },
      products: {
        where: { isActive: true },
        include: { images: true, category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!shop || !shop.isActive)
    return res.status(404).json({ error: "Shop not found" });

  await prisma.shop.update({
    where: { id: shop.id },
    data: { viewCount: { increment: 1 } },
  });
  res.json(shop);
});

router.post(
  "/",
  authenticate,
  requireRole(Role.SELLER),
  requireApprovedSeller,
  upload.single("logo"),
  async (req: AuthRequest, res: Response) => {
    try {
      const seller = await prisma.sellerProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!seller)
        return res.status(404).json({ error: "Seller profile not found" });

      const { name, description, phone, businessHours } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Shop name is required" });
      }

      const logoUrl = await uploadShopLogo(req.file);

      const shop = await prisma.shop.create({
        data: {
          sellerProfileId: seller.id,
          name,
          description,
          phone,
          businessHours,
          logoUrl,
        },
      });

      const categoryIds = parseCategoryIds(req.body.categoryIds);
      if (categoryIds.length) {
        await prisma.shopCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            shopId: shop.id,
            categoryId,
          })),
        });
      }

      const result = await prisma.shop.findUnique({
        where: { id: shop.id },
        include: {
          location: true,
          shopCategories: { include: { category: true } },
        },
      });
      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create shop" });
    }
  },
);

router.patch(
  "/:id",
  authenticate,
  requireRole(Role.SELLER),
  requireApprovedSeller,
  upload.single("logo"),
  async (req: AuthRequest, res: Response) => {
    try {
      const shop = await prisma.shop.findUnique({
        where: { id: String(req.params.id) },
        include: { sellerProfile: true },
      });
      if (!shop || shop.sellerProfile.userId !== req.user!.id) {
        return res.status(404).json({ error: "Shop not found" });
      }

      const { name, description, phone, businessHours } = req.body;
      const logoUrl = await uploadShopLogo(req.file);

      await prisma.shop.update({
        where: { id: shop.id },
        data: {
          name: name ?? shop.name,
          description: description ?? shop.description,
          phone: phone ?? shop.phone,
          businessHours: businessHours ?? shop.businessHours,
          logoUrl: logoUrl ?? shop.logoUrl,
        },
      });

      const categoryIds = parseCategoryIds(req.body.categoryIds);
      if (req.body.categoryIds !== undefined) {
        await prisma.shopCategory.deleteMany({ where: { shopId: shop.id } });
        if (categoryIds.length) {
          await prisma.shopCategory.createMany({
            data: categoryIds.map((categoryId: string) => ({
              shopId: shop.id,
              categoryId,
            })),
          });
        }
      }

      const result = await prisma.shop.findUnique({
        where: { id: shop.id },
        include: {
          location: true,
          shopCategories: { include: { category: true } },
        },
      });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update shop" });
    }
  },
);

router.post(
  "/:id/location",
  authenticate,
  requireRole(Role.SELLER),
  requireApprovedSeller,
  async (req: AuthRequest, res: Response) => {
    const shop = await prisma.shop.findUnique({
      where: { id: String(req.params.id) },
      include: { sellerProfile: true },
    });
    if (!shop || shop.sellerProfile.userId !== req.user!.id) {
      return res.status(404).json({ error: "Shop not found" });
    }

    const {
      area,
      city,
      region,
      country,
      street,
      building,
      floor,
      shopNumber,
      latitude,
      longitude,
    } = req.body;
    if (!area) {
      return res.status(400).json({ error: "Area is required" });
    }

    const location = await prisma.location.upsert({
      where: { shopId: shop.id },
      create: {
        shopId: shop.id,
        area,
        city: city || "Dar es Salaam",
        region: region || "Dar es Salaam",
        country: country || "Tanzania",
        street,
        building,
        floor,
        shopNumber,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      },
      update: {
        area,
        city,
        region,
        country,
        street,
        building,
        floor,
        shopNumber,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      },
    });

    res.json(location);
  },
);

export default router;
