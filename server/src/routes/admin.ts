import { Router, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireRole(Role.ADMIN));

/**
 * Get sellers waiting for admin approval
 */
router.get('/sellers/pending', async (_req, res: Response) => {
  const sellers = await prisma.sellerProfile.findMany({
    where: {
      approvalStatus: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          isActive: true,
        },
      },
      shops: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  res.json(sellers);
});

/**
 * Approve or reject a seller
 */
router.patch('/sellers/:id/approval', async (req, res: Response) => {
  const { approvalStatus } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
    return res.status(400).json({
      error: 'Approval status must be APPROVED or REJECTED',
    });
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: req.params.id },
  });

  if (!seller) {
    return res.status(404).json({
      error: 'Seller profile not found',
    });
  }

  const updatedSeller = await prisma.sellerProfile.update({
    where: { id: seller.id },
    data: {
      approvalStatus,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  res.json(updatedSeller);
});

/**
 * Admin dashboard statistics
 */
router.get('/stats', async (_req, res: Response) => {
  const [
    totalCustomers,
    totalSellers,
    pendingSellers,
    totalProducts,
    totalShops,
    totalCategories,
    totalMessages,
    totalSearches,
    productViews,
    shopViews,
    topProducts,
    topSearches,
    popularCategories,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        roles: {
          has: Role.CUSTOMER,
        },
      },
    }),

    prisma.user.count({
      where: {
        roles: {
          has: Role.SELLER,
        },
      },
    }),

    prisma.sellerProfile.count({
      where: {
        approvalStatus: 'PENDING',
      },
    }),

    prisma.product.count(),

    prisma.shop.count(),

    prisma.category.count(),

    prisma.message.count(),

    prisma.searchLog.count(),

    prisma.productView.count(),

    prisma.shop.aggregate({
      _sum: {
        viewCount: true,
      },
    }),

    prisma.product.findMany({
      orderBy: {
        viewCount: 'desc',
      },
      take: 10,
      select: {
        id: true,
        name: true,
        viewCount: true,
        likeCount: true,
        saveCount: true,
      },
    }),

    prisma.searchLog.groupBy({
      by: ['query'],
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: 10,
    }),

    prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
            userPreferences: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      take: 10,
    }),

    prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        createdAt: true,
        isActive: true,
      },
    }),
  ]);

  res.json({
    overview: {
      totalCustomers,
      totalSellers,
      pendingSellers,
      totalProducts,
      totalShops,
      totalCategories,
      totalMessages,
      totalSearches,
      productViews,
      shopViews: shopViews._sum.viewCount || 0,
    },

    topProducts,

    topSearches: topSearches.map((s) => ({
      query: s.query,
      count: s._count.query,
    })),

    popularCategories,

    recentUsers,
  });
});

/**
 * Get admin users
 */
router.get('/users', async (req, res: Response) => {
  const {
    role,
    search,
    limit = 50,
    offset = 0,
  } = req.query;

  const where: any = {};

  if (role) {
    where.roles = {
      has: role,
    };
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: String(search),
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: String(search),
          mode: 'insensitive',
        },
      },
    ];
  }

  const users = await prisma.user.findMany({
    where,

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      roles: true,
      isActive: true,
      createdAt: true,

      _count: {
        select: {
          likes: true,
          savedProducts: true,
          sentMessages: true,
        },
      },
    },

    take: Number(limit),
    skip: Number(offset),

    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json(users);
});

/**
 * Enable / disable user
 */
router.patch('/users/:id/status', async (req, res: Response) => {
  const { isActive } = req.body;

  const user = await prisma.user.update({
    where: {
      id: req.params.id,
    },

    data: {
      isActive,
    },

    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  res.json(user);
});

/**
 * Get all products for admin
 */
router.get('/products', async (req, res: Response) => {
  const products = await prisma.product.findMany({
    include: {
      images: true,
      category: true,

      shop: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },

    take: Number(req.query.limit) || 50,
    skip: Number(req.query.offset) || 0,
  });

  res.json(products);
});

/**
 * Enable / disable product
 */
router.patch('/products/:id/status', async (req, res: Response) => {
  const { isActive } = req.body;

  const product = await prisma.product.update({
    where: {
      id: req.params.id,
    },

    data: {
      isActive,
    },
  });

  res.json(product);
});

/**
 * Get categories
 */
router.get('/categories', async (_req, res: Response) => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },

    orderBy: {
      name: 'asc',
    },
  });

  res.json(categories);
});

/**
 * Create category
 */
router.post('/categories', async (req, res: Response) => {
  const { name, icon } = req.body;

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-');

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      icon,
    },
  });

  res.status(201).json(category);
});

/**
 * Update category
 */
router.patch('/categories/:id', async (req, res: Response) => {
  const {
    name,
    icon,
    isActive,
  } = req.body;

  const category = await prisma.category.update({
    where: {
      id: req.params.id,
    },

    data: {
      name,
      icon,
      isActive,
    },
  });

  res.json(category);
});

/**
 * Get shops
 */
router.get('/shops', async (_req, res: Response) => {
  const shops = await prisma.shop.findMany({
    include: {
      location: true,

      sellerProfile: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },

      _count: {
        select: {
          products: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json(shops);
});

/**
 * Enable / disable shop
 */
router.patch('/shops/:id/status', async (req, res: Response) => {
  const { isActive } = req.body;

  const shop = await prisma.shop.update({
    where: {
      id: req.params.id,
    },

    data: {
      isActive,
    },
  });

  res.json(shop);
});

export default router;