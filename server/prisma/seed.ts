import { PrismaClient, Role, ActiveMode, SellerApproval, Availability, MessageType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SmartCity demo database...");
  await prisma.$transaction(
    async (tx) => {
    // DEVELOPMENT ONLY: clears the existing application data before reseeding.
    await tx.messageHiddenForUser.deleteMany();
    await tx.conversationHiddenForUser.deleteMany();
    await tx.message.deleteMany();
    await tx.conversationParticipant.deleteMany();
    await tx.conversation.deleteMany();
    await tx.recentlyViewed.deleteMany();
    await tx.productView.deleteMany();
    await tx.savedProduct.deleteMany();
    await tx.like.deleteMany();
    await tx.userPreference.deleteMany();
    await tx.productImage.deleteMany();
    await tx.product.deleteMany();
    await tx.shopCategory.deleteMany();
    await tx.location.deleteMany();
    await tx.shop.deleteMany();
    await tx.sellerProfile.deleteMany();
    await tx.customerProfile.deleteMany();
    await tx.user.deleteMany();
    await tx.category.deleteMany();

    const categoryData = [
      { name: "Electronics", slug: "electronics", icon: "category" },
      { name: "Phones & Tablets", slug: "phones-tablets", icon: "category" },
      { name: "Computers & Accessories", slug: "computers", icon: "category" },
      { name: "Home Appliances", slug: "home-appliances", icon: "category" },
      { name: "Furniture", slug: "furniture", icon: "category" },
      { name: "Fashion", slug: "fashion", icon: "category" },
      { name: "Shoes", slug: "shoes", icon: "category" },
      { name: "Beauty & Personal Care", slug: "beauty", icon: "category" },
      { name: "Automotive", slug: "automotive", icon: "category" },
      { name: "Motorcycles", slug: "motorcycles", icon: "category" },
      { name: "Auto Parts", slug: "auto-parts", icon: "category" },
      { name: "Home & Garden", slug: "home-garden", icon: "category" },
      { name: "Sports & Fitness", slug: "sports", icon: "category" },
      { name: "Baby & Kids", slug: "baby-kids", icon: "category" },
      { name: "Groceries", slug: "groceries", icon: "category" },
      { name: "Tools & Hardware", slug: "tools", icon: "category" },
      { name: "Building Materials", slug: "building-materials", icon: "category" },
      { name: "Office & Stationery", slug: "office-stationery", icon: "category" },
      { name: "Music & Instruments", slug: "music-instruments", icon: "category" },
      { name: "Services", slug: "services", icon: "category" },
    ];
    const categories = [];
    for (const data of categoryData) categories.push(await tx.category.create({ data }));

    const users: Record<string, any> = {};
    users["seller1@smartcity.com"] = await tx.user.create({ data: { email: "seller1@smartcity.com", passwordHash: await bcrypt.hash("seller1", 10), name: "Seller 1", phone: "+25571000001", roles: [Role.CUSTOMER, Role.SELLER], activeMode: ActiveMode.SELLER, isActive: true } });
    await tx.sellerProfile.create({ data: { userId: users["seller1@smartcity.com"].id, description: "SmartCity demo seller 1", approvalStatus: SellerApproval.APPROVED } });
    await tx.customerProfile.create({ data: { userId: users["seller1@smartcity.com"].id, bio: "Customer and seller demo account 1" } });
    users["seller2@smartcity.com"] = await tx.user.create({ data: { email: "seller2@smartcity.com", passwordHash: await bcrypt.hash("seller2", 10), name: "Seller 2", phone: "+25571000002", roles: [Role.CUSTOMER, Role.SELLER], activeMode: ActiveMode.SELLER, isActive: true } });
    await tx.sellerProfile.create({ data: { userId: users["seller2@smartcity.com"].id, description: "SmartCity demo seller 2", approvalStatus: SellerApproval.APPROVED } });
    await tx.customerProfile.create({ data: { userId: users["seller2@smartcity.com"].id, bio: "Customer and seller demo account 2" } });
    users["seller3@smartcity.com"] = await tx.user.create({ data: { email: "seller3@smartcity.com", passwordHash: await bcrypt.hash("seller3", 10), name: "Seller 3", phone: "+25571000003", roles: [Role.CUSTOMER, Role.SELLER], activeMode: ActiveMode.SELLER, isActive: true } });
    await tx.sellerProfile.create({ data: { userId: users["seller3@smartcity.com"].id, description: "SmartCity demo seller 3", approvalStatus: SellerApproval.APPROVED } });
    await tx.customerProfile.create({ data: { userId: users["seller3@smartcity.com"].id, bio: "Customer and seller demo account 3" } });
    users["seller4@smartcity.com"] = await tx.user.create({ data: { email: "seller4@smartcity.com", passwordHash: await bcrypt.hash("seller4", 10), name: "Seller 4", phone: "+25571000004", roles: [Role.CUSTOMER, Role.SELLER], activeMode: ActiveMode.SELLER, isActive: true } });
    await tx.sellerProfile.create({ data: { userId: users["seller4@smartcity.com"].id, description: "SmartCity demo seller 4", approvalStatus: SellerApproval.APPROVED } });
    await tx.customerProfile.create({ data: { userId: users["seller4@smartcity.com"].id, bio: "Customer and seller demo account 4" } });
    users["seller5@smartcity.com"] = await tx.user.create({ data: { email: "seller5@smartcity.com", passwordHash: await bcrypt.hash("seller5", 10), name: "Seller 5", phone: "+25571000005", roles: [Role.CUSTOMER, Role.SELLER], activeMode: ActiveMode.SELLER, isActive: true } });
    await tx.sellerProfile.create({ data: { userId: users["seller5@smartcity.com"].id, description: "SmartCity demo seller 5", approvalStatus: SellerApproval.APPROVED } });
    await tx.customerProfile.create({ data: { userId: users["seller5@smartcity.com"].id, bio: "Customer and seller demo account 5" } });
    users["seller6@smartcity.com"] = await tx.user.create({ data: { email: "seller6@smartcity.com", passwordHash: await bcrypt.hash("seller6", 10), name: "Seller 6", phone: "+25571000006", roles: [Role.SELLER], activeMode: ActiveMode.SELLER, isActive: true } });
    await tx.sellerProfile.create({ data: { userId: users["seller6@smartcity.com"].id, description: "SmartCity demo seller 6", approvalStatus: SellerApproval.APPROVED } });
    users["seller7@smartcity.com"] = await tx.user.create({ data: { email: "seller7@smartcity.com", passwordHash: await bcrypt.hash("seller7", 10), name: "Seller 7", phone: "+25571000007", roles: [Role.SELLER], activeMode: ActiveMode.SELLER, isActive: true } });
    await tx.sellerProfile.create({ data: { userId: users["seller7@smartcity.com"].id, description: "SmartCity demo seller 7", approvalStatus: SellerApproval.APPROVED } });
    users["customer1@smartcity.com"] = await tx.user.create({ data: { email: "customer1@smartcity.com", passwordHash: await bcrypt.hash("customer1", 10), name: "Customer 1", phone: "+25572000001", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer1@smartcity.com"].id, bio: "SmartCity demo customer 1" } });
    users["customer2@smartcity.com"] = await tx.user.create({ data: { email: "customer2@smartcity.com", passwordHash: await bcrypt.hash("customer2", 10), name: "Customer 2", phone: "+25572000002", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer2@smartcity.com"].id, bio: "SmartCity demo customer 2" } });
    users["customer3@smartcity.com"] = await tx.user.create({ data: { email: "customer3@smartcity.com", passwordHash: await bcrypt.hash("customer3", 10), name: "Customer 3", phone: "+25572000003", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer3@smartcity.com"].id, bio: "SmartCity demo customer 3" } });
    users["customer4@smartcity.com"] = await tx.user.create({ data: { email: "customer4@smartcity.com", passwordHash: await bcrypt.hash("customer4", 10), name: "Customer 4", phone: "+25572000004", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer4@smartcity.com"].id, bio: "SmartCity demo customer 4" } });
    users["customer5@smartcity.com"] = await tx.user.create({ data: { email: "customer5@smartcity.com", passwordHash: await bcrypt.hash("customer5", 10), name: "Customer 5", phone: "+25572000005", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer5@smartcity.com"].id, bio: "SmartCity demo customer 5" } });
    users["customer6@smartcity.com"] = await tx.user.create({ data: { email: "customer6@smartcity.com", passwordHash: await bcrypt.hash("customer6", 10), name: "Customer 6", phone: "+25572000006", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer6@smartcity.com"].id, bio: "SmartCity demo customer 6" } });
    users["customer7@smartcity.com"] = await tx.user.create({ data: { email: "customer7@smartcity.com", passwordHash: await bcrypt.hash("customer7", 10), name: "Customer 7", phone: "+25572000007", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer7@smartcity.com"].id, bio: "SmartCity demo customer 7" } });
    users["customer8@smartcity.com"] = await tx.user.create({ data: { email: "customer8@smartcity.com", passwordHash: await bcrypt.hash("customer8", 10), name: "Customer 8", phone: "+25572000008", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer8@smartcity.com"].id, bio: "SmartCity demo customer 8" } });
    users["customer9@smartcity.com"] = await tx.user.create({ data: { email: "customer9@smartcity.com", passwordHash: await bcrypt.hash("customer9", 10), name: "Customer 9", phone: "+25572000009", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer9@smartcity.com"].id, bio: "SmartCity demo customer 9" } });
    users["customer10@smartcity.com"] = await tx.user.create({ data: { email: "customer10@smartcity.com", passwordHash: await bcrypt.hash("customer10", 10), name: "Customer 10", phone: "+25572000010", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer10@smartcity.com"].id, bio: "SmartCity demo customer 10" } });
    users["customer11@smartcity.com"] = await tx.user.create({ data: { email: "customer11@smartcity.com", passwordHash: await bcrypt.hash("customer11", 10), name: "Customer 11", phone: "+25572000011", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer11@smartcity.com"].id, bio: "SmartCity demo customer 11" } });
    users["customer12@smartcity.com"] = await tx.user.create({ data: { email: "customer12@smartcity.com", passwordHash: await bcrypt.hash("customer12", 10), name: "Customer 12", phone: "+25572000012", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer12@smartcity.com"].id, bio: "SmartCity demo customer 12" } });
    users["customer13@smartcity.com"] = await tx.user.create({ data: { email: "customer13@smartcity.com", passwordHash: await bcrypt.hash("customer13", 10), name: "Customer 13", phone: "+25572000013", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer13@smartcity.com"].id, bio: "SmartCity demo customer 13" } });
    users["customer14@smartcity.com"] = await tx.user.create({ data: { email: "customer14@smartcity.com", passwordHash: await bcrypt.hash("customer14", 10), name: "Customer 14", phone: "+25572000014", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer14@smartcity.com"].id, bio: "SmartCity demo customer 14" } });
    users["customer15@smartcity.com"] = await tx.user.create({ data: { email: "customer15@smartcity.com", passwordHash: await bcrypt.hash("customer15", 10), name: "Customer 15", phone: "+25572000015", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer15@smartcity.com"].id, bio: "SmartCity demo customer 15" } });
    users["customer16@smartcity.com"] = await tx.user.create({ data: { email: "customer16@smartcity.com", passwordHash: await bcrypt.hash("customer16", 10), name: "Customer 16", phone: "+25572000016", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer16@smartcity.com"].id, bio: "SmartCity demo customer 16" } });
    users["customer17@smartcity.com"] = await tx.user.create({ data: { email: "customer17@smartcity.com", passwordHash: await bcrypt.hash("customer17", 10), name: "Customer 17", phone: "+25572000017", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer17@smartcity.com"].id, bio: "SmartCity demo customer 17" } });
    users["customer18@smartcity.com"] = await tx.user.create({ data: { email: "customer18@smartcity.com", passwordHash: await bcrypt.hash("customer18", 10), name: "Customer 18", phone: "+25572000018", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer18@smartcity.com"].id, bio: "SmartCity demo customer 18" } });
    users["customer19@smartcity.com"] = await tx.user.create({ data: { email: "customer19@smartcity.com", passwordHash: await bcrypt.hash("customer19", 10), name: "Customer 19", phone: "+25572000019", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer19@smartcity.com"].id, bio: "SmartCity demo customer 19" } });
    users["customer20@smartcity.com"] = await tx.user.create({ data: { email: "customer20@smartcity.com", passwordHash: await bcrypt.hash("customer20", 10), name: "Customer 20", phone: "+25572000020", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer20@smartcity.com"].id, bio: "SmartCity demo customer 20" } });
    users["customer21@smartcity.com"] = await tx.user.create({ data: { email: "customer21@smartcity.com", passwordHash: await bcrypt.hash("customer21", 10), name: "Customer 21", phone: "+25572000021", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer21@smartcity.com"].id, bio: "SmartCity demo customer 21" } });
    users["customer22@smartcity.com"] = await tx.user.create({ data: { email: "customer22@smartcity.com", passwordHash: await bcrypt.hash("customer22", 10), name: "Customer 22", phone: "+25572000022", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer22@smartcity.com"].id, bio: "SmartCity demo customer 22" } });
    users["customer23@smartcity.com"] = await tx.user.create({ data: { email: "customer23@smartcity.com", passwordHash: await bcrypt.hash("customer23", 10), name: "Customer 23", phone: "+25572000023", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer23@smartcity.com"].id, bio: "SmartCity demo customer 23" } });
    users["customer24@smartcity.com"] = await tx.user.create({ data: { email: "customer24@smartcity.com", passwordHash: await bcrypt.hash("customer24", 10), name: "Customer 24", phone: "+25572000024", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer24@smartcity.com"].id, bio: "SmartCity demo customer 24" } });
    users["customer25@smartcity.com"] = await tx.user.create({ data: { email: "customer25@smartcity.com", passwordHash: await bcrypt.hash("customer25", 10), name: "Customer 25", phone: "+25572000025", roles: [Role.CUSTOMER], activeMode: ActiveMode.CUSTOMER, isActive: true } });
    await tx.customerProfile.create({ data: { userId: users["customer25@smartcity.com"].id, bio: "SmartCity demo customer 25" } });

    const shops = [];
    const shop1 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller1@smartcity.com"].id } })).id, name: "Mtaa Market", description: "SmartCity demo marketplace shop", phone: "+25573000001", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop1);
    await tx.location.create({ data: { shopId: shop1.id, area: "Kinondoni", street: "Demo Street 1", building: "Block 1", shopNumber: "S01" } });
    const shop2 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller2@smartcity.com"].id } })).id, name: "Kariakoo Traders", description: "SmartCity demo marketplace shop", phone: "+25573000002", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop2);
    await tx.location.create({ data: { shopId: shop2.id, area: "Ilala", street: "Demo Street 2", building: "Block 2", shopNumber: "S02" } });
    const shop3 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller3@smartcity.com"].id } })).id, name: "City Choice", description: "SmartCity demo marketplace shop", phone: "+25573000003", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop3);
    await tx.location.create({ data: { shopId: shop3.id, area: "Temeke", street: "Demo Street 3", building: "Block 3", shopNumber: "S03" } });
    const shop4 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller4@smartcity.com"].id } })).id, name: "Urban Hub", description: "SmartCity demo marketplace shop", phone: "+25573000004", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop4);
    await tx.location.create({ data: { shopId: shop4.id, area: "Ubungo", street: "Demo Street 4", building: "Block 4", shopNumber: "S04" } });
    const shop5 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller5@smartcity.com"].id } })).id, name: "Smart Deals", description: "SmartCity demo marketplace shop", phone: "+25573000005", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop5);
    await tx.location.create({ data: { shopId: shop5.id, area: "Mikocheni", street: "Demo Street 5", building: "Block 5", shopNumber: "S05" } });
    const shop6 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller6@smartcity.com"].id } })).id, name: "Mlimani Store", description: "SmartCity demo marketplace shop", phone: "+25573000006", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop6);
    await tx.location.create({ data: { shopId: shop6.id, area: "Sinza", street: "Demo Street 6", building: "Block 6", shopNumber: "S06" } });
    const shop7 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller7@smartcity.com"].id } })).id, name: "Dar Commerce", description: "SmartCity demo marketplace shop", phone: "+25573000007", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop7);
    await tx.location.create({ data: { shopId: shop7.id, area: "Kariakoo", street: "Demo Street 7", building: "Block 7", shopNumber: "S07" } });
    const shop8 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller1@smartcity.com"].id } })).id, name: "Bongo Mart", description: "SmartCity demo marketplace shop", phone: "+25573000008", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop8);
    await tx.location.create({ data: { shopId: shop8.id, area: "Masaki", street: "Demo Street 8", building: "Block 8", shopNumber: "S08" } });
    const shop9 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller2@smartcity.com"].id } })).id, name: "Jiji Point", description: "SmartCity demo marketplace shop", phone: "+25573000009", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop9);
    await tx.location.create({ data: { shopId: shop9.id, area: "Mbezi", street: "Demo Street 9", building: "Block 9", shopNumber: "S09" } });
    const shop10 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller3@smartcity.com"].id } })).id, name: "Mbezi Marketplace", description: "SmartCity demo marketplace shop", phone: "+25573000010", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop10);
    await tx.location.create({ data: { shopId: shop10.id, area: "Kawe", street: "Demo Street 10", building: "Block 10", shopNumber: "S10" } });
    const shop11 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller4@smartcity.com"].id } })).id, name: "Sinza Centre", description: "SmartCity demo marketplace shop", phone: "+25573000011", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop11);
    await tx.location.create({ data: { shopId: shop11.id, area: "Kijitonyama", street: "Demo Street 11", building: "Block 11", shopNumber: "S11" } });
    const shop12 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller5@smartcity.com"].id } })).id, name: "Masaki Select", description: "SmartCity demo marketplace shop", phone: "+25573000012", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop12);
    await tx.location.create({ data: { shopId: shop12.id, area: "Tabata", street: "Demo Street 12", building: "Block 12", shopNumber: "S12" } });
    const shop13 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller6@smartcity.com"].id } })).id, name: "Ubungo Trade", description: "SmartCity demo marketplace shop", phone: "+25573000013", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop13);
    await tx.location.create({ data: { shopId: shop13.id, area: "Mwenge", street: "Demo Street 13", building: "Block 13", shopNumber: "S13" } });
    const shop14 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller7@smartcity.com"].id } })).id, name: "Temeke Mall", description: "SmartCity demo marketplace shop", phone: "+25573000014", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop14);
    await tx.location.create({ data: { shopId: shop14.id, area: "Manzese", street: "Demo Street 14", building: "Block 14", shopNumber: "S14" } });
    const shop15 = await tx.shop.create({ data: { sellerProfileId: (await tx.sellerProfile.findUniqueOrThrow({ where: { userId: users["seller1@smartcity.com"].id } })).id, name: "Kinondoni Goods", description: "SmartCity demo marketplace shop", phone: "+25573000015", businessHours: "Mon-Sat 08:00-18:00" } });
    shops.push(shop15);
    await tx.location.create({ data: { shopId: shop15.id, area: "Kimara", street: "Demo Street 15", building: "Block 15", shopNumber: "S15" } });

    await tx.shopCategory.createMany({ data: [{ shopId: shop1.id, categoryId: categories[0].id }, { shopId: shop1.id, categoryId: categories[3].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop2.id, categoryId: categories[1].id }, { shopId: shop2.id, categoryId: categories[6].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop3.id, categoryId: categories[2].id }, { shopId: shop3.id, categoryId: categories[9].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop4.id, categoryId: categories[3].id }, { shopId: shop4.id, categoryId: categories[12].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop5.id, categoryId: categories[4].id }, { shopId: shop5.id, categoryId: categories[15].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop6.id, categoryId: categories[5].id }, { shopId: shop6.id, categoryId: categories[18].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop7.id, categoryId: categories[6].id }, { shopId: shop7.id, categoryId: categories[1].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop8.id, categoryId: categories[7].id }, { shopId: shop8.id, categoryId: categories[4].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop9.id, categoryId: categories[8].id }, { shopId: shop9.id, categoryId: categories[7].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop10.id, categoryId: categories[9].id }, { shopId: shop10.id, categoryId: categories[10].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop11.id, categoryId: categories[10].id }, { shopId: shop11.id, categoryId: categories[13].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop12.id, categoryId: categories[11].id }, { shopId: shop12.id, categoryId: categories[16].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop13.id, categoryId: categories[12].id }, { shopId: shop13.id, categoryId: categories[19].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop14.id, categoryId: categories[13].id }, { shopId: shop14.id, categoryId: categories[2].id }], skipDuplicates: true });
    await tx.shopCategory.createMany({ data: [{ shopId: shop15.id, categoryId: categories[14].id }, { shopId: shop15.id, categoryId: categories[5].id }], skipDuplicates: true });

    const products = [];

    // Stable, browser-loadable online demo photos.
    // Each product gets a deterministic, unique image seed so the catalogue
    // does not repeat the same placeholder image across products.
    // Picsum serves real online photography; no generated image files are
    // added to the project.
    const demoImageUrl = (name: string, index: number) => {
      const seed = index > 100
        ? `smartcity-secondary-${index}`
        : `smartcity-product-${index}`;
      return `https://picsum.photos/seed/${seed}/900/700`;
    };

    const p1 = await tx.product.create({ data: { shopId: shop1.id, categoryId: categories[0].id, name: "Smart LED TV 43-inch", description: "Demo listing for Smart LED TV 43-inch, suitable for SmartCity marketplace testing.", price: 650000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 3, likeCount: 1, saveCount: 1 } });
    products.push(p1);
    await tx.productImage.create({ data: { productId: p1.id, url: demoImageUrl(p1.name, 1), isPrimary: true, sortOrder: 0 } });
    const p2 = await tx.product.create({ data: { shopId: shop2.id, categoryId: categories[0].id, name: "Bluetooth Speaker", description: "Demo listing for Bluetooth Speaker, suitable for SmartCity marketplace testing.", price: 180000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 6, likeCount: 2, saveCount: 2 } });
    products.push(p2);
    await tx.productImage.create({ data: { productId: p2.id, url: demoImageUrl(p2.name, 2), isPrimary: true, sortOrder: 0 } });
    const p3 = await tx.product.create({ data: { shopId: shop3.id, categoryId: categories[0].id, name: "Wireless Headphones", description: "Demo listing for Wireless Headphones, suitable for SmartCity marketplace testing.", price: 150000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 9, likeCount: 3, saveCount: 3 } });
    products.push(p3);
    await tx.productImage.create({ data: { productId: p3.id, url: demoImageUrl(p3.name, 3), isPrimary: true, sortOrder: 0 } });
    const p4 = await tx.product.create({ data: { shopId: shop4.id, categoryId: categories[0].id, name: "Power Bank 20000mAh", description: "Demo listing for Power Bank 20000mAh, suitable for SmartCity marketplace testing.", price: 70000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 12, likeCount: 4, saveCount: 4 } });
    products.push(p4);
    await tx.productImage.create({ data: { productId: p4.id, url: demoImageUrl(p4.name, 4), isPrimary: true, sortOrder: 0 } });
    const p5 = await tx.product.create({ data: { shopId: shop5.id, categoryId: categories[0].id, name: "Smart Watch", description: "Demo listing for Smart Watch, suitable for SmartCity marketplace testing.", price: 120000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 15, likeCount: 5, saveCount: 5 } });
    products.push(p5);
    await tx.productImage.create({ data: { productId: p5.id, url: demoImageUrl(p5.name, 5), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p5.id, url: demoImageUrl(p5.name, 105), isPrimary: false, sortOrder: 1 } });
    const p6 = await tx.product.create({ data: { shopId: shop6.id, categoryId: categories[1].id, name: "Samsung Galaxy A15", description: "Demo listing for Samsung Galaxy A15, suitable for SmartCity marketplace testing.", price: 520000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 18, likeCount: 6, saveCount: 6 } });
    products.push(p6);
    await tx.productImage.create({ data: { productId: p6.id, url: demoImageUrl(p6.name, 6), isPrimary: true, sortOrder: 0 } });
    const p7 = await tx.product.create({ data: { shopId: shop7.id, categoryId: categories[1].id, name: "iPhone 13", description: "Demo listing for iPhone 13, suitable for SmartCity marketplace testing.", price: 1250000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 21, likeCount: 7, saveCount: 7 } });
    products.push(p7);
    await tx.productImage.create({ data: { productId: p7.id, url: demoImageUrl(p7.name, 7), isPrimary: true, sortOrder: 0 } });
    const p8 = await tx.product.create({ data: { shopId: shop8.id, categoryId: categories[1].id, name: "Redmi Note 13", description: "Demo listing for Redmi Note 13, suitable for SmartCity marketplace testing.", price: 650000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 24, likeCount: 8, saveCount: 8 } });
    products.push(p8);
    await tx.productImage.create({ data: { productId: p8.id, url: demoImageUrl(p8.name, 8), isPrimary: true, sortOrder: 0 } });
    const p9 = await tx.product.create({ data: { shopId: shop9.id, categoryId: categories[1].id, name: "iPad 10th Gen", description: "Demo listing for iPad 10th Gen, suitable for SmartCity marketplace testing.", price: 1350000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 27, likeCount: 9, saveCount: 0 } });
    products.push(p9);
    await tx.productImage.create({ data: { productId: p9.id, url: demoImageUrl(p9.name, 9), isPrimary: true, sortOrder: 0 } });
    const p10 = await tx.product.create({ data: { shopId: shop10.id, categoryId: categories[1].id, name: "Tecno Camon 30", description: "Demo listing for Tecno Camon 30, suitable for SmartCity marketplace testing.", price: 680000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 30, likeCount: 10, saveCount: 1 } });
    products.push(p10);
    await tx.productImage.create({ data: { productId: p10.id, url: demoImageUrl(p10.name, 10), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p10.id, url: demoImageUrl(p10.name, 110), isPrimary: false, sortOrder: 1 } });
    const p11 = await tx.product.create({ data: { shopId: shop11.id, categoryId: categories[2].id, name: "HP EliteBook Laptop", description: "Demo listing for HP EliteBook Laptop, suitable for SmartCity marketplace testing.", price: 850000, currency: "TSh", availability: Availability.LOW_STOCK, isActive: true, viewCount: 33, likeCount: 11, saveCount: 2 } });
    products.push(p11);
    await tx.productImage.create({ data: { productId: p11.id, url: demoImageUrl(p11.name, 11), isPrimary: true, sortOrder: 0 } });
    const p12 = await tx.product.create({ data: { shopId: shop12.id, categoryId: categories[2].id, name: "Dell Latitude Laptop", description: "Demo listing for Dell Latitude Laptop, suitable for SmartCity marketplace testing.", price: 900000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 36, likeCount: 12, saveCount: 3 } });
    products.push(p12);
    await tx.productImage.create({ data: { productId: p12.id, url: demoImageUrl(p12.name, 12), isPrimary: true, sortOrder: 0 } });
    const p13 = await tx.product.create({ data: { shopId: shop13.id, categoryId: categories[2].id, name: "Gaming Keyboard", description: "Demo listing for Gaming Keyboard, suitable for SmartCity marketplace testing.", price: 80000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 39, likeCount: 0, saveCount: 4 } });
    products.push(p13);
    await tx.productImage.create({ data: { productId: p13.id, url: demoImageUrl(p13.name, 13), isPrimary: true, sortOrder: 0 } });
    const p14 = await tx.product.create({ data: { shopId: shop14.id, categoryId: categories[2].id, name: "Wireless Mouse", description: "Demo listing for Wireless Mouse, suitable for SmartCity marketplace testing.", price: 35000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 42, likeCount: 1, saveCount: 5 } });
    products.push(p14);
    await tx.productImage.create({ data: { productId: p14.id, url: demoImageUrl(p14.name, 14), isPrimary: true, sortOrder: 0 } });
    const p15 = await tx.product.create({ data: { shopId: shop15.id, categoryId: categories[2].id, name: "24-inch Monitor", description: "Demo listing for 24-inch Monitor, suitable for SmartCity marketplace testing.", price: 420000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 45, likeCount: 2, saveCount: 6 } });
    products.push(p15);
    await tx.productImage.create({ data: { productId: p15.id, url: demoImageUrl(p15.name, 15), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p15.id, url: demoImageUrl(p15.name, 115), isPrimary: false, sortOrder: 1 } });
    const p16 = await tx.product.create({ data: { shopId: shop1.id, categoryId: categories[3].id, name: "Hisense Refrigerator", description: "Demo listing for Hisense Refrigerator, suitable for SmartCity marketplace testing.", price: 1100000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 48, likeCount: 3, saveCount: 7 } });
    products.push(p16);
    await tx.productImage.create({ data: { productId: p16.id, url: demoImageUrl(p16.name, 16), isPrimary: true, sortOrder: 0 } });
    const p17 = await tx.product.create({ data: { shopId: shop2.id, categoryId: categories[3].id, name: "Microwave Oven", description: "Demo listing for Microwave Oven, suitable for SmartCity marketplace testing.", price: 280000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 51, likeCount: 4, saveCount: 8 } });
    products.push(p17);
    await tx.productImage.create({ data: { productId: p17.id, url: demoImageUrl(p17.name, 17), isPrimary: true, sortOrder: 0 } });
    const p18 = await tx.product.create({ data: { shopId: shop3.id, categoryId: categories[3].id, name: "Electric Blender", description: "Demo listing for Electric Blender, suitable for SmartCity marketplace testing.", price: 95000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 54, likeCount: 5, saveCount: 0 } });
    products.push(p18);
    await tx.productImage.create({ data: { productId: p18.id, url: demoImageUrl(p18.name, 18), isPrimary: true, sortOrder: 0 } });
    const p19 = await tx.product.create({ data: { shopId: shop4.id, categoryId: categories[3].id, name: "Standing Fan", description: "Demo listing for Standing Fan, suitable for SmartCity marketplace testing.", price: 120000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 57, likeCount: 6, saveCount: 1 } });
    products.push(p19);
    await tx.productImage.create({ data: { productId: p19.id, url: demoImageUrl(p19.name, 19), isPrimary: true, sortOrder: 0 } });
    const p20 = await tx.product.create({ data: { shopId: shop5.id, categoryId: categories[3].id, name: "Rice Cooker", description: "Demo listing for Rice Cooker, suitable for SmartCity marketplace testing.", price: 150000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 60, likeCount: 7, saveCount: 2 } });
    products.push(p20);
    await tx.productImage.create({ data: { productId: p20.id, url: demoImageUrl(p20.name, 20), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p20.id, url: demoImageUrl(p20.name, 120), isPrimary: false, sortOrder: 1 } });
    const p21 = await tx.product.create({ data: { shopId: shop6.id, categoryId: categories[4].id, name: "Modern Sofa Set", description: "Demo listing for Modern Sofa Set, suitable for SmartCity marketplace testing.", price: 950000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 63, likeCount: 8, saveCount: 3 } });
    products.push(p21);
    await tx.productImage.create({ data: { productId: p21.id, url: demoImageUrl(p21.name, 21), isPrimary: true, sortOrder: 0 } });
    const p22 = await tx.product.create({ data: { shopId: shop7.id, categoryId: categories[4].id, name: "6-Seater Dining Table", description: "Demo listing for 6-Seater Dining Table, suitable for SmartCity marketplace testing.", price: 750000, currency: "TSh", availability: Availability.LOW_STOCK, isActive: true, viewCount: 66, likeCount: 9, saveCount: 4 } });
    products.push(p22);
    await tx.productImage.create({ data: { productId: p22.id, url: demoImageUrl(p22.name, 22), isPrimary: true, sortOrder: 0 } });
    const p23 = await tx.product.create({ data: { shopId: shop8.id, categoryId: categories[4].id, name: "Office Desk", description: "Demo listing for Office Desk, suitable for SmartCity marketplace testing.", price: 450000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 69, likeCount: 10, saveCount: 5 } });
    products.push(p23);
    await tx.productImage.create({ data: { productId: p23.id, url: demoImageUrl(p23.name, 23), isPrimary: true, sortOrder: 0 } });
    const p24 = await tx.product.create({ data: { shopId: shop9.id, categoryId: categories[4].id, name: "Wardrobe", description: "Demo listing for Wardrobe, suitable for SmartCity marketplace testing.", price: 650000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 72, likeCount: 11, saveCount: 6 } });
    products.push(p24);
    await tx.productImage.create({ data: { productId: p24.id, url: demoImageUrl(p24.name, 24), isPrimary: true, sortOrder: 0 } });
    const p25 = await tx.product.create({ data: { shopId: shop10.id, categoryId: categories[4].id, name: "TV Stand", description: "Demo listing for TV Stand, suitable for SmartCity marketplace testing.", price: 320000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 75, likeCount: 12, saveCount: 7 } });
    products.push(p25);
    await tx.productImage.create({ data: { productId: p25.id, url: demoImageUrl(p25.name, 25), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p25.id, url: demoImageUrl(p25.name, 125), isPrimary: false, sortOrder: 1 } });
    const p26 = await tx.product.create({ data: { shopId: shop11.id, categoryId: categories[5].id, name: "Men's Casual Shirt", description: "Demo listing for Men's Casual Shirt, suitable for SmartCity marketplace testing.", price: 45000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 78, likeCount: 0, saveCount: 8 } });
    products.push(p26);
    await tx.productImage.create({ data: { productId: p26.id, url: demoImageUrl(p26.name, 26), isPrimary: true, sortOrder: 0 } });
    const p27 = await tx.product.create({ data: { shopId: shop12.id, categoryId: categories[5].id, name: "Women's Dress", description: "Demo listing for Women's Dress, suitable for SmartCity marketplace testing.", price: 85000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 81, likeCount: 1, saveCount: 0 } });
    products.push(p27);
    await tx.productImage.create({ data: { productId: p27.id, url: demoImageUrl(p27.name, 27), isPrimary: true, sortOrder: 0 } });
    const p28 = await tx.product.create({ data: { shopId: shop13.id, categoryId: categories[5].id, name: "Denim Jacket", description: "Demo listing for Denim Jacket, suitable for SmartCity marketplace testing.", price: 120000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 84, likeCount: 2, saveCount: 1 } });
    products.push(p28);
    await tx.productImage.create({ data: { productId: p28.id, url: demoImageUrl(p28.name, 28), isPrimary: true, sortOrder: 0 } });
    const p29 = await tx.product.create({ data: { shopId: shop14.id, categoryId: categories[5].id, name: "Men's Chinos", description: "Demo listing for Men's Chinos, suitable for SmartCity marketplace testing.", price: 65000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 87, likeCount: 3, saveCount: 2 } });
    products.push(p29);
    await tx.productImage.create({ data: { productId: p29.id, url: demoImageUrl(p29.name, 29), isPrimary: true, sortOrder: 0 } });
    const p30 = await tx.product.create({ data: { shopId: shop15.id, categoryId: categories[5].id, name: "Traditional Kitenge Outfit", description: "Demo listing for Traditional Kitenge Outfit, suitable for SmartCity marketplace testing.", price: 95000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 90, likeCount: 4, saveCount: 3 } });
    products.push(p30);
    await tx.productImage.create({ data: { productId: p30.id, url: demoImageUrl(p30.name, 30), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p30.id, url: demoImageUrl(p30.name, 130), isPrimary: false, sortOrder: 1 } });
    const p31 = await tx.product.create({ data: { shopId: shop1.id, categoryId: categories[6].id, name: "Men's Sneakers", description: "Demo listing for Men's Sneakers, suitable for SmartCity marketplace testing.", price: 95000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 93, likeCount: 5, saveCount: 4 } });
    products.push(p31);
    await tx.productImage.create({ data: { productId: p31.id, url: demoImageUrl(p31.name, 31), isPrimary: true, sortOrder: 0 } });
    const p32 = await tx.product.create({ data: { shopId: shop2.id, categoryId: categories[6].id, name: "Women's Sneakers", description: "Demo listing for Women's Sneakers, suitable for SmartCity marketplace testing.", price: 110000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 96, likeCount: 6, saveCount: 5 } });
    products.push(p32);
    await tx.productImage.create({ data: { productId: p32.id, url: demoImageUrl(p32.name, 32), isPrimary: true, sortOrder: 0 } });
    const p33 = await tx.product.create({ data: { shopId: shop3.id, categoryId: categories[6].id, name: "Leather Formal Shoes", description: "Demo listing for Leather Formal Shoes, suitable for SmartCity marketplace testing.", price: 130000, currency: "TSh", availability: Availability.LOW_STOCK, isActive: true, viewCount: 99, likeCount: 7, saveCount: 6 } });
    products.push(p33);
    await tx.productImage.create({ data: { productId: p33.id, url: demoImageUrl(p33.name, 33), isPrimary: true, sortOrder: 0 } });
    const p34 = await tx.product.create({ data: { shopId: shop4.id, categoryId: categories[6].id, name: "Running Shoes", description: "Demo listing for Running Shoes, suitable for SmartCity marketplace testing.", price: 125000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 102, likeCount: 8, saveCount: 7 } });
    products.push(p34);
    await tx.productImage.create({ data: { productId: p34.id, url: demoImageUrl(p34.name, 34), isPrimary: true, sortOrder: 0 } });
    const p35 = await tx.product.create({ data: { shopId: shop5.id, categoryId: categories[6].id, name: "Sandals", description: "Demo listing for Sandals, suitable for SmartCity marketplace testing.", price: 55000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 105, likeCount: 9, saveCount: 8 } });
    products.push(p35);
    await tx.productImage.create({ data: { productId: p35.id, url: demoImageUrl(p35.name, 35), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p35.id, url: demoImageUrl(p35.name, 135), isPrimary: false, sortOrder: 1 } });
    const p36 = await tx.product.create({ data: { shopId: shop6.id, categoryId: categories[7].id, name: "Perfume 100ml", description: "Demo listing for Perfume 100ml, suitable for SmartCity marketplace testing.", price: 120000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 108, likeCount: 10, saveCount: 0 } });
    products.push(p36);
    await tx.productImage.create({ data: { productId: p36.id, url: demoImageUrl(p36.name, 36), isPrimary: true, sortOrder: 0 } });
    const p37 = await tx.product.create({ data: { shopId: shop7.id, categoryId: categories[7].id, name: "Electric Hair Clipper", description: "Demo listing for Electric Hair Clipper, suitable for SmartCity marketplace testing.", price: 65000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 111, likeCount: 11, saveCount: 1 } });
    products.push(p37);
    await tx.productImage.create({ data: { productId: p37.id, url: demoImageUrl(p37.name, 37), isPrimary: true, sortOrder: 0 } });
    const p38 = await tx.product.create({ data: { shopId: shop8.id, categoryId: categories[7].id, name: "Skin Care Set", description: "Demo listing for Skin Care Set, suitable for SmartCity marketplace testing.", price: 90000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 114, likeCount: 12, saveCount: 2 } });
    products.push(p38);
    await tx.productImage.create({ data: { productId: p38.id, url: demoImageUrl(p38.name, 38), isPrimary: true, sortOrder: 0 } });
    const p39 = await tx.product.create({ data: { shopId: shop9.id, categoryId: categories[7].id, name: "Hair Dryer", description: "Demo listing for Hair Dryer, suitable for SmartCity marketplace testing.", price: 95000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 117, likeCount: 0, saveCount: 3 } });
    products.push(p39);
    await tx.productImage.create({ data: { productId: p39.id, url: demoImageUrl(p39.name, 39), isPrimary: true, sortOrder: 0 } });
    const p40 = await tx.product.create({ data: { shopId: shop10.id, categoryId: categories[7].id, name: "Body Lotion", description: "Demo listing for Body Lotion, suitable for SmartCity marketplace testing.", price: 55000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 120, likeCount: 1, saveCount: 4 } });
    products.push(p40);
    await tx.productImage.create({ data: { productId: p40.id, url: demoImageUrl(p40.name, 40), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p40.id, url: demoImageUrl(p40.name, 140), isPrimary: false, sortOrder: 1 } });
    const p41 = await tx.product.create({ data: { shopId: shop11.id, categoryId: categories[8].id, name: "Toyota Land Cruiser 76", description: "Demo listing for Toyota Land Cruiser 76, suitable for SmartCity marketplace testing.", price: 85000000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 123, likeCount: 2, saveCount: 5 } });
    products.push(p41);
    await tx.productImage.create({ data: { productId: p41.id, url: demoImageUrl(p41.name, 41), isPrimary: true, sortOrder: 0 } });
    const p42 = await tx.product.create({ data: { shopId: shop12.id, categoryId: categories[8].id, name: "Toyota RAV4", description: "Demo listing for Toyota RAV4, suitable for SmartCity marketplace testing.", price: 42000000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 126, likeCount: 3, saveCount: 6 } });
    products.push(p42);
    await tx.productImage.create({ data: { productId: p42.id, url: demoImageUrl(p42.name, 42), isPrimary: true, sortOrder: 0 } });
    const p43 = await tx.product.create({ data: { shopId: shop13.id, categoryId: categories[8].id, name: "Toyota Harrier", description: "Demo listing for Toyota Harrier, suitable for SmartCity marketplace testing.", price: 48000000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 129, likeCount: 4, saveCount: 7 } });
    products.push(p43);
    await tx.productImage.create({ data: { productId: p43.id, url: demoImageUrl(p43.name, 43), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p43.id, url: demoImageUrl(p43.name, 143), isPrimary: false, sortOrder: 1 } });
    const p44 = await tx.product.create({ data: { shopId: shop14.id, categoryId: categories[8].id, name: "Toyota Noah", description: "Demo listing for Toyota Noah, suitable for SmartCity marketplace testing.", price: 36000000, currency: "TSh", availability: Availability.LOW_STOCK, isActive: true, viewCount: 132, likeCount: 5, saveCount: 8 } });
    products.push(p44);
    await tx.productImage.create({ data: { productId: p44.id, url: demoImageUrl(p44.name, 44), isPrimary: true, sortOrder: 0 } });
    const p45 = await tx.product.create({ data: { shopId: shop15.id, categoryId: categories[8].id, name: "Nissan X-Trail", description: "Demo listing for Nissan X-Trail, suitable for SmartCity marketplace testing.", price: 45000000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 135, likeCount: 6, saveCount: 0 } });
    products.push(p45);
    await tx.productImage.create({ data: { productId: p45.id, url: demoImageUrl(p45.name, 45), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p45.id, url: demoImageUrl(p45.name, 145), isPrimary: false, sortOrder: 1 } });
    const p46 = await tx.product.create({ data: { shopId: shop1.id, categoryId: categories[9].id, name: "Bajaj Boxer 150", description: "Demo listing for Bajaj Boxer 150, suitable for SmartCity marketplace testing.", price: 4200000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 138, likeCount: 7, saveCount: 1 } });
    products.push(p46);
    await tx.productImage.create({ data: { productId: p46.id, url: demoImageUrl(p46.name, 46), isPrimary: true, sortOrder: 0 } });
    const p47 = await tx.product.create({ data: { shopId: shop2.id, categoryId: categories[9].id, name: "TVS HLX 125", description: "Demo listing for TVS HLX 125, suitable for SmartCity marketplace testing.", price: 3900000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 141, likeCount: 8, saveCount: 2 } });
    products.push(p47);
    await tx.productImage.create({ data: { productId: p47.id, url: demoImageUrl(p47.name, 47), isPrimary: true, sortOrder: 0 } });
    const p48 = await tx.product.create({ data: { shopId: shop3.id, categoryId: categories[9].id, name: "Honda CB125", description: "Demo listing for Honda CB125, suitable for SmartCity marketplace testing.", price: 5100000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 144, likeCount: 9, saveCount: 3 } });
    products.push(p48);
    await tx.productImage.create({ data: { productId: p48.id, url: demoImageUrl(p48.name, 48), isPrimary: true, sortOrder: 0 } });
    const p49 = await tx.product.create({ data: { shopId: shop4.id, categoryId: categories[9].id, name: "Yamaha FZ", description: "Demo listing for Yamaha FZ, suitable for SmartCity marketplace testing.", price: 6500000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 147, likeCount: 10, saveCount: 4 } });
    products.push(p49);
    await tx.productImage.create({ data: { productId: p49.id, url: demoImageUrl(p49.name, 49), isPrimary: true, sortOrder: 0 } });
    const p50 = await tx.product.create({ data: { shopId: shop5.id, categoryId: categories[9].id, name: "TVS Apache", description: "Demo listing for TVS Apache, suitable for SmartCity marketplace testing.", price: 6200000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 150, likeCount: 11, saveCount: 5 } });
    products.push(p50);
    await tx.productImage.create({ data: { productId: p50.id, url: demoImageUrl(p50.name, 50), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p50.id, url: demoImageUrl(p50.name, 150), isPrimary: false, sortOrder: 1 } });
    const p51 = await tx.product.create({ data: { shopId: shop6.id, categoryId: categories[10].id, name: "Brake Pads Set", description: "Demo listing for Brake Pads Set, suitable for SmartCity marketplace testing.", price: 85000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 153, likeCount: 12, saveCount: 6 } });
    products.push(p51);
    await tx.productImage.create({ data: { productId: p51.id, url: demoImageUrl(p51.name, 51), isPrimary: true, sortOrder: 0 } });
    const p52 = await tx.product.create({ data: { shopId: shop7.id, categoryId: categories[10].id, name: "Car Battery", description: "Demo listing for Car Battery, suitable for SmartCity marketplace testing.", price: 380000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 156, likeCount: 0, saveCount: 7 } });
    products.push(p52);
    await tx.productImage.create({ data: { productId: p52.id, url: demoImageUrl(p52.name, 52), isPrimary: true, sortOrder: 0 } });
    const p53 = await tx.product.create({ data: { shopId: shop8.id, categoryId: categories[10].id, name: "Engine Oil 5L", description: "Demo listing for Engine Oil 5L, suitable for SmartCity marketplace testing.", price: 85000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 159, likeCount: 1, saveCount: 8 } });
    products.push(p53);
    await tx.productImage.create({ data: { productId: p53.id, url: demoImageUrl(p53.name, 53), isPrimary: true, sortOrder: 0 } });
    const p54 = await tx.product.create({ data: { shopId: shop9.id, categoryId: categories[10].id, name: "Air Filter", description: "Demo listing for Air Filter, suitable for SmartCity marketplace testing.", price: 55000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 162, likeCount: 2, saveCount: 0 } });
    products.push(p54);
    await tx.productImage.create({ data: { productId: p54.id, url: demoImageUrl(p54.name, 54), isPrimary: true, sortOrder: 0 } });
    const p55 = await tx.product.create({ data: { shopId: shop10.id, categoryId: categories[10].id, name: "LED Headlights", description: "Demo listing for LED Headlights, suitable for SmartCity marketplace testing.", price: 180000, currency: "TSh", availability: Availability.LOW_STOCK, isActive: true, viewCount: 165, likeCount: 3, saveCount: 1 } });
    products.push(p55);
    await tx.productImage.create({ data: { productId: p55.id, url: demoImageUrl(p55.name, 55), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p55.id, url: demoImageUrl(p55.name, 155), isPrimary: false, sortOrder: 1 } });
    const p56 = await tx.product.create({ data: { shopId: shop11.id, categoryId: categories[11].id, name: "Garden Chair", description: "Demo listing for Garden Chair, suitable for SmartCity marketplace testing.", price: 180000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 168, likeCount: 4, saveCount: 2 } });
    products.push(p56);
    await tx.productImage.create({ data: { productId: p56.id, url: demoImageUrl(p56.name, 56), isPrimary: true, sortOrder: 0 } });
    const p57 = await tx.product.create({ data: { shopId: shop12.id, categoryId: categories[11].id, name: "Watering Hose", description: "Demo listing for Watering Hose, suitable for SmartCity marketplace testing.", price: 420000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 171, likeCount: 5, saveCount: 3 } });
    products.push(p57);
    await tx.productImage.create({ data: { productId: p57.id, url: demoImageUrl(p57.name, 57), isPrimary: true, sortOrder: 0 } });
    const p58 = await tx.product.create({ data: { shopId: shop13.id, categoryId: categories[11].id, name: "Outdoor Table", description: "Demo listing for Outdoor Table, suitable for SmartCity marketplace testing.", price: 280000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 174, likeCount: 6, saveCount: 4 } });
    products.push(p58);
    await tx.productImage.create({ data: { productId: p58.id, url: demoImageUrl(p58.name, 58), isPrimary: true, sortOrder: 0 } });
    const p59 = await tx.product.create({ data: { shopId: shop14.id, categoryId: categories[11].id, name: "Flower Pots Set", description: "Demo listing for Flower Pots Set, suitable for SmartCity marketplace testing.", price: 65000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 177, likeCount: 7, saveCount: 5 } });
    products.push(p59);
    await tx.productImage.create({ data: { productId: p59.id, url: demoImageUrl(p59.name, 59), isPrimary: true, sortOrder: 0 } });
    const p60 = await tx.product.create({ data: { shopId: shop15.id, categoryId: categories[11].id, name: "Solar Garden Lights", description: "Demo listing for Solar Garden Lights, suitable for SmartCity marketplace testing.", price: 95000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 180, likeCount: 8, saveCount: 6 } });
    products.push(p60);
    await tx.productImage.create({ data: { productId: p60.id, url: demoImageUrl(p60.name, 60), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p60.id, url: demoImageUrl(p60.name, 160), isPrimary: false, sortOrder: 1 } });
    const p61 = await tx.product.create({ data: { shopId: shop1.id, categoryId: categories[12].id, name: "Football", description: "Demo listing for Football, suitable for SmartCity marketplace testing.", price: 45000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 183, likeCount: 9, saveCount: 7 } });
    products.push(p61);
    await tx.productImage.create({ data: { productId: p61.id, url: demoImageUrl(p61.name, 61), isPrimary: true, sortOrder: 0 } });
    const p62 = await tx.product.create({ data: { shopId: shop2.id, categoryId: categories[12].id, name: "Yoga Mat", description: "Demo listing for Yoga Mat, suitable for SmartCity marketplace testing.", price: 85000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 186, likeCount: 10, saveCount: 8 } });
    products.push(p62);
    await tx.productImage.create({ data: { productId: p62.id, url: demoImageUrl(p62.name, 62), isPrimary: true, sortOrder: 0 } });
    const p63 = await tx.product.create({ data: { shopId: shop3.id, categoryId: categories[12].id, name: "Dumbbell Set", description: "Demo listing for Dumbbell Set, suitable for SmartCity marketplace testing.", price: 120000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 189, likeCount: 11, saveCount: 0 } });
    products.push(p63);
    await tx.productImage.create({ data: { productId: p63.id, url: demoImageUrl(p63.name, 63), isPrimary: true, sortOrder: 0 } });
    const p64 = await tx.product.create({ data: { shopId: shop4.id, categoryId: categories[12].id, name: "Exercise Bike", description: "Demo listing for Exercise Bike, suitable for SmartCity marketplace testing.", price: 1350000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 192, likeCount: 12, saveCount: 1 } });
    products.push(p64);
    await tx.productImage.create({ data: { productId: p64.id, url: demoImageUrl(p64.name, 64), isPrimary: true, sortOrder: 0 } });
    const p65 = await tx.product.create({ data: { shopId: shop5.id, categoryId: categories[12].id, name: "Basketball", description: "Demo listing for Basketball, suitable for SmartCity marketplace testing.", price: 95000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 195, likeCount: 0, saveCount: 2 } });
    products.push(p65);
    await tx.productImage.create({ data: { productId: p65.id, url: demoImageUrl(p65.name, 65), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p65.id, url: demoImageUrl(p65.name, 165), isPrimary: false, sortOrder: 1 } });
    const p66 = await tx.product.create({ data: { shopId: shop6.id, categoryId: categories[13].id, name: "Baby Stroller", description: "Demo listing for Baby Stroller, suitable for SmartCity marketplace testing.", price: 450000, currency: "TSh", availability: Availability.LOW_STOCK, isActive: true, viewCount: 198, likeCount: 1, saveCount: 3 } });
    products.push(p66);
    await tx.productImage.create({ data: { productId: p66.id, url: demoImageUrl(p66.name, 66), isPrimary: true, sortOrder: 0 } });
    const p67 = await tx.product.create({ data: { shopId: shop7.id, categoryId: categories[13].id, name: "Baby Car Seat", description: "Demo listing for Baby Car Seat, suitable for SmartCity marketplace testing.", price: 550000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 201, likeCount: 2, saveCount: 4 } });
    products.push(p67);
    await tx.productImage.create({ data: { productId: p67.id, url: demoImageUrl(p67.name, 67), isPrimary: true, sortOrder: 0 } });
    const p68 = await tx.product.create({ data: { shopId: shop8.id, categoryId: categories[13].id, name: "Kids Bicycle", description: "Demo listing for Kids Bicycle, suitable for SmartCity marketplace testing.", price: 350000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 204, likeCount: 3, saveCount: 5 } });
    products.push(p68);
    await tx.productImage.create({ data: { productId: p68.id, url: demoImageUrl(p68.name, 68), isPrimary: true, sortOrder: 0 } });
    const p69 = await tx.product.create({ data: { shopId: shop9.id, categoryId: categories[13].id, name: "School Backpack", description: "Demo listing for School Backpack, suitable for SmartCity marketplace testing.", price: 65000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 207, likeCount: 4, saveCount: 6 } });
    products.push(p69);
    await tx.productImage.create({ data: { productId: p69.id, url: demoImageUrl(p69.name, 69), isPrimary: true, sortOrder: 0 } });
    const p70 = await tx.product.create({ data: { shopId: shop10.id, categoryId: categories[13].id, name: "Building Blocks Set", description: "Demo listing for Building Blocks Set, suitable for SmartCity marketplace testing.", price: 85000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 210, likeCount: 5, saveCount: 7 } });
    products.push(p70);
    await tx.productImage.create({ data: { productId: p70.id, url: demoImageUrl(p70.name, 70), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p70.id, url: demoImageUrl(p70.name, 170), isPrimary: false, sortOrder: 1 } });
    const p71 = await tx.product.create({ data: { shopId: shop11.id, categoryId: categories[14].id, name: "Premium Rice 25kg", description: "Demo listing for Premium Rice 25kg, suitable for SmartCity marketplace testing.", price: 65000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 213, likeCount: 6, saveCount: 8 } });
    products.push(p71);
    await tx.productImage.create({ data: { productId: p71.id, url: demoImageUrl(p71.name, 71), isPrimary: true, sortOrder: 0 } });
    const p72 = await tx.product.create({ data: { shopId: shop12.id, categoryId: categories[14].id, name: "Cooking Oil 5L", description: "Demo listing for Cooking Oil 5L, suitable for SmartCity marketplace testing.", price: 18000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 216, likeCount: 7, saveCount: 0 } });
    products.push(p72);
    await tx.productImage.create({ data: { productId: p72.id, url: demoImageUrl(p72.name, 72), isPrimary: true, sortOrder: 0 } });
    const p73 = await tx.product.create({ data: { shopId: shop13.id, categoryId: categories[14].id, name: "Wheat Flour 10kg", description: "Demo listing for Wheat Flour 10kg, suitable for SmartCity marketplace testing.", price: 22000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 219, likeCount: 8, saveCount: 1 } });
    products.push(p73);
    await tx.productImage.create({ data: { productId: p73.id, url: demoImageUrl(p73.name, 73), isPrimary: true, sortOrder: 0 } });
    const p74 = await tx.product.create({ data: { shopId: shop14.id, categoryId: categories[14].id, name: "Sugar 5kg", description: "Demo listing for Sugar 5kg, suitable for SmartCity marketplace testing.", price: 15000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 222, likeCount: 9, saveCount: 2 } });
    products.push(p74);
    await tx.productImage.create({ data: { productId: p74.id, url: demoImageUrl(p74.name, 74), isPrimary: true, sortOrder: 0 } });
    const p75 = await tx.product.create({ data: { shopId: shop15.id, categoryId: categories[14].id, name: "Tea 250g", description: "Demo listing for Tea 250g, suitable for SmartCity marketplace testing.", price: 8500, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 225, likeCount: 10, saveCount: 3 } });
    products.push(p75);
    await tx.productImage.create({ data: { productId: p75.id, url: demoImageUrl(p75.name, 75), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p75.id, url: demoImageUrl(p75.name, 175), isPrimary: false, sortOrder: 1 } });
    const p76 = await tx.product.create({ data: { shopId: shop1.id, categoryId: categories[15].id, name: "Cordless Drill", description: "Demo listing for Cordless Drill, suitable for SmartCity marketplace testing.", price: 280000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 228, likeCount: 11, saveCount: 4 } });
    products.push(p76);
    await tx.productImage.create({ data: { productId: p76.id, url: demoImageUrl(p76.name, 76), isPrimary: true, sortOrder: 0 } });
    const p77 = await tx.product.create({ data: { shopId: shop2.id, categoryId: categories[15].id, name: "Angle Grinder", description: "Demo listing for Angle Grinder, suitable for SmartCity marketplace testing.", price: 220000, currency: "TSh", availability: Availability.LOW_STOCK, isActive: true, viewCount: 231, likeCount: 12, saveCount: 5 } });
    products.push(p77);
    await tx.productImage.create({ data: { productId: p77.id, url: demoImageUrl(p77.name, 77), isPrimary: true, sortOrder: 0 } });
    const p78 = await tx.product.create({ data: { shopId: shop3.id, categoryId: categories[15].id, name: "Tool Box Set", description: "Demo listing for Tool Box Set, suitable for SmartCity marketplace testing.", price: 95000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 234, likeCount: 0, saveCount: 6 } });
    products.push(p78);
    await tx.productImage.create({ data: { productId: p78.id, url: demoImageUrl(p78.name, 78), isPrimary: true, sortOrder: 0 } });
    const p79 = await tx.product.create({ data: { shopId: shop4.id, categoryId: categories[15].id, name: "Measuring Tape", description: "Demo listing for Measuring Tape, suitable for SmartCity marketplace testing.", price: 25000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 237, likeCount: 1, saveCount: 7 } });
    products.push(p79);
    await tx.productImage.create({ data: { productId: p79.id, url: demoImageUrl(p79.name, 79), isPrimary: true, sortOrder: 0 } });
    const p80 = await tx.product.create({ data: { shopId: shop5.id, categoryId: categories[15].id, name: "Welding Machine", description: "Demo listing for Welding Machine, suitable for SmartCity marketplace testing.", price: 450000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 240, likeCount: 2, saveCount: 8 } });
    products.push(p80);
    await tx.productImage.create({ data: { productId: p80.id, url: demoImageUrl(p80.name, 80), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p80.id, url: demoImageUrl(p80.name, 180), isPrimary: false, sortOrder: 1 } });
    const p81 = await tx.product.create({ data: { shopId: shop6.id, categoryId: categories[16].id, name: "Cement 50kg", description: "Demo listing for Cement 50kg, suitable for SmartCity marketplace testing.", price: 18000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 243, likeCount: 3, saveCount: 0 } });
    products.push(p81);
    await tx.productImage.create({ data: { productId: p81.id, url: demoImageUrl(p81.name, 81), isPrimary: true, sortOrder: 0 } });
    const p82 = await tx.product.create({ data: { shopId: shop7.id, categoryId: categories[16].id, name: "Ceramic Floor Tiles", description: "Demo listing for Ceramic Floor Tiles, suitable for SmartCity marketplace testing.", price: 35000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 246, likeCount: 4, saveCount: 1 } });
    products.push(p82);
    await tx.productImage.create({ data: { productId: p82.id, url: demoImageUrl(p82.name, 82), isPrimary: true, sortOrder: 0 } });
    const p83 = await tx.product.create({ data: { shopId: shop8.id, categoryId: categories[16].id, name: "Roofing Sheets", description: "Demo listing for Roofing Sheets, suitable for SmartCity marketplace testing.", price: 28000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 249, likeCount: 5, saveCount: 2 } });
    products.push(p83);
    await tx.productImage.create({ data: { productId: p83.id, url: demoImageUrl(p83.name, 83), isPrimary: true, sortOrder: 0 } });
    const p84 = await tx.product.create({ data: { shopId: shop9.id, categoryId: categories[16].id, name: "Interior Paint 20L", description: "Demo listing for Interior Paint 20L, suitable for SmartCity marketplace testing.", price: 125000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 252, likeCount: 6, saveCount: 3 } });
    products.push(p84);
    await tx.productImage.create({ data: { productId: p84.id, url: demoImageUrl(p84.name, 84), isPrimary: true, sortOrder: 0 } });
    const p85 = await tx.product.create({ data: { shopId: shop10.id, categoryId: categories[16].id, name: "Plumbing Pipe Set", description: "Demo listing for Plumbing Pipe Set, suitable for SmartCity marketplace testing.", price: 45000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 255, likeCount: 7, saveCount: 4 } });
    products.push(p85);
    await tx.productImage.create({ data: { productId: p85.id, url: demoImageUrl(p85.name, 85), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p85.id, url: demoImageUrl(p85.name, 185), isPrimary: false, sortOrder: 1 } });
    const p86 = await tx.product.create({ data: { shopId: shop11.id, categoryId: categories[17].id, name: "Office Printer", description: "Demo listing for Office Printer, suitable for SmartCity marketplace testing.", price: 650000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 258, likeCount: 8, saveCount: 5 } });
    products.push(p86);
    await tx.productImage.create({ data: { productId: p86.id, url: demoImageUrl(p86.name, 86), isPrimary: true, sortOrder: 0 } });
    const p87 = await tx.product.create({ data: { shopId: shop12.id, categoryId: categories[17].id, name: "A4 Paper Ream", description: "Demo listing for A4 Paper Ream, suitable for SmartCity marketplace testing.", price: 18000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 261, likeCount: 9, saveCount: 6 } });
    products.push(p87);
    await tx.productImage.create({ data: { productId: p87.id, url: demoImageUrl(p87.name, 87), isPrimary: true, sortOrder: 0 } });
    const p88 = await tx.product.create({ data: { shopId: shop13.id, categoryId: categories[17].id, name: "Office Chair", description: "Demo listing for Office Chair, suitable for SmartCity marketplace testing.", price: 280000, currency: "TSh", availability: Availability.LOW_STOCK, isActive: true, viewCount: 264, likeCount: 10, saveCount: 7 } });
    products.push(p88);
    await tx.productImage.create({ data: { productId: p88.id, url: demoImageUrl(p88.name, 88), isPrimary: true, sortOrder: 0 } });
    const p89 = await tx.product.create({ data: { shopId: shop14.id, categoryId: categories[17].id, name: "Notebook Pack", description: "Demo listing for Notebook Pack, suitable for SmartCity marketplace testing.", price: 25000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 267, likeCount: 11, saveCount: 8 } });
    products.push(p89);
    await tx.productImage.create({ data: { productId: p89.id, url: demoImageUrl(p89.name, 89), isPrimary: true, sortOrder: 0 } });
    const p90 = await tx.product.create({ data: { shopId: shop15.id, categoryId: categories[17].id, name: "Filing Cabinet", description: "Demo listing for Filing Cabinet, suitable for SmartCity marketplace testing.", price: 320000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 270, likeCount: 12, saveCount: 0 } });
    products.push(p90);
    await tx.productImage.create({ data: { productId: p90.id, url: demoImageUrl(p90.name, 90), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p90.id, url: demoImageUrl(p90.name, 190), isPrimary: false, sortOrder: 1 } });
    const p91 = await tx.product.create({ data: { shopId: shop1.id, categoryId: categories[18].id, name: "Acoustic Guitar", description: "Demo listing for Acoustic Guitar, suitable for SmartCity marketplace testing.", price: 280000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 273, likeCount: 0, saveCount: 1 } });
    products.push(p91);
    await tx.productImage.create({ data: { productId: p91.id, url: demoImageUrl(p91.name, 91), isPrimary: true, sortOrder: 0 } });
    const p92 = await tx.product.create({ data: { shopId: shop2.id, categoryId: categories[18].id, name: "Keyboard Piano", description: "Demo listing for Keyboard Piano, suitable for SmartCity marketplace testing.", price: 750000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 276, likeCount: 1, saveCount: 2 } });
    products.push(p92);
    await tx.productImage.create({ data: { productId: p92.id, url: demoImageUrl(p92.name, 92), isPrimary: true, sortOrder: 0 } });
    const p93 = await tx.product.create({ data: { shopId: shop3.id, categoryId: categories[18].id, name: "Studio Microphone", description: "Demo listing for Studio Microphone, suitable for SmartCity marketplace testing.", price: 220000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 279, likeCount: 2, saveCount: 3 } });
    products.push(p93);
    await tx.productImage.create({ data: { productId: p93.id, url: demoImageUrl(p93.name, 93), isPrimary: true, sortOrder: 0 } });
    const p94 = await tx.product.create({ data: { shopId: shop4.id, categoryId: categories[18].id, name: "Bluetooth PA Speaker", description: "Demo listing for Bluetooth PA Speaker, suitable for SmartCity marketplace testing.", price: 450000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 282, likeCount: 3, saveCount: 4 } });
    products.push(p94);
    await tx.productImage.create({ data: { productId: p94.id, url: demoImageUrl(p94.name, 94), isPrimary: true, sortOrder: 0 } });
    const p95 = await tx.product.create({ data: { shopId: shop5.id, categoryId: categories[18].id, name: "Drum Set", description: "Demo listing for Drum Set, suitable for SmartCity marketplace testing.", price: 950000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 285, likeCount: 4, saveCount: 5 } });
    products.push(p95);
    await tx.productImage.create({ data: { productId: p95.id, url: demoImageUrl(p95.name, 95), isPrimary: true, sortOrder: 0 } });
    await tx.productImage.create({ data: { productId: p95.id, url: demoImageUrl(p95.name, 195), isPrimary: false, sortOrder: 1 } });
    const p96 = await tx.product.create({ data: { shopId: shop6.id, categoryId: categories[19].id, name: "Phone Repair Service", description: "Demo listing for Phone Repair Service, suitable for SmartCity marketplace testing.", price: 25000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 288, likeCount: 5, saveCount: 6 } });
    products.push(p96);
    await tx.productImage.create({ data: { productId: p96.id, url: demoImageUrl(p96.name, 96), isPrimary: true, sortOrder: 0 } });
    const p97 = await tx.product.create({ data: { shopId: shop7.id, categoryId: categories[19].id, name: "Computer Repair Service", description: "Demo listing for Computer Repair Service, suitable for SmartCity marketplace testing.", price: 50000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 291, likeCount: 6, saveCount: 7 } });
    products.push(p97);
    await tx.productImage.create({ data: { productId: p97.id, url: demoImageUrl(p97.name, 97), isPrimary: true, sortOrder: 0 } });
    const p98 = await tx.product.create({ data: { shopId: shop8.id, categoryId: categories[19].id, name: "Car Wash Service", description: "Demo listing for Car Wash Service, suitable for SmartCity marketplace testing.", price: 15000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 294, likeCount: 7, saveCount: 8 } });
    products.push(p98);
    await tx.productImage.create({ data: { productId: p98.id, url: demoImageUrl(p98.name, 98), isPrimary: true, sortOrder: 0 } });
    const p99 = await tx.product.create({ data: { shopId: shop9.id, categoryId: categories[19].id, name: "Home Cleaning Service", description: "Demo listing for Home Cleaning Service, suitable for SmartCity marketplace testing.", price: 30000, currency: "TSh", availability: Availability.LOW_STOCK, isActive: true, viewCount: 297, likeCount: 8, saveCount: 0 } });
    products.push(p99);
    await tx.productImage.create({ data: { productId: p99.id, url: demoImageUrl(p99.name, 99), isPrimary: true, sortOrder: 0 } });
    const p100 = await tx.product.create({ data: { shopId: shop10.id, categoryId: categories[19].id, name: "Graphic Design Service", description: "Demo listing for Graphic Design Service, suitable for SmartCity marketplace testing.", price: 75000, currency: "TSh", availability: Availability.IN_STOCK, isActive: true, viewCount: 300, likeCount: 9, saveCount: 1 } });
    products.push(p100);
    await tx.productImage.create({ data: { productId: p100.id, url: demoImageUrl(p100.name, 100), isPrimary: true, sortOrder: 0 } });

    const customerUsers = [
      users["seller1@smartcity.com"],
      users["seller2@smartcity.com"],
      users["seller3@smartcity.com"],
      users["seller4@smartcity.com"],
      users["seller5@smartcity.com"],
      users["customer1@smartcity.com"],
      users["customer2@smartcity.com"],
      users["customer3@smartcity.com"],
      users["customer4@smartcity.com"],
      users["customer5@smartcity.com"],
      users["customer6@smartcity.com"],
      users["customer7@smartcity.com"],
      users["customer8@smartcity.com"],
      users["customer9@smartcity.com"],
      users["customer10@smartcity.com"],
      users["customer11@smartcity.com"],
      users["customer12@smartcity.com"],
      users["customer13@smartcity.com"],
      users["customer14@smartcity.com"],
      users["customer15@smartcity.com"],
      users["customer16@smartcity.com"],
      users["customer17@smartcity.com"],
      users["customer18@smartcity.com"],
      users["customer19@smartcity.com"],
      users["customer20@smartcity.com"],
      users["customer21@smartcity.com"],
      users["customer22@smartcity.com"],
      users["customer23@smartcity.com"],
      users["customer24@smartcity.com"],
      users["customer25@smartcity.com"],
    ];
    for (let i = 0; i < customerUsers.length; i++) {
      for (let j = 0; j < 2; j++) {
        await tx.like.create({ data: { userId: customerUsers[i].id, productId: products[(i * 3 + j) % products.length].id } });
        await tx.savedProduct.create({ data: { userId: customerUsers[i].id, productId: products[(i * 5 + j + 7) % products.length].id } });
        await tx.recentlyViewed.create({ data: { userId: customerUsers[i].id, productId: products[(i * 7 + j + 11) % products.length].id } });
      }
    }
    for (let i = 0; i < 150; i++) {
      await tx.productView.create({ data: { productId: products[i % products.length].id, userId: customerUsers[i % customerUsers.length].id } });
    }

    for (let i = 0; i < 15; i++) {
      const customer = customerUsers[i % customerUsers.length];
      const seller = users[`seller${((i + 1) % 7) + 1}@smartcity.com`];
      const product = products[(i * 6) % products.length];
      const conversation = await tx.conversation.create({ data: { productId: product.id } });
      await tx.conversationParticipant.createMany({ data: [{ conversationId: conversation.id, userId: customer.id }, { conversationId: conversation.id, userId: seller.id }] });
      await tx.message.create({ data: { conversationId: conversation.id, senderId: customer.id, type: MessageType.TEXT, content: `Hello, is ${product.name} still available?`, productId: product.id, isRead: true } });
      await tx.message.create({ data: { conversationId: conversation.id, senderId: seller.id, type: MessageType.TEXT, content: "Yes, it is currently available. Please let me know if you would like more details.", productId: product.id, isRead: i % 3 !== 0 } });
    }

      console.log("Created: 32 users, 7 sellers, 5 dual-role accounts, 25 customer-only accounts, 20 categories, 15 shops, 100 products, 150 views, 60 likes, 60 saves, 60 recently-viewed records, 15 conversations.");
    },
    {
      maxWait: 10000,
      timeout: 180000,
    }
  );
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });