export type TCGProduct = {
  id: string;
  name: string;
  set: string;
  condition: "NM" | "LP" | "MP" | "HP";
  price: number;
  quantity: number;
  lastSold: string;
  totalSales: number;
  imageUrl: string;
};

export type SalesData = {
  date: string;
  sales: number;
  scans: number;
};

export const sampleProducts: TCGProduct[] = [
  {
    id: "1",
    name: "Charizard ex",
    set: "Scarlet & Violet 151",
    condition: "NM",
    price: 89.99,
    quantity: 5,
    lastSold: "2024-03-15",
    totalSales: 449.95,
    imageUrl: "/cards/charizard-ex.jpg",
  },
  {
    id: "2",
    name: "Mewtwo V-Union",
    set: "Pokemon GO",
    condition: "LP",
    price: 45.00,
    quantity: 3,
    lastSold: "2024-03-14",
    totalSales: 135.00,
    imageUrl: "/cards/mewtwo-v-union.jpg",
  },
  {
    id: "3",
    name: "Blue-Eyes White Dragon",
    set: "Legend of Blue Eyes White Dragon",
    condition: "NM",
    price: 299.99,
    quantity: 1,
    lastSold: "2024-03-10",
    totalSales: 299.99,
    imageUrl: "/cards/blue-eyes.jpg",
  },
  {
    id: "4",
    name: "Black Lotus",
    set: "Alpha",
    condition: "MP",
    price: 9999.99,
    quantity: 1,
    lastSold: "2024-03-01",
    totalSales: 9999.99,
    imageUrl: "/cards/black-lotus.jpg",
  },
  {
    id: "5",
    name: "Sol Ring",
    set: "Commander Masters",
    condition: "NM",
    price: 12.99,
    quantity: 20,
    lastSold: "2024-03-15",
    totalSales: 259.80,
    imageUrl: "/cards/sol-ring.jpg",
  },
];

export const salesData: SalesData[] = [
  { date: "2024-03-01", sales: 1200, scans: 45 },
  { date: "2024-03-02", sales: 980, scans: 38 },
  { date: "2024-03-03", sales: 1500, scans: 52 },
  { date: "2024-03-04", sales: 1100, scans: 42 },
  { date: "2024-03-05", sales: 1300, scans: 48 },
  { date: "2024-03-06", sales: 1600, scans: 55 },
  { date: "2024-03-07", sales: 1400, scans: 50 },
];

export const stats = {
  totalInventory: 30,
  totalValue: 11206.73,
  averagePrice: 373.56,
  mostSoldCard: "Sol Ring",
  mostValuableCard: "Black Lotus",
  totalScans: 330,
  totalSales: 9140,
}; 