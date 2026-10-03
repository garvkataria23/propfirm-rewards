'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import confetti from 'canvas-confetti';
import {
  Gift,
  Coins,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  ArrowRight,
  Package,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Reward {
  id: string;
  name: string;
  slug: string;
  description: string;
  specifications?: string;
  imageUrl: string;
  pointsRequired: number;
  stock: number;
  isUnlimitedStock: boolean;
  category: Category;
}

interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function RewardsStorePage() {
  const { user, refreshUser, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // If user is already authenticated and visits the public /rewards route, redirect inside dashboard!
  useEffect(() => {
    if (!isLoading && user && pathname === '/rewards') {
      router.replace('/dashboard/rewards');
    }
  }, [user, isLoading, pathname, router]);

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redemption Modal state
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: user?.country || 'United States',
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [redemptionNotes, setRedemptionNotes] = useState('');
  const [isSubmittingRedemption, setIsSubmittingRedemption] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<any>(null);
  const [redemptionError, setRedemptionError] = useState<string | null>(null);

  useEffect(() => {
    const fallbackCats: Category[] = [
      { id: 'c-1', name: 'Smartphones & Tablets', slug: 'smartphones-tablets' },
      { id: 'c-2', name: 'Laptops & Workstations', slug: 'laptops-workstations' },
      { id: 'c-3', name: 'Luxury Watches & Wearables', slug: 'watches-wearables' },
      { id: 'c-4', name: 'Sneakers & Footwear', slug: 'sneakers-footwear' },
      { id: 'c-5', name: 'Trading Displays & Hardware', slug: 'trading-hardware' },
      { id: 'c-6', name: 'Audio & Studio Sound', slug: 'audio-sound' },
      { id: 'c-7', name: 'Crypto & Security Hardware', slug: 'crypto-security' },
      { id: 'c-8', name: 'Gift Cards & Vouchers', slug: 'gift-cards' },
      { id: 'c-9', name: 'Trader Ergonomics & Desk', slug: 'trader-ergonomics' },
    ];
    const fallbackRews: Reward[] = [
      // Smartphones & Tablets
          {
            id: 'rew-1',
            name: 'Apple iPhone 18 Pro Max (1TB - Cosmic Titanium)',
            slug: 'apple-iphone-18-pro-max-1tb',
            description: 'Next-generation flagship smartphone with A19 Bionic Neural Engine, 6.9-inch ProMotion Ultra-Retina XDR display, and 48MP periscope zoom. Perfect for real-time mobile trading.',
            specifications: 'Color: Cosmic Titanium | Storage: 1TB | Display: 6.9" ProMotion 120Hz OLED | Battery: 34h talk time',
            imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 15990,
            stock: 8,
            isUnlimitedStock: false,
            category: fallbackCats[0],
          },
          {
            id: 'rew-2',
            name: 'Apple iPhone 18 Pro (256GB - Deep Space Black)',
            slug: 'apple-iphone-18-pro-256gb',
            description: 'Grade 5 forged titanium enclosure with ultra-thin bezels, Action Button, Ceramic Shield 2, and seamless multi-monitor TradingView sync.',
            specifications: 'Color: Deep Space Black | Storage: 256GB | Chip: A19 Pro Bionic | Camera: 48MP Triple Lens',
            imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 11990,
            stock: 12,
            isUnlimitedStock: false,
            category: fallbackCats[0],
          },
          {
            id: 'rew-3',
            name: 'Apple iPhone 18 (128GB - Ultramarine)',
            slug: 'apple-iphone-18-128gb',
            description: 'Vibrant color-infused back glass with Camera Control, Dynamic Island, and exceptional all-day battery efficiency for swift market execution.',
            specifications: 'Color: Ultramarine | Storage: 128GB | Display: 6.1" Super Retina XDR',
            imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 7990,
            stock: 15,
            isUnlimitedStock: false,
            category: fallbackCats[0],
          },
          {
            id: 'rew-4',
            name: 'Apple iPad Pro 13" M4 Tandem OLED (256GB - Space Black)',
            slug: 'apple-ipad-pro-13-m4',
            description: 'Breakthrough thin design featuring tandem OLED Ultra Retina XDR screen and lightning-fast M4 silicon. The ultimate portable trading station.',
            specifications: 'Display: 13-inch Tandem OLED | Processor: Apple M4 Chip | Storage: 256GB Wi-Fi',
            imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 12990,
            stock: 6,
            isUnlimitedStock: false,
            category: fallbackCats[0],
          },
          {
            id: 'rew-5',
            name: 'Apple iPad Air 11" M2 (128GB - Starlight)',
            slug: 'apple-ipad-air-11-m2',
            description: 'Versatile liquid retina display with M2 performance, Apple Pencil Pro support, and lightweight mobility for desk and travel trading.',
            specifications: 'Display: 11-inch Liquid Retina | Chip: Apple M2 | Storage: 128GB Wi-Fi',
            imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 5990,
            stock: 10,
            isUnlimitedStock: false,
            category: fallbackCats[0],
          },
          // Laptops & Workstations
          {
            id: 'rew-6',
            name: 'Apple MacBook Pro 16" M4 Max (64GB RAM, 1TB SSD - Space Black)',
            slug: 'macbook-pro-16-m4-max',
            description: 'Monstrous desktop-class workstation performance in a laptop. Handles dozens of high-frequency tick charts, automated algos, and multi-4K monitors without throttling.',
            specifications: 'Processor: Apple M4 Max (16-core CPU, 40-core GPU) | Memory: 64GB Unified RAM | Storage: 1TB NVMe SSD',
            imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 34990,
            stock: 4,
            isUnlimitedStock: false,
            category: fallbackCats[1],
          },
          {
            id: 'rew-7',
            name: 'Apple MacBook Pro 14" M4 Pro (24GB RAM, 512GB SSD - Silver)',
            slug: 'macbook-pro-14-m4-pro',
            description: 'Compact powerhouse with Liquid Retina XDR display, up to 24 hours of battery life, and high-bandwidth memory for rigorous technical backtesting.',
            specifications: 'Processor: M4 Pro 12-core | Memory: 24GB Unified | Storage: 512GB SSD | Thunderbolt 5 ports',
            imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 19990,
            stock: 6,
            isUnlimitedStock: false,
            category: fallbackCats[1],
          },
          {
            id: 'rew-8',
            name: 'Apple MacBook Air 15" M3 (16GB RAM, 512GB SSD - Midnight)',
            slug: 'macbook-air-15-m3',
            description: 'Strikingly thin fanless design with expansive 15.3" display, MagSafe charging, and silent operation during market hours.',
            specifications: 'Display: 15.3-inch Liquid Retina | Chip: Apple M3 8-core CPU | RAM: 16GB | SSD: 512GB',
            imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 14990,
            stock: 8,
            isUnlimitedStock: false,
            category: fallbackCats[1],
          },
          {
            id: 'rew-9',
            name: 'Apple MacBook Air 13" M3 (16GB RAM, 256GB SSD - Space Gray)',
            slug: 'macbook-air-13-m3',
            description: 'Super portable laptop tailored for remote traders. Exceptional 18-hour battery longevity with dual external display support.',
            specifications: 'Chip: Apple M3 | Memory: 16GB Unified RAM | Storage: 256GB SSD | Weight: 1.24 kg',
            imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 10990,
            stock: 12,
            isUnlimitedStock: false,
            category: fallbackCats[1],
          },
          // Luxury Watches & Wearables
          {
            id: 'rew-10',
            name: 'Casio G-Shock Mudmaster Carbon Core Solar (GWG-2000)',
            slug: 'casio-gshock-mudmaster-gwg2000',
            description: 'Rugged military-grade forged carbon bezel with Triple Sensor (altimeter/barometer, compass, thermometer), Tough Solar, and Multiband 6 atomic timekeeping.',
            specifications: 'Case: Forged Carbon & Stainless Steel | Resistance: 200M Water & Mud Resistant | Glass: Sapphire Crystal',
            imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 8000,
            stock: 10,
            isUnlimitedStock: false,
            category: fallbackCats[2],
          },
          {
            id: 'rew-11',
            name: 'Casio G-Shock Full Metal 5000 Series (GMW-B5000D-1)',
            slug: 'casio-gshock-full-metal-gmwb5000d',
            description: 'The iconic square silhouette reimagined in solid stainless steel. Features Bluetooth smartphone link, solar charging, and high-contrast STN display.',
            specifications: 'Material: Full Stainless Steel Case & Band | Connection: Bluetooth Phone Link | Shock Resistant Structure',
            imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 5500,
            stock: 12,
            isUnlimitedStock: false,
            category: fallbackCats[2],
          },
          {
            id: 'rew-12',
            name: 'Casio G-Shock GA-2100 "CasiOak" All-Black Stealth',
            slug: 'casio-gshock-ga2100-stealth',
            description: 'Minimalist octagonal bezel with double LED illumination, Carbon Core Guard structure, and sleek matte black stealth aesthetics.',
            specifications: 'Case: Carbon Core Guard | Water Resistance: 200M | Weight: Ultra-light 51g | Style: Matte Black',
            imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 1300,
            stock: 25,
            isUnlimitedStock: false,
            category: fallbackCats[2],
          },
          {
            id: 'rew-13',
            name: 'Apple Watch Ultra 2 Titanium (Ocean Band - Black)',
            slug: 'apple-watch-ultra-2-black',
            description: 'Corrosion-resistant titanium case with dual-frequency GPS, 3000 nits brightness display, customizable Action button, and 72-hour battery in Low Power Mode.',
            specifications: 'Case: 49mm Natural Titanium | Band: Black Ocean Band | Glass: Sapphire Crystal',
            imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 7990,
            stock: 7,
            isUnlimitedStock: false,
            category: fallbackCats[2],
          },
          {
            id: 'rew-14',
            name: 'Apple Watch Series 10 Jet Black Aluminum 46mm',
            slug: 'apple-watch-series-10-jetblack',
            description: 'Thinnest Apple Watch ever with the biggest wide-angle OLED display, fast charge to 80% in 30 minutes, and vital health sensors.',
            specifications: 'Case: 46mm Jet Black Polished Aluminum | Strap: Sport Loop | Sensor: ECG, Heart Rate, SpO2',
            imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 4290,
            stock: 14,
            isUnlimitedStock: false,
            category: fallbackCats[2],
          },
          // Sneakers & Footwear
          {
            id: 'rew-15',
            name: 'Nike Air Jordan 1 Retro High OG "Chicago Lost & Found"',
            slug: 'nike-air-jordan-1-retro-chicago',
            description: 'The holy grail of sneaker culture. Classic Chicago colorway featuring aged vintage accents, cracked leather detailing, and original 1985 box aesthetic.',
            specifications: 'Colorway: Varsity Red/Black/Sail | Material: Premium Full-Grain Leather | Sizes: US 7 to 13',
            imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 3500,
            stock: 8,
            isUnlimitedStock: false,
            category: fallbackCats[3],
          },
          {
            id: 'rew-16',
            name: 'Nike Air Jordan 1 Low "Triple White"',
            slug: 'nike-air-jordan-1-low-white',
            description: 'Iconic low-top silhouette crafted with premium genuine leather upper, encapsulated Nike Air heel cushioning, and durable rubber traction.',
            specifications: 'Color: Triple White | Material: Full-Grain Leather | Sizes: US 7 to 13 available',
            imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 1400,
            stock: 15,
            isUnlimitedStock: false,
            category: fallbackCats[3],
          },
          {
            id: 'rew-17',
            name: 'Nike Dunk Low Retro "Panda" (Black/White)',
            slug: 'nike-dunk-low-panda',
            description: 'Timeless two-tone black and white leather construction, padded low-cut collar, and classic court style designed for all-day comfort.',
            specifications: 'Color: White/Black | Material: Leather | Sizes: US 7 to 13 available',
            imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 1500,
            stock: 20,
            isUnlimitedStock: false,
            category: fallbackCats[3],
          },
          {
            id: 'rew-18',
            name: 'Nike Air Force 1 \'07 All-White Classic',
            slug: 'nike-air-force-1-07-white',
            description: 'The definition of sneaker timelessness. Crisp leather edges, stitched overlays, and legendary Nike Air cushioning for unparalleled comfort.',
            specifications: 'Color: White/White | Upper: Real & Synthetic Leather | Sizes: US 6 to 14',
            imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 1150,
            stock: 25,
            isUnlimitedStock: false,
            category: fallbackCats[3],
          },
          {
            id: 'rew-19',
            name: 'Nike Air Max 270 React Triple Black',
            slug: 'nike-air-max-270-react-black',
            description: 'Nike\'s biggest heel Air unit combined with soft, resilient Nike React foam for super smooth transitions and all-day energy return.',
            specifications: 'Color: Triple Black | Cushioning: 270 Max Air + React Foam | Sizes: US 7 to 13',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 1600,
            stock: 14,
            isUnlimitedStock: false,
            category: fallbackCats[3],
          },
          {
            id: 'rew-20',
            name: 'On Cloud 5 Waterproof All-Black Running Shoes',
            slug: 'on-cloud-5-waterproof',
            description: 'Swiss-engineered CloudTec cushioning in Zero-Gravity foam with fully waterproof membrane and speed-lacing system.',
            specifications: 'Color: All-Black | Feature: 100% Wind & Waterproof | Sizes: US 7 to 13',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 1700,
            stock: 18,
            isUnlimitedStock: false,
            category: fallbackCats[3],
          },
          // Trading Displays & Hardware
          {
            id: 'rew-21',
            name: 'Samsung Odyssey Neo G9 49" Dual QHD Curved Monitor',
            slug: 'samsung-odyssey-neo-g9-49',
            description: 'Super ultra-wide 32:9 curved Quantum Mini-LED monitor with 240Hz refresh rate and 1000R curvature. Equivalent to two 27" QHD screens side-by-side.',
            specifications: 'Screen Size: 49" Curved 1000R | Resolution: 5120 x 1440 Dual QHD | Refresh Rate: 240Hz 1ms',
            imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 17990,
            stock: 3,
            isUnlimitedStock: false,
            category: fallbackCats[4],
          },
          {
            id: 'rew-22',
            name: 'Dell UltraSharp 38" Curved WQHD+ Trading Monitor',
            slug: 'dell-ultrasharp-38-curved-monitor',
            description: 'Massive panoramic workspace for multi-timeframe analysis. IPS Black technology with 2000:1 contrast ratio and built-in KVM switch.',
            specifications: 'Resolution: 3840 x 1600 WQHD+ | Curved 2300R | 90W USB-C Power Delivery',
            imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 9500,
            stock: 5,
            isUnlimitedStock: false,
            category: fallbackCats[4],
          },
          {
            id: 'rew-23',
            name: 'LG DualUp 28" Ergonomic Multitasking Charting Monitor',
            slug: 'lg-dualup-28-monitor',
            description: 'Unique 16:18 aspect ratio that stacks two 21.5" 16:9 displays vertically. Frees up desk space while keeping order book and candlestick charts in one vertical scan.',
            specifications: 'Resolution: 2560 x 2880 SDQHD | Stand: Ergo Clamp Mount | Color: 98% DCI-P3 Nano IPS',
            imageUrl: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 6000,
            stock: 8,
            isUnlimitedStock: false,
            category: fallbackCats[4],
          },
          {
            id: 'rew-24',
            name: 'Logitech MX Master 3S Wireless Performance Mouse',
            slug: 'logitech-mx-master-3s',
            description: 'The trader gold standard. Quiet clicks, 8,000 DPI track-on-glass sensor, and hyper-fast MagSpeed electromagnetic scrolling.',
            specifications: 'Color: Graphite | Connectivity: Bluetooth & Logi Bolt | Multi-device switching up to 3 PCs',
            imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 1000,
            stock: 45,
            isUnlimitedStock: false,
            category: fallbackCats[4],
          },
          {
            id: 'rew-25',
            name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
            slug: 'keychron-q1-pro-wireless',
            description: 'Fully customizable 75% CNC aluminum body keyboard with hot-swappable switches, double-gasket design, and wireless Bluetooth 5.1 connection.',
            specifications: 'Layout: 75% | Frame: Full CNC Aluminum | Switches: Gateron Jupiter Red | RGB Backlit',
            imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 2100,
            stock: 16,
            isUnlimitedStock: false,
            category: fallbackCats[4],
          },
          {
            id: 'rew-26',
            name: 'Elgato Stream Deck XL (32 Key Trading Dashboard Controller)',
            slug: 'elgato-stream-deck-xl-32',
            description: '32 customizable LCD keys to trigger trade executions, switch TradingView chart layouts, open news feeds, and mute Discord rooms with one tap.',
            specifications: 'Keys: 32 Custom LCD Keys | Interface: USB 3.0 | Stand: Magnetic Non-Slip Stand',
            imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 2500,
            stock: 12,
            isUnlimitedStock: false,
            category: fallbackCats[4],
          },
          // Audio & Studio Sound
          {
            id: 'rew-27',
            name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
            slug: 'sony-wh-1000xm5-headphones',
            description: 'Industry-leading noise cancellation engineered for high-stress trading sessions. Dual processors and 8 microphones block out all distractions.',
            specifications: 'Color: Black | Battery: 30 hours | Fast Charging (3 min = 3 hours)',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 3990,
            stock: 20,
            isUnlimitedStock: false,
            category: fallbackCats[5],
          },
          {
            id: 'rew-28',
            name: 'Apple AirPods Max (USB-C - Space Gray)',
            slug: 'apple-airpods-max-usbc',
            description: 'Custom acoustic design combined with advanced software and computational audio. Breathable knit mesh canopy and anodized aluminum ear cups.',
            specifications: 'Color: Space Gray | Connector: USB-C Charging | Active Noise Cancellation with Transparency Mode',
            imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 5490,
            stock: 10,
            isUnlimitedStock: false,
            category: fallbackCats[5],
          },
          {
            id: 'rew-29',
            name: 'Apple AirPods Pro (2nd Generation with USB-C)',
            slug: 'apple-airpods-pro-2-usbc',
            description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio for seamless trading mobility.',
            specifications: 'MagSafe Case (USB-C) with speaker and lanyard loop | IP54 dust, sweat, and water resistance',
            imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 2490,
            stock: 30,
            isUnlimitedStock: false,
            category: fallbackCats[5],
          },
          // Crypto & Security Hardware
          {
            id: 'rew-30',
            name: 'Ledger Stax Crypto Hardware Wallet (E-Ink Touchscreen)',
            slug: 'ledger-stax-hardware-wallet',
            description: 'Designed by iPod creator Tony Fadell. World\'s first curved E-Ink touchscreen crypto wallet with Bluetooth and wireless Qi charging.',
            specifications: 'Display: 3.7" Curved E-Ink | Connection: Bluetooth 5.2 & USB-C | Security: CC EAL6+ Certified Element',
            imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 3990,
            stock: 14,
            isUnlimitedStock: false,
            category: fallbackCats[6],
          },
          {
            id: 'rew-31',
            name: 'Ledger Nano X Crypto Hardware Wallet',
            slug: 'ledger-nano-x',
            description: 'Bluetooth-enabled secure element hardware wallet for safeguarding crypto trading profits, USDT, Bitcoin, and Ethereum.',
            specifications: 'Color: Matte Black | Security: CC EAL5+ | Supports over 5,500 coins and tokens',
            imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 1490,
            stock: 25,
            isUnlimitedStock: false,
            category: fallbackCats[6],
          },
          // Trader Ergonomics & Desk
          {
            id: 'rew-32',
            name: 'Herman Miller Aeron Ergonomic Trading Chair',
            slug: 'herman-miller-aeron-chair',
            description: 'The quintessential Wall Street executive trading chair. Pellicle 8Z elastomeric suspension distributes weight evenly, relieving lower back pressure during long sessions.',
            specifications: 'Size: Size B (Medium) | Finish: Mineral/Satin Aluminum | Features: PostureFit SL & Forward Tilt',
            imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 16950,
            stock: 4,
            isUnlimitedStock: false,
            category: fallbackCats[8],
          },
          {
            id: 'rew-33',
            name: 'Secretlab TITAN Evo 2024 Ergonomic Desk Chair',
            slug: 'secretlab-titan-evo-chair',
            description: 'Proprietary NEO Hybrid Leatherette with 4-way L-ADAPT lumbar support and magnetic memory foam head pillow for peak desk comfort.',
            specifications: 'Upholstery: Stealth Hybrid Leatherette | Size: Regular | Recline: 165-degree tilt',
            imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 5490,
            stock: 8,
            isUnlimitedStock: false,
            category: fallbackCats[8],
          },
          // Gift Cards & Vouchers
          {
            id: 'rew-34',
            name: 'Amazon $500 Digital Gift Card',
            slug: 'amazon-500-gift-card',
            description: 'Instant digital delivery upon redemption approval. Redeemable across millions of tech, home, and office products on Amazon.',
            specifications: 'Value: $500.00 USD | Delivery: Email code within 1 hour | Expiry: Never',
            imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 5000,
            stock: 999,
            isUnlimitedStock: true,
            category: fallbackCats[7],
          },
          {
            id: 'rew-35',
            name: 'Amazon $100 Digital Gift Card',
            slug: 'amazon-100-gift-card',
            description: 'Instant digital code delivery. Perfect for trading books, accessories, or everyday purchases on Amazon.',
            specifications: 'Value: $100.00 USD | Delivery: Instant Digital Code | Expiry: None',
            imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 1000,
            stock: 999,
            isUnlimitedStock: true,
            category: fallbackCats[7],
          },
          {
            id: 'rew-36',
            name: 'Apple Store $250 Digital Gift Card',
            slug: 'apple-store-250-gift-card',
            description: 'Use for products, accessories, apps, games, music, movies, iCloud+, and more at any Apple Store or online.',
            specifications: 'Value: $250.00 USD | Delivery: Digital Apple Gift Card code | Expiry: None',
            imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 2500,
            stock: 500,
            isUnlimitedStock: true,
            category: fallbackCats[7],
          },
          {
            id: 'rew-37',
            name: 'TradingView Premium 1-Year VIP Subscription',
            slug: 'tradingview-premium-1year',
            description: 'Unlock maximum charting power: 8 charts per tab, 400 server-side alerts, 25 indicators per chart, second-based intervals, and volume profile.',
            specifications: 'Duration: 12 Months VIP Access | Voucher format: Pre-paid voucher code | Value: $599.40 USD',
            imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
            pointsRequired: 5990,
            stock: 100,
            isUnlimitedStock: true,
            category: fallbackCats[7],
          },
        ];

    // Hydrate immediately in 0ms so user sees full catalog right away
    setCategories((prev) => (prev.length > 0 ? prev : fallbackCats));
    setRewards((prev) => (prev.length > 0 ? prev : fallbackRews));
    setLoading(false);

    Promise.all([
      api.get<Reward[]>('/rewards').catch(() => null),
      api.get<Category[]>('/rewards/categories').catch(() => null),
    ]).then(([rewardsData, categoriesData]) => {
      if (Array.isArray(rewardsData) && rewardsData.length > 0) {
        setRewards(rewardsData);
      }
      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        setCategories(categoriesData);
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      api.get<UserAddress[]>('/users/addresses').then((data) => {
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        } else {
          setUseNewAddress(true);
        }
      }).catch(console.error);
    }
  }, [user]);

  const filteredRewards = rewards.filter((r) => {
    const matchesCategory =
      selectedCategory === 'all' || r.category?.slug === selectedCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesStock = !inStockOnly || r.isUnlimitedStock || r.stock > 0;
    return matchesCategory && matchesSearch && matchesStock;
  });

  const handleOpenRedeemModal = (reward: Reward) => {
    setSelectedReward(reward);
    setRedemptionError(null);
    setRedemptionSuccess(null);
  };

  const handleConfirmRedemption = async () => {
    if (!selectedReward) return;
    setIsSubmittingRedemption(true);
    setRedemptionError(null);

    try {
      const payload: any = {
        notes: redemptionNotes,
      };

      if (!useNewAddress && selectedAddressId) {
        payload.shippingAddressId = selectedAddressId;
      } else {
        if (!newAddress.addressLine1 || !newAddress.fullName || !newAddress.city) {
          throw new Error('Please fill in required shipping address fields');
        }
        Object.assign(payload, newAddress);
      }

      const res = await api.post(`/rewards/${selectedReward.id}/redeem`, payload);
      setRedemptionSuccess(res);
      await refreshUser();

      // Trigger confetti celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setRedemptionError(err.message || 'Redemption failed');
    } finally {
      setIsSubmittingRedemption(false);
    }
  };

  const userBalance = user?.points?.available || 0;
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <div className={isDashboard ? 'w-full space-y-8' : 'mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 space-y-12'}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <Badge variant="info">Rewards Marketplace</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Redeem Your Points
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Exchange your accumulated challenge points for flagship Apple & Sony devices, Dell curved monitors, or instant digital Amazon vouchers.
          </p>
        </div>

        {/* User Balance card if authenticated */}
        {user && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-4 flex items-center gap-4 shrink-0 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Your Available Balance
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {userBalance.toLocaleString()}{' '}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Points</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Rewards
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.slug
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search rewards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer self-start sm:self-auto select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-500 focus:ring-emerald-500"
            />
            <span>In-Stock Only</span>
          </label>
        </div>
      </div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-slate-200/60 dark:bg-slate-900/50 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Package className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No rewards match your filter</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Try choosing a different category or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRewards.map((reward) => {
            const isOutOfStock = !reward.isUnlimitedStock && reward.stock <= 0;
            const canAfford = user ? userBalance >= reward.pointsRequired : false;

            return (
              <Card
                key={reward.id}
                className="group flex flex-col justify-between overflow-hidden p-0 card-hover-glow border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 shadow-xs"
              >
                {/* Image */}
                <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                  <img
                    src={reward.imageUrl}
                    alt={reward.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="default" className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md text-slate-800 dark:text-slate-200">
                      {reward.category?.name}
                    </Badge>
                  </div>
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {reward.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {reward.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {reward.pointsRequired.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Points</span>
                      </div>

                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {reward.isUnlimitedStock
                          ? 'Instant Digital Delivery'
                          : `${reward.stock} in stock`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/rewards/${reward.slug}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Details
                        </Button>
                      </Link>

                      {user ? (
                        <Button
                          variant={canAfford && !isOutOfStock ? 'primary' : 'secondary'}
                          size="sm"
                          disabled={!canAfford || isOutOfStock}
                          onClick={() => handleOpenRedeemModal(reward)}
                          className="w-full"
                        >
                          {isOutOfStock
                            ? 'Out of Stock'
                            : !canAfford
                            ? 'Need More Pts'
                            : 'Redeem Now'}
                        </Button>
                      ) : (
                        <Link href="/login">
                          <Button variant="primary" size="sm" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Redemption Confirmation Modal (Section 14 & 16) */}
      <Modal
        isOpen={!!selectedReward}
        onClose={() => {
          setSelectedReward(null);
          setRedemptionSuccess(null);
        }}
        title={redemptionSuccess ? 'Redemption Confirmed!' : 'Confirm Reward Redemption'}
        description={
          redemptionSuccess
            ? 'Your order has been safely placed and recorded.'
            : 'Review your points deduction and provide destination details.'
        }
        maxWidth="lg"
      >
        {selectedReward && (
          <div className="space-y-6">
            {redemptionSuccess ? (
              <div className="space-y-6 text-center py-4">
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Order {redemptionSuccess.redemption.redemptionCode} Placed!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    We deducted {selectedReward.pointsRequired.toLocaleString()} points. Remaining balance: {redemptionSuccess.remainingBalance.toLocaleString()} points.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-left space-y-1.5">
                  <div className="flex justify-between">
                    <span>Reward Item:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedReward.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="warning">PENDING REVIEW</Badge>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Link href="/dashboard/redemptions">
                    <Button variant="primary" size="sm">
                      Track in Dashboard
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReward(null);
                      setRedemptionSuccess(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Balance & Deduction summary (Section 14) */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Reward:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedReward.name}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Required Points:</span>
                    <strong className="text-rose-500 dark:text-rose-400 font-bold">
                      -{selectedReward.pointsRequired.toLocaleString()} PTS
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Current Available Balance:</span>
                    <strong className="text-slate-900 dark:text-white">{userBalance.toLocaleString()} PTS</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Balance After Redemption:</span>
                    <span>{(userBalance - selectedReward.pointsRequired).toLocaleString()} PTS</span>
                  </div>
                </div>

                {redemptionError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{redemptionError}</span>
                  </div>
                )}

                {/* Shipping Address Selector (Section 16) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Shipping / Delivery Address
                    </label>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(!useNewAddress)}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        {useNewAddress ? 'Use saved address' : '+ Add new address'}
                      </button>
                    )}
                  </div>

                  {!useNewAddress && addresses.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      >
                        {addresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.fullName} — {addr.addressLine1}, {addr.city} ({addr.country})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Recipient Full Name"
                          value={newAddress.fullName}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, fullName: e.target.value })
                          }
                          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Contact Phone Number"
                          value={newAddress.phone}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, phone: e.target.value })
                          }
                          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address (Line 1)"
                        value={newAddress.addressLine1}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, addressLine1: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                          }
                          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="State / Province"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, state: e.target.value })
                          }
                          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={newAddress.postalCode}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, postalCode: e.target.value })
                          }
                          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Country"
                        value={newAddress.country}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, country: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                      Optional Delivery Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Leave with building reception"
                      value={redemptionNotes}
                      onChange={(e) => setRedemptionNotes(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReward(null)}
                    disabled={isSubmittingRedemption}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isSubmittingRedemption}
                    onClick={handleConfirmRedemption}
                  >
                    Confirm Redemption ({selectedReward.pointsRequired.toLocaleString()} PTS)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
