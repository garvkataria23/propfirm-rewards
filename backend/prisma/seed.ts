import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // CRITICAL PRODUCTION GUARD
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    console.error('🛑 [SECURITY ERROR] Refusing to seed database in PRODUCTION environment!');
    console.error('🛑 Seeding deletes live user balances, redemptions, and records. Aborting immediately.');
    process.exit(1);
  }

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

  // 6. Create Prop Firms & Offers (1$ = 10 Points, Universal Referral Code: NATION)
  const fundedSquad = await prisma.propFirm.create({
    data: {
      name: 'FundedSquad',
      slug: 'fundedsquad',
      logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
      description: 'Elite proprietary firm with instant evaluation pass options, scaling plans up to $1,000,000, and weekly payouts.',
      websiteUrl: 'https://fundedsquad.com',
      affiliateCode: 'NATION',
      affiliateUrl: 'https://fundedsquad.com/?ref=nation',
      eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
      sortOrder: 1,
      isActive: true,
      offers: {
        create: [
          { accountTierName: '$10K Evaluation Challenge', purchasePriceUsd: 100, rewardPoints: 1000, sortOrder: 1 },
          { accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 200, rewardPoints: 2000, sortOrder: 2 },
          { accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 350, rewardPoints: 3500, sortOrder: 3 },
          { accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 550, rewardPoints: 5500, sortOrder: 4 },
          { accountTierName: '$200K Evaluation Challenge', purchasePriceUsd: 1000, rewardPoints: 10000, sortOrder: 5 },
        ],
      },
    },
    include: { offers: true },
  });

  const pipstoneCapital = await prisma.propFirm.create({
    data: {
      name: 'Pipstone Capital',
      slug: 'pipstone-capital',
      logoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
      description: 'Premium prop trading firm offering raw ECN spreads, high drawdown limits, and bi-weekly revenue splits up to 90%.',
      websiteUrl: 'https://trader.pipstonecapital.com/guest-checkout',
      affiliateCode: 'NATION',
      affiliateUrl: 'https://trader.pipstonecapital.com/guest-checkout?model=2-step&balance=100000&type=standard&coupon=NATION&affId=NATION',
      eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
      sortOrder: 2,
      isActive: true,
      offers: {
        create: [
          { accountTierName: '$15K Pipstone Standard', purchasePriceUsd: 120, rewardPoints: 1200, sortOrder: 1 },
          { accountTierName: '$30K Pipstone Standard', purchasePriceUsd: 220, rewardPoints: 2200, sortOrder: 2 },
          { accountTierName: '$60K Pipstone Standard', purchasePriceUsd: 380, rewardPoints: 3800, sortOrder: 3 },
          { accountTierName: '$100K Pipstone Standard', purchasePriceUsd: 520, rewardPoints: 5200, sortOrder: 4 },
          { accountTierName: '$200K Pipstone Standard', purchasePriceUsd: 980, rewardPoints: 9800, sortOrder: 5 },
        ],
      },
    },
    include: { offers: true },
  });

  const ftmo = await prisma.propFirm.create({
    data: {
      name: 'FTMO',
      slug: 'ftmo',
      logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
      description: 'The global benchmark for proprietary trading. Up to $200,000 initial balance, up to 90% profit split, and world-class trader education.',
      websiteUrl: 'https://ftmo.com',
      affiliateCode: 'NATION',
      affiliateUrl: 'https://ftmo.com/?ref=nation',
      eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
      sortOrder: 3,
      isActive: true,
      offers: {
        create: [
          { accountTierName: '$10K Evaluation Challenge', purchasePriceUsd: 175, rewardPoints: 1750, sortOrder: 1 },
          { accountTierName: '$25K Evaluation Challenge', purchasePriceUsd: 280, rewardPoints: 2800, sortOrder: 2 },
          { accountTierName: '$50K Evaluation Challenge', purchasePriceUsd: 390, rewardPoints: 3900, sortOrder: 3 },
          { accountTierName: '$100K Evaluation Challenge', purchasePriceUsd: 600, rewardPoints: 6000, sortOrder: 4 },
          { accountTierName: '$200K Evaluation Challenge', purchasePriceUsd: 1180, rewardPoints: 11800, sortOrder: 5 },
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
      affiliateCode: 'NATION',
      affiliateUrl: 'https://fundednext.com/?ref=nation',
      eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
      sortOrder: 4,
      isActive: true,
      offers: {
        create: [
          { accountTierName: '$15K Stellar 2-Step', purchasePriceUsd: 119, rewardPoints: 1190, sortOrder: 1 },
          { accountTierName: '$25K Stellar 2-Step', purchasePriceUsd: 199, rewardPoints: 1990, sortOrder: 2 },
          { accountTierName: '$50K Stellar 2-Step', purchasePriceUsd: 299, rewardPoints: 2990, sortOrder: 3 },
          { accountTierName: '$100K Stellar 2-Step', purchasePriceUsd: 549, rewardPoints: 5490, sortOrder: 4 },
          { accountTierName: '$200K Stellar 2-Step', purchasePriceUsd: 1099, rewardPoints: 10990, sortOrder: 5 },
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
      affiliateCode: 'NATION',
      affiliateUrl: 'https://fundingpips.com/?ref=nation',
      eligibilityTerms: 'Apply referral code NATION at checkout. 1$ purchase equals 10 Reward Points.',
      sortOrder: 5,
      isActive: true,
      offers: {
        create: [
          { accountTierName: '$5K Evaluation 2-Step', purchasePriceUsd: 32, rewardPoints: 320, sortOrder: 1 },
          { accountTierName: '$25K Evaluation 2-Step', purchasePriceUsd: 139, rewardPoints: 1390, sortOrder: 2 },
          { accountTierName: '$50K Evaluation 2-Step', purchasePriceUsd: 239, rewardPoints: 2390, sortOrder: 3 },
          { accountTierName: '$100K Evaluation 2-Step', purchasePriceUsd: 399, rewardPoints: 3990, sortOrder: 4 },
        ],
      },
    },
    include: { offers: true },
  });

  // 7. Reward Categories
  const catDevices = await prisma.rewardCategory.create({
    data: { name: 'Smartphones & Tablets', slug: 'smartphones-tablets', icon: 'smartphone', sortOrder: 1 },
  });
  const catLaptops = await prisma.rewardCategory.create({
    data: { name: 'Laptops & Workstations', slug: 'laptops-workstations', icon: 'laptop', sortOrder: 2 },
  });
  const catWatches = await prisma.rewardCategory.create({
    data: { name: 'Luxury Watches & Wearables', slug: 'watches-wearables', icon: 'watch', sortOrder: 3 },
  });
  const catShoes = await prisma.rewardCategory.create({
    data: { name: 'Sneakers & Footwear', slug: 'sneakers-footwear', icon: 'footprints', sortOrder: 4 },
  });
  const catHardware = await prisma.rewardCategory.create({
    data: { name: 'Trading Displays & Hardware', slug: 'trading-hardware', icon: 'monitor', sortOrder: 5 },
  });
  const catAudio = await prisma.rewardCategory.create({
    data: { name: 'Audio & Studio Sound', slug: 'audio-sound', icon: 'headphones', sortOrder: 6 },
  });
  const catSecurity = await prisma.rewardCategory.create({
    data: { name: 'Crypto & Security Hardware', slug: 'crypto-security', icon: 'shield', sortOrder: 7 },
  });
  const catGiftCards = await prisma.rewardCategory.create({
    data: { name: 'Gift Cards & Vouchers', slug: 'gift-cards', icon: 'gift', sortOrder: 8 },
  });
  const catLifestyle = await prisma.rewardCategory.create({
    data: { name: 'Trader Ergonomics & Desk', slug: 'trader-ergonomics', icon: 'armchair', sortOrder: 9 },
  });

  // 8. Rewards Catalog (1$ = 10 Points - At least 30+ Items)
  // Category 1: Smartphones & Tablets
  await prisma.reward.create({
    data: {
      categoryId: catDevices.id,
      name: 'Apple iPhone 18 Pro Max (1TB - Cosmic Titanium)',
      slug: 'apple-iphone-18-pro-max-1tb',
      description: 'Next-generation flagship smartphone with A19 Bionic Neural Engine, 6.9-inch ProMotion Ultra-Retina XDR display, and 48MP periscope zoom. Perfect for real-time mobile trading.',
      specifications: 'Color: Cosmic Titanium | Storage: 1TB | Display: 6.9" ProMotion 120Hz OLED | Battery: 34h talk time',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 15990,
      stock: 8,
      sortOrder: 1,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catDevices.id,
      name: 'Apple iPhone 18 Pro (256GB - Deep Space Black)',
      slug: 'apple-iphone-18-pro-256gb',
      description: 'Grade 5 forged titanium enclosure with ultra-thin bezels, Action Button, Ceramic Shield 2, and seamless multi-monitor TradingView sync.',
      specifications: 'Color: Deep Space Black | Storage: 256GB | Chip: A19 Pro Bionic | Camera: 48MP Triple Lens',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 11990,
      stock: 12,
      sortOrder: 2,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catDevices.id,
      name: 'Apple iPhone 18 (128GB - Ultramarine)',
      slug: 'apple-iphone-18-128gb',
      description: 'Vibrant color-infused back glass with Camera Control, Dynamic Island, and exceptional all-day battery efficiency for swift market execution.',
      specifications: 'Color: Ultramarine | Storage: 128GB | Display: 6.1" Super Retina XDR',
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 7990,
      stock: 15,
      sortOrder: 3,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catDevices.id,
      name: 'Apple iPad Pro 13" M4 Tandem OLED (256GB - Space Black)',
      slug: 'apple-ipad-pro-13-m4',
      description: 'Breakthrough thin design featuring tandem OLED Ultra Retina XDR screen and lightning-fast M4 silicon. The ultimate portable trading station.',
      specifications: 'Display: 13-inch Tandem OLED | Processor: Apple M4 Chip | Storage: 256GB Wi-Fi',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 12990,
      stock: 6,
      sortOrder: 4,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catDevices.id,
      name: 'Apple iPad Air 11" M2 (128GB - Starlight)',
      slug: 'apple-ipad-air-11-m2',
      description: 'Versatile liquid retina display with M2 performance, Apple Pencil Pro support, and lightweight mobility for desk and travel trading.',
      specifications: 'Display: 11-inch Liquid Retina | Chip: Apple M2 | Storage: 128GB Wi-Fi',
      imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 5990,
      stock: 10,
      sortOrder: 5,
    },
  });

  // Category 2: Laptops & Workstations
  await prisma.reward.create({
    data: {
      categoryId: catLaptops.id,
      name: 'Apple MacBook Pro 16" M4 Max (64GB RAM, 1TB SSD - Space Black)',
      slug: 'macbook-pro-16-m4-max',
      description: 'Monstrous desktop-class workstation performance in a laptop. Handles dozens of high-frequency tick charts, automated algos, and multi-4K monitors without throttling.',
      specifications: 'Processor: Apple M4 Max (16-core CPU, 40-core GPU) | Memory: 64GB Unified RAM | Storage: 1TB NVMe SSD',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 34990,
      stock: 4,
      sortOrder: 6,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catLaptops.id,
      name: 'Apple MacBook Pro 14" M4 Pro (24GB RAM, 512GB SSD - Silver)',
      slug: 'macbook-pro-14-m4-pro',
      description: 'Compact powerhouse with Liquid Retina XDR display, up to 24 hours of battery life, and high-bandwidth memory for rigorous technical backtesting.',
      specifications: 'Processor: M4 Pro 12-core | Memory: 24GB Unified | Storage: 512GB SSD | Thunderbolt 5 ports',
      imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 19990,
      stock: 6,
      sortOrder: 7,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catLaptops.id,
      name: 'Apple MacBook Air 15" M3 (16GB RAM, 512GB SSD - Midnight)',
      slug: 'macbook-air-15-m3',
      description: 'Strikingly thin fanless design with expansive 15.3" display, MagSafe charging, and silent operation during market hours.',
      specifications: 'Display: 15.3-inch Liquid Retina | Chip: Apple M3 8-core CPU | RAM: 16GB | SSD: 512GB',
      imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 14990,
      stock: 8,
      sortOrder: 8,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catLaptops.id,
      name: 'Apple MacBook Air 13" M3 (16GB RAM, 256GB SSD - Space Gray)',
      slug: 'macbook-air-13-m3',
      description: 'Super portable laptop tailored for remote traders. Exceptional 18-hour battery longevity with dual external display support.',
      specifications: 'Chip: Apple M3 | Memory: 16GB Unified RAM | Storage: 256GB SSD | Weight: 1.24 kg',
      imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 10990,
      stock: 12,
      sortOrder: 9,
    },
  });

  // Category 3: Luxury Watches & Wearables
  await prisma.reward.create({
    data: {
      categoryId: catWatches.id,
      name: 'Casio G-Shock Mudmaster Carbon Core Solar (GWG-2000)',
      slug: 'casio-gshock-mudmaster-gwg2000',
      description: 'Rugged military-grade forged carbon bezel with Triple Sensor (altimeter/barometer, compass, thermometer), Tough Solar, and Multiband 6 atomic timekeeping.',
      specifications: 'Case: Forged Carbon & Stainless Steel | Resistance: 200M Water & Mud Resistant | Glass: Sapphire Crystal',
      imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 8000,
      stock: 10,
      sortOrder: 10,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catWatches.id,
      name: 'Casio G-Shock Full Metal 5000 Series (GMW-B5000D-1)',
      slug: 'casio-gshock-full-metal-gmwb5000d',
      description: 'The iconic square silhouette reimagined in solid stainless steel. Features Bluetooth smartphone link, solar charging, and high-contrast STN display.',
      specifications: 'Material: Full Stainless Steel Case & Band | Connection: Bluetooth Phone Link | Shock Resistant Structure',
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 5500,
      stock: 12,
      sortOrder: 11,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catWatches.id,
      name: 'Casio G-Shock GA-2100 "CasiOak" All-Black Stealth',
      slug: 'casio-gshock-ga2100-stealth',
      description: 'Minimalist octagonal bezel with double LED illumination, Carbon Core Guard structure, and sleek matte black stealth aesthetics.',
      specifications: 'Case: Carbon Core Guard | Water Resistance: 200M | Weight: Ultra-light 51g | Style: Matte Black',
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 1300,
      stock: 25,
      sortOrder: 12,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catWatches.id,
      name: 'Apple Watch Ultra 2 Titanium (Ocean Band - Black)',
      slug: 'apple-watch-ultra-2-black',
      description: 'Corrosion-resistant titanium case with dual-frequency GPS, 3000 nits brightness display, customizable Action button, and 72-hour battery in Low Power Mode.',
      specifications: 'Case: 49mm Natural Titanium | Band: Black Ocean Band | Glass: Sapphire Crystal',
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 7990,
      stock: 7,
      sortOrder: 13,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catWatches.id,
      name: 'Apple Watch Series 10 Jet Black Aluminum 46mm',
      slug: 'apple-watch-series-10-jetblack',
      description: 'Thinnest Apple Watch ever with the biggest wide-angle OLED display, fast charge to 80% in 30 minutes, and vital health sensors.',
      specifications: 'Case: 46mm Jet Black Polished Aluminum | Strap: Sport Loop | Sensor: ECG, Heart Rate, SpO2',
      imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 4290,
      stock: 14,
      sortOrder: 14,
    },
  });

  // Category 4: Sneakers & Footwear
  await prisma.reward.create({
    data: {
      categoryId: catShoes.id,
      name: 'Nike Air Jordan 1 Retro High OG "Chicago Lost & Found"',
      slug: 'nike-air-jordan-1-retro-chicago',
      description: 'The holy grail of sneaker culture. Classic Chicago colorway featuring aged vintage accents, cracked leather detailing, and original 1985 box aesthetic.',
      specifications: 'Colorway: Varsity Red/Black/Sail | Material: Premium Full-Grain Leather | Sizes: US 7 to 13',
      imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 3500,
      stock: 8,
      sortOrder: 15,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catShoes.id,
      name: 'Nike Air Jordan 1 Low "Triple White"',
      slug: 'nike-air-jordan-1-low-white',
      description: 'Iconic low-top silhouette crafted with premium genuine leather upper, encapsulated Nike Air heel cushioning, and durable rubber traction.',
      specifications: 'Color: Triple White | Material: Full-Grain Leather | Sizes: US 7 to 13 available',
      imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 1400,
      stock: 15,
      sortOrder: 16,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catShoes.id,
      name: 'Nike Dunk Low Retro "Panda" (Black/White)',
      slug: 'nike-dunk-low-panda',
      description: 'Timeless two-tone black and white leather construction, padded low-cut collar, and classic court style designed for all-day comfort.',
      specifications: 'Color: White/Black | Material: Leather | Sizes: US 7 to 13 available',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 1500,
      stock: 20,
      sortOrder: 17,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catShoes.id,
      name: 'Nike Air Force 1 \'07 All-White Classic',
      slug: 'nike-air-force-1-07-white',
      description: 'The definition of sneaker timelessness. Crisp leather edges, stitched overlays, and legendary Nike Air cushioning for unparalleled comfort.',
      specifications: 'Color: White/White | Upper: Real & Synthetic Leather | Sizes: US 6 to 14',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 1150,
      stock: 25,
      sortOrder: 18,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catShoes.id,
      name: 'Nike Air Max 270 React Triple Black',
      slug: 'nike-air-max-270-react-black',
      description: 'Nike\'s biggest heel Air unit combined with soft, resilient Nike React foam for super smooth transitions and all-day energy return.',
      specifications: 'Color: Triple Black | Cushioning: 270 Max Air + React Foam | Sizes: US 7 to 13',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 1600,
      stock: 14,
      sortOrder: 19,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catShoes.id,
      name: 'On Cloud 5 Waterproof All-Black Running Shoes',
      slug: 'on-cloud-5-waterproof',
      description: 'Swiss-engineered CloudTec cushioning in Zero-Gravity foam with fully waterproof membrane and speed-lacing system.',
      specifications: 'Color: All-Black | Feature: 100% Wind & Waterproof | Sizes: US 7 to 13',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 1700,
      stock: 18,
      sortOrder: 20,
    },
  });

  // Category 5: Trading Displays & Hardware
  await prisma.reward.create({
    data: {
      categoryId: catHardware.id,
      name: 'Samsung Odyssey Neo G9 49" Dual QHD Curved Monitor',
      slug: 'samsung-odyssey-neo-g9-49',
      description: 'Super ultra-wide 32:9 curved Quantum Mini-LED monitor with 240Hz refresh rate and 1000R curvature. Equivalent to two 27" QHD screens side-by-side.',
      specifications: 'Screen Size: 49" Curved 1000R | Resolution: 5120 x 1440 Dual QHD | Refresh Rate: 240Hz 1ms',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 17990,
      stock: 3,
      sortOrder: 21,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catHardware.id,
      name: 'Dell UltraSharp 38" Curved WQHD+ Trading Monitor',
      slug: 'dell-ultrasharp-38-curved-monitor',
      description: 'Massive panoramic workspace for multi-timeframe analysis. IPS Black technology with 2000:1 contrast ratio and built-in KVM switch.',
      specifications: 'Resolution: 3840 x 1600 WQHD+ | Curved 2300R | 90W USB-C Power Delivery',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 9500,
      stock: 5,
      sortOrder: 22,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catHardware.id,
      name: 'LG DualUp 28" Ergonomic Multitasking Charting Monitor',
      slug: 'lg-dualup-28-monitor',
      description: 'Unique 16:18 aspect ratio that stacks two 21.5" 16:9 displays vertically. Frees up desk space while keeping order book and candlestick charts in one vertical scan.',
      specifications: 'Resolution: 2560 x 2880 SDQHD | Stand: Ergo Clamp Mount | Color: 98% DCI-P3 Nano IPS',
      imageUrl: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 6000,
      stock: 8,
      sortOrder: 23,
    },
  });

  const rewardMouse = await prisma.reward.create({
    data: {
      categoryId: catHardware.id,
      name: 'Logitech MX Master 3S Wireless Performance Mouse',
      slug: 'logitech-mx-master-3s',
      description: 'The trader gold standard. Quiet clicks, 8,000 DPI track-on-glass sensor, and hyper-fast MagSpeed electromagnetic scrolling.',
      specifications: 'Color: Graphite | Connectivity: Bluetooth & Logi Bolt | Multi-device switching up to 3 PCs',
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 1000,
      stock: 45,
      sortOrder: 24,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catHardware.id,
      name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
      slug: 'keychron-q1-pro-wireless',
      description: 'Fully customizable 75% CNC aluminum body keyboard with hot-swappable switches, double-gasket design, and wireless Bluetooth 5.1 connection.',
      specifications: 'Layout: 75% | Frame: Full CNC Aluminum | Switches: Gateron Jupiter Red | RGB Backlit',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 2100,
      stock: 16,
      sortOrder: 25,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catHardware.id,
      name: 'Elgato Stream Deck XL (32 Key Trading Dashboard Controller)',
      slug: 'elgato-stream-deck-xl-32',
      description: '32 customizable LCD keys to trigger trade executions, switch TradingView chart layouts, open news feeds, and mute Discord rooms with one tap.',
      specifications: 'Keys: 32 Custom LCD Keys | Interface: USB 3.0 | Stand: Magnetic Non-Slip Stand',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 2500,
      stock: 12,
      sortOrder: 26,
    },
  });

  // Category 6: Audio & Studio Sound
  await prisma.reward.create({
    data: {
      categoryId: catAudio.id,
      name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
      slug: 'sony-wh-1000xm5-headphones',
      description: 'Industry-leading noise cancellation engineered for high-stress trading sessions. Dual processors and 8 microphones block out all distractions.',
      specifications: 'Color: Black | Battery: 30 hours | Fast Charging (3 min = 3 hours)',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 3990,
      stock: 20,
      sortOrder: 27,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catAudio.id,
      name: 'Apple AirPods Max (USB-C - Space Gray)',
      slug: 'apple-airpods-max-usbc',
      description: 'Custom acoustic design combined with advanced software and computational audio. Breathable knit mesh canopy and anodized aluminum ear cups.',
      specifications: 'Color: Space Gray | Connector: USB-C Charging | Active Noise Cancellation with Transparency Mode',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 5490,
      stock: 10,
      sortOrder: 28,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catAudio.id,
      name: 'Apple AirPods Pro (2nd Generation with USB-C)',
      slug: 'apple-airpods-pro-2-usbc',
      description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio for seamless trading mobility.',
      specifications: 'MagSafe Case (USB-C) with speaker and lanyard loop | IP54 dust, sweat, and water resistance',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 2490,
      stock: 30,
      sortOrder: 29,
    },
  });

  // Category 7: Crypto & Security Hardware
  await prisma.reward.create({
    data: {
      categoryId: catSecurity.id,
      name: 'Ledger Stax Crypto Hardware Wallet (E-Ink Touchscreen)',
      slug: 'ledger-stax-hardware-wallet',
      description: 'Designed by iPod creator Tony Fadell. World\'s first curved E-Ink touchscreen crypto wallet with Bluetooth and wireless Qi charging.',
      specifications: 'Display: 3.7" Curved E-Ink | Connection: Bluetooth 5.2 & USB-C | Security: CC EAL6+ Certified Element',
      imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 3990,
      stock: 14,
      sortOrder: 30,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catSecurity.id,
      name: 'Ledger Nano X Crypto Hardware Wallet',
      slug: 'ledger-nano-x',
      description: 'Bluetooth-enabled secure element hardware wallet for safeguarding crypto trading profits, USDT, Bitcoin, and Ethereum.',
      specifications: 'Color: Matte Black | Security: CC EAL5+ | Supports over 5,500 coins and tokens',
      imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 1490,
      stock: 25,
      sortOrder: 31,
    },
  });

  // Category 8: Trader Ergonomics & Desk
  await prisma.reward.create({
    data: {
      categoryId: catLifestyle.id,
      name: 'Herman Miller Aeron Ergonomic Trading Chair',
      slug: 'herman-miller-aeron-chair',
      description: 'The quintessential Wall Street executive trading chair. Pellicle 8Z elastomeric suspension distributes weight evenly, relieving lower back pressure during long sessions.',
      specifications: 'Size: Size B (Medium) | Finish: Mineral/Satin Aluminum | Features: PostureFit SL & Forward Tilt',
      imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 16950,
      stock: 4,
      sortOrder: 32,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catLifestyle.id,
      name: 'Secretlab TITAN Evo 2024 Ergonomic Desk Chair',
      slug: 'secretlab-titan-evo-chair',
      description: 'Proprietary NEO Hybrid Leatherette with 4-way L-ADAPT lumbar support and magnetic memory foam head pillow for peak desk comfort.',
      specifications: 'Upholstery: Stealth Hybrid Leatherette | Size: Regular | Recline: 165-degree tilt',
      imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 5490,
      stock: 8,
      sortOrder: 33,
    },
  });

  // Category 9: Gift Cards & Vouchers
  await prisma.reward.create({
    data: {
      categoryId: catGiftCards.id,
      name: 'Amazon $500 Digital Gift Card',
      slug: 'amazon-500-gift-card',
      description: 'Instant digital delivery upon redemption approval. Redeemable across millions of tech, home, and office products on Amazon.',
      specifications: 'Value: $500.00 USD | Delivery: Email code within 1 hour | Expiry: Never',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 5000,
      stock: 999,
      isUnlimitedStock: true,
      sortOrder: 34,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catGiftCards.id,
      name: 'Amazon $100 Digital Gift Card',
      slug: 'amazon-100-gift-card',
      description: 'Instant digital code delivery. Perfect for trading books, accessories, or everyday purchases on Amazon.',
      specifications: 'Value: $100.00 USD | Delivery: Instant Digital Code | Expiry: None',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 1000,
      stock: 999,
      isUnlimitedStock: true,
      sortOrder: 35,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catGiftCards.id,
      name: 'Apple Store $250 Digital Gift Card',
      slug: 'apple-store-250-gift-card',
      description: 'Use for products, accessories, apps, games, music, movies, iCloud+, and more at any Apple Store or online.',
      specifications: 'Value: $250.00 USD | Delivery: Digital Apple Gift Card code | Expiry: None',
      imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 2500,
      stock: 500,
      isUnlimitedStock: true,
      sortOrder: 36,
    },
  });

  await prisma.reward.create({
    data: {
      categoryId: catGiftCards.id,
      name: 'TradingView Premium 1-Year VIP Subscription',
      slug: 'tradingview-premium-1year',
      description: 'Unlock maximum charting power: 8 charts per tab, 400 server-side alerts, 25 indicators per chart, second-based intervals, and volume profile.',
      specifications: 'Duration: 12 Months VIP Access | Voucher format: Pre-paid voucher code | Value: $599.40 USD',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
      pointsRequired: 5990,
      stock: 100,
      sortOrder: 37,
    },
  });

  // 9. Create Historical Purchases & Points Ledger for Alex Morgan (1$ = 10 Points)
  // Purchase 1: FTMO $100K Challenge (Approved) -> $600 = +6,000 Points
  const ftmo100kOffer = ftmo.offers.find((o) => o.rewardPoints === 6000);
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
      referralCodeUsed: 'NATION',
      notes: 'Purchased via link with universal code NATION. Invoice attached.',
      status: 'APPROVED',
      fraudStatus: 'NORMAL',
      reviewedById: admin.id,
      reviewedAt: new Date('2026-09-15T18:00:00Z'),
      pointsAwarded: 6000,
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
      points: 6000,
      balanceAfter: 6000,
      description: 'Verified FTMO purchase: $100K Evaluation Challenge (Order: FTMO-ORD-928190)',
      createdAt: new Date('2026-09-15T18:00:00Z'),
    },
  });

  // Purchase 2: FundedSquad $50K Challenge (Approved) -> $350 = +3,500 Points
  const squad50kOffer = fundedSquad.offers.find((o) => o.rewardPoints === 3500);
  const sub2 = await prisma.purchaseSubmission.create({
    data: {
      submissionCode: 'SUB-2026-9214',
      userId: alex.id,
      propFirmId: fundedSquad.id,
      offerId: squad50kOffer?.id,
      accountType: '$50K Evaluation Challenge',
      orderId: 'FS-INV-77192',
      accountId: 'FS-ACC-8831',
      purchaseDate: new Date('2026-09-20T10:15:00Z'),
      purchaseAmountUsd: 350,
      emailUsed: 'alex.m.trading@gmail.com',
      referralCodeUsed: 'NATION',
      notes: 'Bought during autumn promotion with referral code NATION.',
      status: 'APPROVED',
      fraudStatus: 'NORMAL',
      reviewedById: admin.id,
      reviewedAt: new Date('2026-09-20T12:00:00Z'),
      pointsAwarded: 3500,
      proofs: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80',
            fileName: 'fundedsquad-confirmation-77192.jpg',
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
      points: 3500,
      balanceAfter: 9500,
      description: 'Verified FundedSquad purchase: $50K Evaluation Challenge (Order: FS-INV-77192)',
      createdAt: new Date('2026-09-20T12:00:00Z'),
    },
  });

  // Admin Welcome Bonus for Alex -> +500 Points ($50 Value)
  const tx3 = await prisma.pointsLedger.create({
    data: {
      userId: alex.id,
      type: 'ADMIN_CREDIT',
      points: 500,
      balanceAfter: 10000,
      description: 'Promotional Welcome Bonus: Autumn Top Trader Campaign',
      reason: 'Special early supporter community reward bonus',
      createdById: admin.id,
      createdAt: new Date('2026-09-21T09:00:00Z'),
    },
  });

  // Redemption 1 by Alex: Logitech MX Master 3S (-1,000 Points = $100 Value) -> Balance 9,000
  const rdm1 = await prisma.redemption.create({
    data: {
      redemptionCode: 'RDM-2026-1049',
      userId: alex.id,
      rewardId: rewardMouse.id,
      pointsSpent: 1000,
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
      points: -1000,
      balanceAfter: 9000,
      description: 'Redeemed Logitech MX Master 3S Wireless Performance Mouse (ID: RDM-2026-1049)',
      createdAt: new Date('2026-09-22T16:00:00Z'),
    },
  });

  // Purchase 3: FundedNext $100K Challenge (Approved) -> $549 = +5,490 Points -> Balance 14,490
  const fundedNext100kOffer = fundedNext.offers.find((o) => o.rewardPoints === 5490);
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
      referralCodeUsed: 'NATION',
      notes: 'Purchased today, referral code NATION visible on receipt.',
      status: 'APPROVED',
      fraudStatus: 'NORMAL',
      reviewedById: admin.id,
      reviewedAt: new Date('2026-09-29T08:30:00Z'),
      pointsAwarded: 5490,
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
      points: 5490,
      balanceAfter: 14490,
      description: 'Verified FundedNext purchase: $100K Stellar 2-Step (Order: FN-ORD-449102)',
      createdAt: new Date('2026-09-29T08:30:00Z'),
    },
  });

  // Purchase 4: Pipstone Capital $100K Challenge (Pending Verification for Alex) -> $520 = 5,200 Points
  const pip100kOffer = pipstoneCapital.offers.find((o) => o.rewardPoints === 5200);
  await prisma.purchaseSubmission.create({
    data: {
      submissionCode: 'SUB-2026-9812',
      userId: alex.id,
      propFirmId: pipstoneCapital.id,
      offerId: pip100kOffer?.id,
      accountType: '$100K Pipstone Standard',
      orderId: 'PIP-ORD-882190',
      accountId: 'PIP-MT5-77312',
      purchaseDate: new Date('2026-10-01T15:20:00Z'),
      purchaseAmountUsd: 520,
      emailUsed: 'alex.m.trading@gmail.com',
      referralCodeUsed: 'NATION',
      notes: 'Submitted today via card checkout with universal code NATION.',
      status: 'PENDING',
      fraudStatus: 'NORMAL',
      pointsAwarded: 5200,
      proofs: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
            fileName: 'pipstone-receipt-882190.png',
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
      referralCodeUsed: 'NATION',
      notes: 'Initial submission with universal code NATION',
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
      { key: 'DEFAULT_REFERRAL_CODE', value: 'NATION', description: 'Universal partner referral code for all prop firms' },
      { key: 'MIN_REDEMPTION_POINTS', value: '1000', description: 'Minimum points threshold to unlock redemption store checkout' },
      { key: 'AUTO_FRAUD_CHECK_ENABLED', value: 'true', description: 'Duplicate order ID and account ID detection flag' },
    ],
  });

  console.log('✅ Seed completed successfully:');
  console.log('   👤 Admin User: admin@propfirmrewards.com (Password: Admin@123456)');
  console.log('   👤 Trader User: trader@example.com (Password: Trader@123456) [Points Balance: 13,000]');
  console.log('   🏢 Prop Firms: 5 active (FundedSquad, Pipstone Capital, FTMO, FundedNext, Funding Pips)');
  console.log('   🏷️ Universal Referral Code: NATION (for all prop firms & checkouts)');
  console.log('   🎁 Rewards: 37 premium items across 9 categories (Nike shoes, G-Shock watches, iPhone 18 Pro, MacBook Pro, etc.)');
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
