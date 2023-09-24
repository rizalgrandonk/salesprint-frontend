import { Category } from "@/types/Category";
import { Product } from "@/types/Product";

export const products: Product[] = [
  {
    id: "1",
    slug: "high-end-smartphone",
    name: "High-End Smartphone",
    image: "https://source.unsplash.com/random/?smartphone",
    description: "A high-end smartphone with advanced features.",
    price: 8000000, // 8,000,000 IDR
    featured: true,
  },
  {
    id: "2",
    slug: "powerful-laptop",
    name: "Powerful Laptop",
    image: "https://source.unsplash.com/random/?laptop",
    description: "A powerful laptop for work and entertainment.",
    price: 14000000, // 14,000,000 IDR
    featured: true,
  },
  {
    id: "3",
    slug: "cotton-t-shirt",
    name: "Cotton T-shirt",
    image: "https://source.unsplash.com/random/?t-shirt",
    description: "A comfortable cotton t-shirt for everyday wear.",
    price: 300000, // 300,000 IDR
    featured: false,
  },
  {
    id: "4",
    slug: "stylish-table-lamp",
    name: "Stylish Table Lamp",
    image: "https://source.unsplash.com/random/?table-lamp",
    description: "A stylish table lamp to brighten up your space.",
    price: 1250000, // 1,250,000 IDR
    featured: true,
  },
  {
    id: "5",
    slug: "high-quality-headphones",
    name: "High-Quality Headphones",
    image: "https://source.unsplash.com/random/?headphones",
    description: "High-quality headphones for an immersive audio experience.",
    price: 1500000, // 1,500,000 IDR
    featured: false,
  },
  {
    id: "6",
    slug: "science-fiction-book",
    name: "Science Fiction Book",
    image: "https://source.unsplash.com/random/?book1",
    description:
      "A gripping science fiction novel that will take you on an adventure.",
    price: 150000, // 150,000 IDR
    featured: true,
  },
  {
    id: "7",
    slug: "designer-sofa",
    name: "Designer Sofa",
    image: "https://source.unsplash.com/random/?sofa",
    description: "A designer sofa that combines style and comfort.",
    price: 6500000, // 6,500,000 IDR
    featured: true,
  },
  {
    id: "8",
    slug: "diamond-necklace",
    name: "Diamond Necklace",
    image: "https://source.unsplash.com/random/?necklace",
    description:
      "An exquisite diamond necklace that adds elegance to any outfit.",
    price: 40000000, // 40,000,000 IDR
    featured: false,
  },
  {
    id: "9",
    slug: "soccer-ball",
    name: "Soccer Ball",
    image: "https://source.unsplash.com/random/?soccer-ball",
    description: "A high-quality soccer ball for your sports adventures.",
    price: 450000, // 450,000 IDR
    featured: true,
  },
  {
    id: "10",
    slug: "perfume-set",
    name: "Perfume Set",
    image: "https://source.unsplash.com/random/?perfume",
    description: "A luxurious perfume set that makes a perfect gift.",
    price: 1650000, // 1,650,000 IDR
    featured: false,
  },
  {
    id: "11",
    slug: "coffee-maker",
    name: "Coffee Maker",
    image: "https://source.unsplash.com/random/?coffee-maker",
    description: "A state-of-the-art coffee maker for coffee enthusiasts.",
    price: 2800000, // 2,800,000 IDR
    featured: true,
  },
  {
    id: "12",
    slug: "sneakers",
    name: "Sneakers",
    image: "https://source.unsplash.com/random/?sneakers",
    description: "Stylish and comfortable sneakers for everyday wear.",
    price: 1250000, // 1,250,000 IDR
    featured: false,
  },
  {
    id: "13",
    slug: "laptop-bag",
    name: "Laptop Bag",
    image: "https://source.unsplash.com/random/?laptop-bag",
    description: "A durable and stylish laptop bag to carry your tech gear.",
    price: 650000, // 650,000 IDR
    featured: true,
  },
  {
    id: "14",
    slug: "digital-camera",
    name: "Digital Camera",
    image: "https://source.unsplash.com/random/?camera",
    description: "Capture memories with this high-resolution digital camera.",
    price: 14000000, // 14,000,000 IDR
    featured: true,
  },
  {
    id: "15",
    slug: "wooden-desk",
    name: "Wooden Desk",
    image: "https://source.unsplash.com/random/?wooden-desk",
    description: "A sturdy wooden desk for your home office.",
    price: 3250000, // 3,250,000 IDR
    featured: false,
  },
  {
    id: "16",
    slug: "gaming-console",
    name: "Gaming Console",
    image: "https://source.unsplash.com/random/?gaming-console",
    description: "Experience gaming like never before with this console.",
    price: 9500000, // 9,500,000 IDR
    featured: true,
  },
  {
    id: "17",
    slug: "wristwatch",
    name: "Wristwatch",
    image: "https://source.unsplash.com/random/?wristwatch",
    description: "An elegant wristwatch that complements your style.",
    price: 2200000, // 2,200,000 IDR
    featured: false,
  },
  {
    id: "18",
    slug: "yoga-mat",
    name: "Yoga Mat",
    image: "https://source.unsplash.com/random/?yoga-mat",
    description: "A non-slip yoga mat for your daily yoga practice.",
    price: 280000, // 280,000 IDR
    featured: true,
  },
  {
    id: "19",
    slug: "dining-table",
    name: "Dining Table",
    image: "https://source.unsplash.com/random/?dining-table",
    description: "A spacious dining table for family gatherings.",
    price: 13000000, // 13,000,000 IDR
    featured: false,
  },
  {
    id: "20",
    slug: "earrings",
    name: "Earrings",
    image: "https://source.unsplash.com/random/?earrings",
    description: "Elegant earrings that add a touch of glamour to your look.",
    price: 950000, // 950,000 IDR
    featured: true,
  },
];

export const categories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    image: "https://source.unsplash.com/random/?electronics",
  },
  {
    id: "2",
    name: "Clothing",
    slug: "clothing",
    image: "https://source.unsplash.com/random/?clothing",
  },
  {
    id: "3",
    name: "Home Decor",
    slug: "home-decor",
    image: "https://source.unsplash.com/random/?home-decor",
  },
  {
    id: "4",
    name: "Books",
    slug: "books",
    image: "https://source.unsplash.com/random/?books",
  },
  {
    id: "5",
    name: "Toys",
    slug: "toys",
    image: "https://source.unsplash.com/random/?toys",
  },
  {
    id: "6",
    name: "Furniture",
    slug: "furniture",
    image: "https://source.unsplash.com/random/?furniture",
  },
  {
    id: "7",
    name: "Jewelry",
    slug: "jewelry",
    image: "https://source.unsplash.com/random/?jewelry",
  },
  {
    id: "8",
    name: "Sports",
    slug: "sports",
    image: "https://source.unsplash.com/random/?sports",
  },
  {
    id: "9",
    name: "Beauty",
    slug: "beauty",
    image: "https://source.unsplash.com/random/?beauty",
  },
];
