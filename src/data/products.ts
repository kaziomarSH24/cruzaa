import { Product } from "@/types/product";
import scooterMain from "@/assets/products/scooter-main.jpg";
import scooterDetail1 from "@/assets/products/scooter-detail-1.jpg";
import scooterDetail2 from "@/assets/products/scooter-detail-2.jpg";
import scooterDetail3 from "@/assets/products/scooter-detail-3.jpg";
import scooterDetail4 from "@/assets/products/scooter-detail-4.jpg";
import scooterDetail5 from "@/assets/products/scooter-detail-5.jpg";

export const products: Product[] = [
  {
    id: "commuta-scooter",
    name: "Cruzaa Commuta Electric Scooter",
    slug: "commuta-electric-scooter",
    category: "electric-scooters",
    categoryName: "Electric Scooters",
    price: 899,
    originalPrice: 1099,
    description: "The ultimate urban companion. Foldable, portable, and packed with premium features for the modern commuter.",
    shortDescription: "Foldable & portable electric scooter",
    images: [scooterMain, scooterDetail1, scooterDetail2, scooterDetail3, scooterDetail4, scooterDetail5],
    specs: {
      topSpeed: "15.5 mph",
      range: "30 miles",
      weight: "14 kg",
      maxLoad: "120 kg",
      chargingTime: "4-5 hours",
      motorPower: "350W"
    },
    features: [
      "Foldable & portable design",
      "Top Speed: 15.5 mph",
      "Range: 30 miles",
      "Detachable battery",
      "LED display",
      "Bluetooth speakers",
      "USB charging port"
    ],
    inStock: true,
    badge: "Best Seller"
  },
  {
    id: "commuta-pro-max",
    name: "Cruzaa Commuta Pro Max Electric Scooter",
    slug: "commuta-pro-max-electric-scooter",
    category: "electric-scooters",
    categoryName: "Electric Scooters",
    price: 1299,
    originalPrice: 1499,
    description: "Our most powerful scooter yet. Extended range, higher speeds, and premium build quality for the serious rider.",
    shortDescription: "High-performance electric scooter",
    images: [scooterDetail1, scooterMain, scooterDetail2, scooterDetail3, scooterDetail4, scooterDetail5],
    specs: {
      topSpeed: "22 mph",
      range: "35 miles",
      weight: "16 kg",
      maxLoad: "130 kg",
      chargingTime: "5-6 hours",
      motorPower: "500W"
    },
    features: [
      "Foldable & portable design",
      "Top Speed: 22 mph",
      "Range: 35 miles",
      "Detachable battery",
      "LED display",
      "Bluetooth speakers",
      "USB charging port",
      "Dual suspension system"
    ],
    inStock: true,
    badge: "Pro"
  },
  {
    id: "sitdown-pro",
    name: "Cruzaa Sit-down Electric Scooter Pro",
    slug: "sitdown-electric-scooter-pro",
    category: "sitdown-scooters",
    categoryName: "Sit-down Scooters",
    price: 1599,
    originalPrice: 1899,
    description: "Experience comfort and style with our premium sit-down scooter. Perfect for longer commutes and leisurely rides.",
    shortDescription: "Foldable sit-down electric scooter",
    images: [scooterMain, scooterDetail5, scooterDetail4, scooterDetail3, scooterDetail2, scooterDetail1],
    specs: {
      topSpeed: "20 mph",
      range: "32 miles",
      weight: "22 kg",
      maxLoad: "140 kg",
      chargingTime: "5-6 hours",
      motorPower: "500W"
    },
    features: [
      "Foldable sit-down design",
      "Top Speed: 20 mph",
      "Range: 32 miles",
      "Water-resistant frame",
      "LED display",
      "USB charging port",
      "Bluetooth speakers",
      "Premium leather seat"
    ],
    inStock: true,
    badge: "Premium"
  },
  {
    id: "urban-ebike",
    name: "Cruzaa Urban E-Bike",
    slug: "urban-e-bike",
    category: "electric-bikes",
    categoryName: "Electric Bikes",
    price: 1899,
    originalPrice: 2199,
    description: "The perfect blend of traditional cycling and electric power. Lightweight, foldable, and ready for any urban adventure.",
    shortDescription: "Foldable lightweight electric bike",
    images: [scooterDetail3, scooterMain, scooterDetail1, scooterDetail2, scooterDetail4, scooterDetail5],
    specs: {
      topSpeed: "18 mph",
      range: "30-35 miles",
      weight: "18 kg",
      maxLoad: "120 kg",
      chargingTime: "4-5 hours",
      motorPower: "350W"
    },
    features: [
      "Foldable lightweight frame",
      "Top Speed: 18 mph",
      "Range: 30-35 miles",
      "LED display",
      "USB charging port",
      "Integrated lights",
      "Shimano gears"
    ],
    inStock: true,
    badge: "New"
  }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(p => p.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.slice(0, 3);
};

export const categories = [
  { id: "electric-scooters", name: "Electric Scooters", description: "Portable and powerful urban mobility" },
  { id: "sitdown-scooters", name: "Sit-down Scooters", description: "Premium comfort for longer rides" },
  { id: "electric-bikes", name: "Electric Bikes", description: "The best of both worlds" }
];
