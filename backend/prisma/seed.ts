import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records if any
  await prisma.chatMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.pointsLedger.deleteMany();
  await prisma.purchaseProof.deleteMany();
  await prisma.purchaseSubmission.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.rewardCategory.deleteMany();
  await prisma.propFirmOffer.deleteMany();
  await prisma.propFirm.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const traderPasswordHash = await bcrypt.hash('Trader@123456', 10);

  // 3. Create Super Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@propfirmrewards.com',
      passwordHash: adminPasswordHash,
      name: 'Alexander Sterling',
      phone: '+1 (555) 019-2834',
      country: 'United States',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      department: 'EXECUTIVE',
      permissions: JSON.stringify([
        'manage_team',
        'assign_tickets',
        'resolve_tickets',
        'approve_purchases',
        'manage_payouts',
        'manage_rewards',
        'view_audit_logs',
        'system_settings',
      ]),
      emailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 4. Create Staff Team Members
  const sarah = await prisma.user.create({
    data: {
      email: 'sarah.support@propfirmrewards.com',
      passwordHash: adminPasswordHash,
      name: 'Sarah Chen',
      phone: '+44 20 7946 0912',
      country: 'United Kingdom',
      role: 'SUPPORT_LEAD',
      status: 'ACTIVE',
      department: 'VIP_CONCIERGE',
      permissions: JSON.stringify([
        'assign_tickets',
        'resolve_tickets',
        'view_audit_logs',
      ]),
      emailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const marcus = await prisma.user.create({
    data: {
      email: 'marcus.support@propfirmrewards.com',
      passwordHash: adminPasswordHash,
      name: 'Marcus Vance',
      phone: '+1 (555) 847-2931',
      country: 'United States',
      role: 'SUPPORT_AGENT',
      status: 'ACTIVE',
      department: 'VERIFICATION',
      permissions: JSON.stringify(['resolve_tickets']),
      emailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: 'elena.finance@propfirmrewards.com',
      passwordHash: adminPasswordHash,
      name: 'Elena Rostova',
      phone: '+49 30 901820',
      country: 'Germany',
      role: 'FINANCE_OFFICER',
      status: 'ACTIVE',
      department: 'PAYOUTS',
      permissions: JSON.stringify(['manage_payouts', 'resolve_tickets']),
      emailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  // 5. Create Demo Trader
  const alex = await prisma.user.create({
    data: {
      email: 'trader@example.com',
      passwordHash: traderPasswordHash,
      name: 'Alex Morgan',
      phone: '+1 (555) 392-1082',
      country: 'United States',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  // 5. Create Addresses
  const alexAddress = await prisma.userAddress.create({
    data: {
      userId: alex.id,
      fullName: 'Alex Morgan',
      phone: '+1 (555) 392-1082',
      addressLine1: '742 Evergreen Terrace',
      addressLine2: 'Suite 4B',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'United States',
      isDefault: true,
    },
  });

  // 6. Create Prop Firms & Offers
  const ftmo = await prisma.propFirm.create({
    data: {
      name: 'FTMO',
      slug: 'ftmo',
      logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
      description: 'The global benchmark for proprietary trading. Up to $200,000 initial balance, up to 90% profit split, and world-class trader education.',
      websiteUrl: 'https://ftmo.com',
      affiliateCode: 'PROPREWARDS10',
      affiliateUrl: 'https://ftmo.com/?ref=proprewards',
      eligibilityTerms: 'Valid for new challenge purchases made via the referral link/code. One reward allocation per unique account order ID.',
      sortOrder: 1,
      isActive: true,
      offers: {
        create: [
          { accountTierName: '$10K Evaluation Challenge', purchasePriceUsd: 175, rewardPoints: 2000, sortOrder: 1 },
          { accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 280, rewardPoints: 3500, sortOrder: 2 },
          { accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 390, rewardPoints: 5500, sortOrder: 3 },
          { accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 600, rewardPoints: 9000, sortOrder: 4 },
          { accountTierName: '$200K Evaluation Challenge', purchasePriceUsd: 1180, rewardPoints: 18000, sortOrder: 5 },
        ],
      },
    },
    include: { offers: true },
  });

  const fundingPips = await prisma.propFirm.create({
    data: {
      name: 'Funding Pips',
      slug: 'funding-pips',
      logoUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=120&auto=format&fit=crop&q=80',
      description: 'Built by traders for traders. Tight spreads, fast weekly payouts, and zero time limit evaluation phases.',
      websiteUrl: 'https://fundingpips.com',
      affiliateCode: 'REWARDSPIP',
      affiliateUrl: 'https://fundingpips.com/?ref=proprewards',
      eligibilityTerms: 'Applies to 2-Step and 1-Step evaluations. Proof invoice screenshot must clearly show purchase date and transaction ID.',
      sortOrder: 2,
      isActive: true,
      offers: {
        create: [
          { accountTierName: '$5K Evaluation 2-Step', purchasePriceUsd: 32, rewardPoints: 500, sortOrder: 1 },
          { accountTierName: '$25K Evaluation 2-Step', purchasePriceUsd: 139, rewardPoints: 2000, sortOrder: 2 },
          { accountTierName: '$50K Evaluation 2-Step', purchasePriceUsd: 239, rewardPoints: 3500, sortOrder: 3 },
          { accountTierName: '$100K Evaluation 2-Step', purchasePriceUsd: 399, rewardPoints: 6000, sortOrder: 4 },
        ],
      },
    },
    include: { offers: true },
  });

  const alphaCapital = await prisma.propFirm.create({
    data: {
      name: 'Alpha Capital Group',
      slug: 'alpha-capital-group',
      logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
      description: 'Zero commission trading with raw spreads on ACG Markets. Comprehensive free analytics and bi-weekly payouts.',
      websiteUrl: 'https://alphacapitalgroup.uk',
      affiliateCode: 'ALPHAREWARDS',
      affiliateUrl: 'https://alphacapitalgroup.uk/?ref=proprewards',
      eligibilityTerms: 'Must use coupon code ALPHAREWARDS at checkout. Screenshots of client portal dashboard accepted.',
      sortOrder: 3,
      isActive: true,
      offers: {
        create: [
          { accountTierName: '$25K Alpha Pro Challenge', purchasePriceUsd: 147, rewardPoints: 2200, sortOrder: 1 },
          { accountTierName: '$50K Alpha Pro Challenge', purchasePriceUsd: 297, rewardPoints: 4500, sortOrder: 2 },
          { accountTierName: '$100K Alpha Pro Challenge', purchasePriceUsd: 497, rewardPoints: 7500, sortOrder: 3 },
          { accountTierName: '$200K Alpha Pro Challenge', purchasePriceUsd: 997, rewardPoints: 15000, sortOrder: 4 },
        ],
      },
    },
    include: { offers: true },
  });

  const fundedNext = await prisma.propFirm.create({
    data: {
      name: 'FundedNext',
      slug: 'fundednext',
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
      description: '15% profit sharing during challenge phases, up to 95% profit split, and guaranteed 24-hour payout processing.',
      websiteUrl: 'https://fundednext.com',
      affiliateCode: 'NEXTREWARDS',
      affiliateUrl: 'https://fundednext.com/?ref=proprewards',
      eligibilityTerms: 'Eligible for Stellar, Evaluation, and Express models. Verification completed within 24 hours.',
      sortOrder: 4,
      isActive: true,
      offers: {
        create: [
          { accountTierName: '$15K Stellar 2-Step', purchasePriceUsd: 119, rewardPoints: 1800, sortOrder: 1 },
          { accountTierName: '$50K Stellar 2-Step', purchasePriceUsd: 299, rewardPoints: 4500, sortOrder: 2 },
          { accountTierName: '$100K Stellar 2-Step', purchasePriceUsd: 549, rewardPoints: 8500, sortOrder: 3 },
          { accountTierName: '$200K Stellar 2-Step', purchasePriceUsd: 1099, rewardPoints: 17000, sortOrder: 4 },
        ],
      },
    },
    include: { offers: true },
  });

  // 7. Reward Categories
  const catHardware = await prisma.rewardCategory.create({
    data: { name: 'Trading Hardware', slug: 'trading-hardware', icon: 'monitor', sortOrder: 1 },
  });
  const catDevices = await prisma.rewardCategory.create({
    data: { name: 'Smartphones & Tablets', slug: 'smartphones-tablets', icon: 'smartphone', sortOrder: 2 },
  });
  const catAudio = await prisma.rewardCategory.create({
    data: { name: 'Audio & Wearables', slug: 'audio-wearables', icon: 'headphones', sortOrder: 3 },
  });
  const catGiftCards = await prisma.rewardCategory.create({
    data: { name: 'Gift Cards & Vouchers', slug: 'gift-cards', icon: 'gift', sortOrder: 4 },
  });
  const catApparel = await prisma.rewardCategory.create({
    data: { name: 'Apparel & Lifestyle', slug: 'apparel-lifestyle', icon: 'shirt', sortOrder: 5 },
  });

  // 8. Rewards Catalog
  const rewardIphone = await prisma.reward.create({
    data: {
      categoryId: catDevices.id,
      name: 'Apple iPhone 16 Pro Max 256GB',
      slug: 'apple-iphone-16-pro-max',
      description: 'The pinnacle of mobile performance. Titanium design, A18 Pro chip, 48MP Fusion camera system, and exceptional battery life for monitoring charts on the go.',
      specifications: 'Color: Natural Titanium | Storage: 256GB | Display: 6.9-inch Super Retina XDR with ProMotion',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 120000,
      stock: 6,
      sortOrder: 1,
    },
  });

  const rewardIpad = await prisma.reward.create({
    data: {
      categoryId: catDevices.id,
      name: 'Apple iPad Pro 11" M4 (Wi-Fi 256GB)',
      slug: 'apple-ipad-pro-11-m4',
      description: 'Incredibly thin and powerful. Ultra Retina XDR OLED display, M4 chip, perfect for TradingView charting and multi-screen workstation extensions.',
      specifications: 'Space Black | 256GB | Ultra Retina XDR tandem OLED display',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 85000,
      stock: 10,
      sortOrder: 2,
    },
  });

  const rewardMonitor = await prisma.reward.create({
    data: {
      categoryId: catHardware.id,
      name: 'Dell UltraSharp 38" Curved WQHD+ Trading Monitor',
      slug: 'dell-ultrasharp-38-curved-monitor',
      description: 'Massive panoramic workspace for multi-timeframe analysis. IPS Black technology with 2000:1 contrast ratio and built-in KVM switch.',
      specifications: 'Resolution: 3840 x 1600 WQHD+ | Curved 2300R | 90W USB-C Power Delivery',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 95000,
      stock: 4,
      sortOrder: 3,
    },
  });

  const rewardMouse = await prisma.reward.create({
    data: {
      categoryId: catHardware.id,
      name: 'Logitech MX Master 3S Performance Mouse',
      slug: 'logitech-mx-master-3s',
      description: 'The trader gold standard. Quiet clicks, 8,000 DPI track-on-glass sensor, and hyper-fast MagSpeed electromagnetic scrolling.',
      specifications: 'Color: Graphite | Connectivity: Bluetooth & Logi Bolt | Multi-device switching up to 3 PCs',
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 10000,
      stock: 35,
      sortOrder: 4,
    },
  });

  const rewardSony = await prisma.reward.create({
    data: {
      categoryId: catAudio.id,
      name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      slug: 'sony-wh-1000xm5-headphones',
      description: 'Industry-leading noise cancellation engineered for high-stress trading sessions. Dual processors and 8 microphones block out all distractions.',
      specifications: 'Color: Black | Battery: 30 hours | Fast Charging (3 min = 3 hours)',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 32000,
      stock: 18,
      sortOrder: 5,
    },
  });

  const rewardAirpods = await prisma.reward.create({
    data: {
      categoryId: catAudio.id,
      name: 'Apple AirPods Pro (2nd Generation with USB-C)',
      slug: 'apple-airpods-pro-2-usbc',
      description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio for seamless trading mobility.',
      specifications: 'MagSafe Case (USB-C) with speaker and lanyard loop | IP54 dust, sweat, and water resistance',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 22000,
      stock: 25,
      sortOrder: 6,
    },
  });

  const rewardGift100 = await prisma.reward.create({
    data: {
      categoryId: catGiftCards.id,
      name: 'Amazon $100 Digital Gift Card',
      slug: 'amazon-100-gift-card',
      description: 'Delivered digitally to your account email instantly upon verification. Redeemable for millions of items on Amazon.',
      specifications: 'Digital code delivery | No expiration date | Global or regional redemption',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 10000,
      stock: 150,
      isUnlimitedStock: true,
      sortOrder: 7,
    },
  });

  const rewardGift50 = await prisma.reward.create({
    data: {
      categoryId: catGiftCards.id,
      name: 'Amazon $50 Digital Gift Card',
      slug: 'amazon-50-gift-card',
      description: 'Instant digital code delivery. Perfect for trading books, office supplies, or everyday purchases.',
      specifications: 'Digital code delivery | Fast processing | Global Amazon redemption',
      imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 5000,
      stock: 200,
      isUnlimitedStock: true,
      sortOrder: 8,
    },
  });

  const catShoes = await prisma.rewardCategory.create({
    data: { name: 'Shoes & Sneakers', slug: 'shoes-sneakers', icon: 'footprints', sortOrder: 6 },
  });

  const rewardJordan = await prisma.reward.create({
    data: {
      categoryId: catShoes.id,
      name: 'Nike Air Jordan 1 Low "Triple White"',
      slug: 'nike-air-jordan-1-low-white',
      description: 'Iconic low-top silhouette crafted with premium genuine leather upper, encapsulated Nike Air heel cushioning, and durable rubber traction.',
      specifications: 'Color: Triple White | Material: Full-Grain Leather | Sizes: US 7 to 13 available',
      imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 14000,
      stock: 15,
      sortOrder: 10,
    },
  });

  const rewardDunk = await prisma.reward.create({
    data: {
      categoryId: catShoes.id,
      name: 'Nike Dunk Low Retro "Panda"',
      slug: 'nike-dunk-low-panda',
      description: 'Timeless two-tone black and white leather construction, padded low-cut collar, and classic court style designed for all-day comfort.',
      specifications: 'Color: White/Black | Material: Leather | Sizes: US 7 to 13 available',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 15000,
      stock: 12,
      sortOrder: 11,
    },
  });

  const rewardOnCloud = await prisma.reward.create({
    data: {
      categoryId: catShoes.id,
      name: 'On Cloud 5 Waterproof All-Black Running Shoes',
      slug: 'on-cloud-5-waterproof',
      description: 'Swiss-engineered CloudTec cushioning in Zero-Gravity foam with fully waterproof membrane and speed-lacing system.',
      specifications: 'Color: All-Black | Feature: 100% Wind & Waterproof | Sizes: US 7 to 13',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      pointsRequired: 16000,
      stock: 10,
      sortOrder: 12,
    },
  });

  // 9. Create Historical Purchases & Points Ledger for Alex Morgan
  // Purchase 1: FTMO $100K Challenge (Approved) -> +9,000 Points
  const ftmo100kOffer = ftmo.offers.find((o) => o.rewardPoints === 9000);
  const sub1 = await prisma.purchaseSubmission.create({
    data: {
      submissionCode: 'SUB-2026-8901',
      userId: alex.id,
      propFirmId: ftmo.id,
      offerId: ftmo100kOffer?.id,
      accountType: '$100K Evaluation Challenge',
      orderId: 'FTMO-ORD-928190',
      accountId: 'FTMO-TRD-44109',
      purchaseDate: new Date('2026-09-15T14:30:00Z'),
      purchaseAmountUsd: 600,
      emailUsed: 'alex.m.trading@gmail.com',
      referralCodeUsed: 'PROPREWARDS10',
      notes: 'Purchased via link with code PROPREWARDS10. Invoice attached.',
      status: 'APPROVED',
      fraudStatus: 'NORMAL',
      reviewedById: admin.id,
      reviewedAt: new Date('2026-09-15T18:00:00Z'),
      pointsAwarded: 9000,
      proofs: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
            fileName: 'ftmo-invoice-928190.pdf',
            fileType: 'application/pdf',
            fileSize: 245100,
          },
        ],
      },
    },
  });

  const tx1 = await prisma.pointsLedger.create({
    data: {
      userId: alex.id,
      submissionId: sub1.id,
      type: 'PURCHASE_REWARD',
      points: 9000,
      balanceAfter: 9000,
      description: 'Verified FTMO purchase: $100K Evaluation Challenge (Order: FTMO-ORD-928190)',
      createdAt: new Date('2026-09-15T18:00:00Z'),
    },
  });

  // Purchase 2: Alpha Capital $50K Challenge (Approved) -> +4,500 Points
  const alpha50kOffer = alphaCapital.offers.find((o) => o.rewardPoints === 4500);
  const sub2 = await prisma.purchaseSubmission.create({
    data: {
      submissionCode: 'SUB-2026-9214',
      userId: alex.id,
      propFirmId: alphaCapital.id,
      offerId: alpha50kOffer?.id,
      accountType: '$50K Alpha Pro Challenge',
      orderId: 'ACG-INV-77192',
      accountId: 'ACG-ACC-8831',
      purchaseDate: new Date('2026-09-20T10:15:00Z'),
      purchaseAmountUsd: 297,
      emailUsed: 'alex.m.trading@gmail.com',
      referralCodeUsed: 'ALPHAREWARDS',
      notes: 'Bought during autumn promotion with code ALPHAREWARDS.',
      status: 'APPROVED',
      fraudStatus: 'NORMAL',
      reviewedById: admin.id,
      reviewedAt: new Date('2026-09-20T12:00:00Z'),
      pointsAwarded: 4500,
      proofs: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80',
            fileName: 'acg-confirmation-77192.jpg',
            fileType: 'image/jpeg',
            fileSize: 312000,
          },
        ],
      },
    },
  });

  const tx2 = await prisma.pointsLedger.create({
    data: {
      userId: alex.id,
      submissionId: sub2.id,
      type: 'PURCHASE_REWARD',
      points: 4500,
      balanceAfter: 13500,
      description: 'Verified Alpha Capital Group purchase: $50K Alpha Pro Challenge (Order: ACG-INV-77192)',
      createdAt: new Date('2026-09-20T12:00:00Z'),
    },
  });

  // Admin Welcome Bonus for Alex -> +1,000 Points
  const tx3 = await prisma.pointsLedger.create({
    data: {
      userId: alex.id,
      type: 'ADMIN_CREDIT',
      points: 1000,
      balanceAfter: 14500,
      description: 'Promotional Welcome Bonus: Autumn Top Trader Campaign',
      reason: 'Special early supporter community reward bonus',
      createdById: admin.id,
      createdAt: new Date('2026-09-21T09:00:00Z'),
    },
  });

  // Redemption 1 by Alex: Logitech MX Master 3S (-10,000 Points) -> Balance 4,500
  const rdm1 = await prisma.redemption.create({
    data: {
      redemptionCode: 'RDM-2026-1049',
      userId: alex.id,
      rewardId: rewardMouse.id,
      pointsSpent: 10000,
      status: 'SHIPPED',
      shippingAddressId: alexAddress.id,
      courier: 'FedEx Express',
      trackingNumber: 'FX-7839210984US',
      shippingNotes: 'Package dispatched via Priority 2-Day Air. Signed receipt required.',
      adminNotes: 'Verified trader with 2 approved challenges. Stock reserved and shipped.',
      createdAt: new Date('2026-09-22T16:00:00Z'),
      updatedAt: new Date('2026-09-23T11:00:00Z'),
    },
  });

  const tx4 = await prisma.pointsLedger.create({
    data: {
      userId: alex.id,
      redemptionId: rdm1.id,
      type: 'REDEMPTION',
      points: -10000,
      balanceAfter: 4500,
      description: 'Redeemed Logitech MX Master 3S Performance Mouse (ID: RDM-2026-1049)',
      createdAt: new Date('2026-09-22T16:00:00Z'),
    },
  });

  // Purchase 3: FundedNext $100K Challenge (Approved) -> +8,500 Points -> Balance 13,000
  const fundedNext100kOffer = fundedNext.offers.find((o) => o.rewardPoints === 8500);
  const sub3 = await prisma.purchaseSubmission.create({
    data: {
      submissionCode: 'SUB-2026-9540',
      userId: alex.id,
      propFirmId: fundedNext.id,
      offerId: fundedNext100kOffer?.id,
      accountType: '$100K Stellar 2-Step',
      orderId: 'FN-ORD-449102',
      accountId: 'FN-MT5-9921',
      purchaseDate: new Date('2026-09-28T18:40:00Z'),
      purchaseAmountUsd: 549,
      emailUsed: 'alex.m.trading@gmail.com',
      referralCodeUsed: 'NEXTREWARDS',
      notes: 'Purchased today, referral code NEXTREWARDS visible on receipt.',
      status: 'APPROVED',
      fraudStatus: 'NORMAL',
      reviewedById: admin.id,
      reviewedAt: new Date('2026-09-29T08:30:00Z'),
      pointsAwarded: 8500,
      proofs: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
            fileName: 'fundednext-receipt-449102.png',
            fileType: 'image/png',
            fileSize: 450120,
          },
        ],
      },
    },
  });

  const tx5 = await prisma.pointsLedger.create({
    data: {
      userId: alex.id,
      submissionId: sub3.id,
      type: 'PURCHASE_REWARD',
      points: 8500,
      balanceAfter: 13000,
      description: 'Verified FundedNext purchase: $100K Stellar 2-Step (Order: FN-ORD-449102)',
      createdAt: new Date('2026-09-29T08:30:00Z'),
    },
  });

  // Purchase 4: Funding Pips $100K Challenge (Pending Verification for Alex)
  const fp100kOffer = fundingPips.offers.find((o) => o.rewardPoints === 6000);
  await prisma.purchaseSubmission.create({
    data: {
      submissionCode: 'SUB-2026-9812',
      userId: alex.id,
      propFirmId: fundingPips.id,
      offerId: fp100kOffer?.id,
      accountType: '$100K Evaluation 2-Step',
      orderId: 'FP-ORD-882190',
      accountId: 'FP-MT5-77312',
      purchaseDate: new Date('2026-10-01T15:20:00Z'),
      purchaseAmountUsd: 399,
      emailUsed: 'alex.m.trading@gmail.com',
      referralCodeUsed: 'REWARDSPIP',
      notes: 'Submitted today via crypto payment checkout.',
      status: 'PENDING',
      fraudStatus: 'NORMAL',
      pointsAwarded: 6000,
      proofs: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
            fileName: 'fundingpips-receipt-882190.png',
            fileType: 'image/png',
            fileSize: 389200,
          },
        ],
      },
    },
  });

  // Purchase 5: Sarah Chen - More Info Required submission
  await prisma.purchaseSubmission.create({
    data: {
      submissionCode: 'SUB-2026-9730',
      userId: sarah.id,
      propFirmId: ftmo.id,
      accountType: '$50K Evaluation Challenge',
      orderId: 'FTMO-ORD-112093',
      accountId: 'FTMO-ACC-9011',
      purchaseDate: new Date('2026-09-30T11:00:00Z'),
      purchaseAmountUsd: 390,
      emailUsed: 'sarah.c@gmail.com',
      referralCodeUsed: 'PROPREWARDS10',
      notes: 'Initial submission',
      status: 'MORE_INFO_REQUIRED',
      fraudStatus: 'NORMAL',
      infoRequestedMessage: 'The uploaded screenshot did not clearly show the transaction date or the discount coupon applied. Please upload the full billing PDF receipt received by email.',
      reviewedById: admin.id,
      reviewedAt: new Date('2026-09-30T14:00:00Z'),
      proofs: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80',
            fileName: 'blurry-checkout.jpg',
            fileType: 'image/jpeg',
            fileSize: 180000,
          },
        ],
      },
    },
  });

  // 10. Notifications for Alex
  await prisma.notification.createMany({
    data: [
      {
        userId: alex.id,
        title: 'Purchase Submission Verified! 🎉',
        message: 'Your FundedNext $100K Stellar challenge was verified. +8,500 Reward Points credited to your balance.',
        type: 'POINTS',
        isRead: false,
        linkUrl: '/dashboard/points',
        createdAt: new Date('2026-09-29T08:31:00Z'),
      },
      {
        userId: alex.id,
        title: 'Reward Dispatched: Logitech MX Master 3S',
        message: 'Your order RDM-2026-1049 has shipped via FedEx Express (Tracking: FX-7839210984US).',
        type: 'REDEMPTION',
        isRead: true,
        linkUrl: '/dashboard/redemptions',
        createdAt: new Date('2026-09-23T11:05:00Z'),
      },
      {
        userId: alex.id,
        title: 'Welcome to PropFirm Rewards!',
        message: 'Explore active prop firm affiliate codes, submit proofs of purchase, and start unlocking premium gear.',
        type: 'SYSTEM',
        isRead: true,
        linkUrl: '/dashboard',
        createdAt: new Date('2026-09-15T12:00:00Z'),
      },
    ],
  });

  // 11. Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        adminId: admin.id,
        action: 'APPROVE_PURCHASE',
        entity: 'PurchaseSubmission',
        entityId: sub1.id,
        previousValue: JSON.stringify({ status: 'PENDING' }),
        newValue: JSON.stringify({ status: 'APPROVED', pointsAwarded: 9000 }),
        notes: 'Verified against FTMO affiliate dashboard with Order ID FTMO-ORD-928190',
        createdAt: new Date('2026-09-15T18:00:00Z'),
      },
      {
        adminId: admin.id,
        action: 'ADJUST_POINTS',
        entity: 'User',
        entityId: alex.id,
        previousValue: JSON.stringify({ balance: 13500 }),
        newValue: JSON.stringify({ balance: 14500, adjustment: +1000 }),
        notes: 'Special early supporter community reward bonus',
        createdAt: new Date('2026-09-21T09:00:00Z'),
      },
      {
        adminId: admin.id,
        action: 'UPDATE_REDEMPTION_STATUS',
        entity: 'Redemption',
        entityId: rdm1.id,
        previousValue: JSON.stringify({ status: 'PROCESSING' }),
        newValue: JSON.stringify({ status: 'SHIPPED', trackingNumber: 'FX-7839210984US' }),
        notes: 'Shipped via FedEx Express 2-day priority',
        createdAt: new Date('2026-09-23T11:00:00Z'),
      },
    ],
  });

  // 12. Support Tickets & Live Chat Conversations
  const ticket1 = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TICK-1001',
      userId: alex.id,
      assignedToId: marcus.id,
      subject: 'Expedite $100K Funding Pips purchase review',
      department: 'PURCHASE_PROOF',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 15),
      messages: {
        create: [
          {
            senderId: alex.id,
            senderRole: 'USER',
            message: 'Hello team, I just submitted my $100K Funding Pips confirmation PDF. Could you expedite review so I can claim the 6,500 points before Friday?',
            isInternalNote: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          },
          {
            senderId: marcus.id,
            senderRole: 'SUPPORT_AGENT',
            message: 'Internal Staff Note: OCR confidence is 98.4%. Order ID matched Funding Pips format. Awaiting secondary compliance hash.',
            isInternalNote: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 45),
          },
          {
            senderId: marcus.id,
            senderRole: 'SUPPORT_AGENT',
            message: 'Hi Alex! Marcus from verification support here. I am reviewing your proof invoice right now. The OCR matched cleanly with Funding Pips. You should see points awarded within 30 minutes!',
            isInternalNote: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 15),
          },
        ],
      },
    },
  });

  const ticket2 = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TICK-1002',
      userId: alex.id,
      assignedToId: null,
      subject: 'USDT TRC20 vs ERC20 cashout minimums',
      department: 'CASHOUT_PAYOUT',
      priority: 'MEDIUM',
      status: 'OPEN',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
      messages: {
        create: [
          {
            senderId: alex.id,
            senderRole: 'USER',
            message: 'Quick question for the billing desk: Are USDT TRC20 withdrawals processed with 0 gas fee, or should I opt for direct bank wire?',
            isInternalNote: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
          },
        ],
      },
    },
  });

  const ticket3 = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TICK-1003',
      userId: alex.id,
      assignedToId: sarah.id,
      subject: 'Diamond Whale VIP Tier 2.0x boost activation',
      department: 'VIP',
      priority: 'URGENT',
      status: 'WAITING_TRADER',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 5),
      messages: {
        create: [
          {
            senderId: alex.id,
            senderRole: 'USER',
            message: 'I just crossed 50,000 lifetime points. Does the Diamond Whale 2.0x multiplier apply automatically on my next FundedNext challenge?',
            isInternalNote: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 120),
          },
          {
            senderId: sarah.id,
            senderRole: 'SUPPORT_LEAD',
            message: 'Internal Note: Confirmed lifetime points 52,400. VIP Concierge privileges enabled in metadata.',
            isInternalNote: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
          },
          {
            senderId: sarah.id,
            senderRole: 'SUPPORT_LEAD',
            message: 'Hello Alex! Congratulations on achieving Diamond Whale VIP status! 🐋 Yes, your 2.0x points multiplier is already active across all partnered prop firms. Let us know if you need priority challenge activation.',
            isInternalNote: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5),
          },
        ],
      },
    },
  });

  // 13. System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'PLATFORM_NAME', value: 'PropFirm Rewards', description: 'Official public platform name' },
      { key: 'SUPPORT_EMAIL', value: 'support@propfirmrewards.com', description: 'Public support contact email' },
      { key: 'MIN_REDEMPTION_POINTS', value: '5000', description: 'Minimum points threshold to unlock redemption store checkout' },
      { key: 'AUTO_FRAUD_CHECK_ENABLED', value: 'true', description: 'Duplicate order ID and account ID detection flag' },
    ],
  });

  console.log('✅ Seed completed successfully:');
  console.log('   👤 Admin User: admin@propfirmrewards.com (Password: Admin@123456)');
  console.log('   👤 Trader User: trader@example.com (Password: Trader@123456) [Points Balance: 13,000]');
  console.log('   🏢 Prop Firms: 4 active (FTMO, Funding Pips, Alpha Capital Group, FundedNext)');
  console.log('   🎁 Rewards: 9 items across 5 categories');
  console.log('   📋 Submissions: Approved, Pending, Under Review, and More Info Required');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
