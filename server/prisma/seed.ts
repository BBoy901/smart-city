import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
 { name: 'Fashion', slug: 'fashion', icon: 'f' },
 { name: 'Shoes', slug: 'shoes', icon: 's' },
 { name: 'Electronics', slug: 'electronics', icon: 'e' },
 { name: 'Phones', slug: 'phones', icon: 'p' },
 { name: 'Cosmetics', slug: 'cosmetics', icon: 'cs' },
 { name: 'Furniture', slug: 'furniture', icon: 'fe' },
 { name: 'Accessories', slug: 'accessories', icon: 'as' },
 { name: 'Food', slug: 'food', icon: 'fd' },
 { name: 'Household', slug: 'household', icon: 'hd' },
 { name: 'Other', slug: 'other', icon: 'or' },
];

async function main() {
  console.log('Seeding Smart City database...');

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { icon: cat.icon },
    });
  }

  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@smartcity.co.tz' },
    create: {
      email: 'admin@smartcity.co.tz',
      passwordHash: adminHash,
      name: 'Smart City Admin',
      roles: [Role.ADMIN],
      activeMode: 'CUSTOMER',
    },
    update: {},
  });

  const sellerHash = await bcrypt.hash('seller123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@kariakoo.co.tz' },
    create: {
      email: 'seller@kariakoo.co.tz',
      passwordHash: sellerHash,
      name: 'ABC Shoes',
      phone: '+255712345678',
      roles: [Role.SELLER],
      activeMode: 'SELLER',
      sellerProfile: { create: { description: 'Quality shoes in Kariakoo since 2010' } },
    },
    update: {},
    include: { sellerProfile: true },
  });

  let sellerProfile = seller.sellerProfile;
  if (!sellerProfile) {
    sellerProfile = await prisma.sellerProfile.create({ data: { userId: seller.id } });
  }

  const fashionCat = await prisma.category.findUnique({ where: { slug: 'shoes' } });
  const electronicsCat = await prisma.category.findUnique({ where: { slug: 'electronics' } });

  const shop = await prisma.shop.upsert({
    where: { id: 'seed-shop-abc' },
    create: {
      id: 'seed-shop-abc',
      sellerProfileId: sellerProfile.id,
      name: 'ABC Shoes',
      description: 'Your trusted shoe store in Kariakoo. Sneakers, formal shoes, and more.',
      phone: '+255712345678',
      businessHours: 'Mon-Sat: 8:00 AM - 7:00 PM',
      location: {
        create: {
          area: 'Kariakoo',
          city: 'Dar es Salaam',
          street: 'Msimbazi Street',
          building: 'Kariakoo Market',
          floor: '2',
          shopNumber: '24',
          latitude: -6.8167,
          longitude: 39.2833,
        },
      },
      shopCategories: fashionCat ? { create: [{ categoryId: fashionCat.id }] } : undefined,
    },
    update: {},
  });

  const sampleProducts = [
  { name: 'Nike Air Max', description: 'Classic Nike Air Max sneakers, comfortable and stylish.', price: 85000, categoryId: fashionCat?.id },
  { name: 'Adidas Ultraboost', description: 'Premium running shoes with boost technology.', price: 120000, categoryId: fashionCat?.id },
  { name: 'Leather Formal Shoes', description: 'Elegant black leather formal shoes for office.', price: 65000, categoryId: fashionCat?.id },
  { name: 'Canvas Sneakers', description: 'Casual canvas sneakers, multiple colors available.', price: 35000, categoryId: fashionCat?.id },
  ];

  for (const p of sampleProducts) {
    const existing = await prisma.product.findFirst({ where: { name: p.name, shopId: shop.id } });
    if (!existing) {
      await prisma.product.create({
        data: {
          shopId: shop.id,
          name: p.name,
          description: p.description,
          price: p.price,
          categoryId: p.categoryId,
          availability: 'IN_STOCK',
        },
      });
    }
  }

  const seller2Hash = await bcrypt.hash('seller123', 10);
  const seller2 = await prisma.user.upsert({
    where: { email: 'tech@kariakoo.co.tz' },
    create: {
      email: 'tech@kariakoo.co.tz',
      passwordHash: seller2Hash,
      name: 'Kariakoo Tech Hub',
      phone: '+255723456789',
      roles: [Role.SELLER],
      activeMode: 'SELLER',
      sellerProfile: { create: { description: 'Phones, accessories and electronics' } },
    },
    update: {},
    include: { sellerProfile: true },
  });

  let seller2Profile = seller2.sellerProfile;
  if (!seller2Profile) {
    seller2Profile = await prisma.sellerProfile.create({ data: { userId: seller2.id } });
  }

  const techShop = await prisma.shop.upsert({
    where: { id: 'seed-shop-tech' },
    create: {
      id: 'seed-shop-tech',
      sellerProfileId: seller2Profile.id,
      name: 'Kariakoo Tech Hub',
      description: 'Latest phones and electronics at best prices.',
      phone: '+255723456789',
      businessHours: 'Mon-Sun: 9:00 AM - 8:00 PM',
      location: {
        create: {
          area: 'Kariakoo',
          city: 'Dar es Salaam',
          street: 'Jamhuri Street',
          building: 'Tech Plaza',
          floor: '1',
          shopNumber: '12',
          latitude: -6.8175,
          longitude: 39.2840,
        },
      },
      shopCategories: electronicsCat ? { create: [{ categoryId: electronicsCat.id }] } : undefined,
    },
    update: {},
  });

  const techProducts = [
    { name: 'Samsung Galaxy A54', description: 'Latest Samsung mid-range smartphone.', price: 650000, categoryId: electronicsCat?.id },
    { name: 'iPhone 13', description: 'Apple iPhone 13, excellent condition.', price: 1200000, categoryId: electronicsCat?.id },
    { name: 'Wireless Earbuds', description: 'Bluetooth 5.0 wireless earbuds with charging case.', price: 45000, categoryId: electronicsCat?.id },
    { name: 'Phone Charger Fast', description: 'USB-C fast charger 25W.', price: 25000, categoryId: electronicsCat?.id },
  ];

  for (const p of techProducts) {
    const existing = await prisma.product.findFirst({ where: { name: p.name, shopId: techShop.id } });
    if (!existing) {
      await prisma.product.create({
        data: {
          shopId: techShop.id,
          name: p.name,
          description: p.description,
          price: p.price,
          categoryId: p.categoryId,
          availability: 'IN_STOCK',
        },
      });
    }
  }

  const customerHash = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    create: {
      email: 'customer@example.com',
      passwordHash: customerHash,
      name: 'Amina Hassan',
      roles: [Role.CUSTOMER],
      activeMode: 'CUSTOMER',
      customerProfile: { create: {} },
    },
    update: {},
  });

  console.log('Seed completed!');
  console.log('Admin: admin@smartcity.co.tz / admin123');
  console.log('Seller: seller@kariakoo.co.tz / seller123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
