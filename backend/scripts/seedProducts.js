import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

const PRODUCT_LIMIT = 200;
const categoryTemplates = {
  Laptops: {
    brands: ["ASUS", "Dell", "HP", "Lenovo", "Apple", "MSI"],
    names: ["UltraBook Pro", "CreatorBook", "GamingBook", "Studio Laptop", "Swift Notebook"],
    specs: ["16GB RAM", "512GB SSD", "OLED Display", "Backlit Keyboard"],
    query: "laptop,computer",
    basePrice: 52000,
    images: [
      "1496181133206-80ce9b88a853",
      "1517336714731-489689fd1ca8",
      "1541807084-5c52b6b3adef",
      "1525547719571-a2d4ac8945e2",
      "1484788984921-03950022c9ef",
      "1593640408182-31c70c8268f5",
      "1504222490245-7c927d0c5d68",
      "1542744173-8f7b5a86eac1",
      "1531297484001-80022131f5a1",
      "1509228468518-180dd4864904",
      "1495537776272-529b9c2b4c13",
      "1591405351990-345e9e5d494d",
      "1579586197152-6a0c5c2b7f8f",
      "1555421689-491a97ff2040",
      "1460925895917-afdab827c52f",
      "1507679799987-578555d9e7e6",
      "1542744173-8f7b5a86eac2",
      "1535378768927-24f61e87c4df",
      "1517336714731-489689fd1ca9",
      "1593640408182-31c70c8268f6",
      "1504222490245-7c927d0c5d69",
      "1542744173-8f7b5a86eac3",
      "1531297484001-80022131f5a2",
      "1509228468518-180dd4864905",
      "1591405351990-345e9e5d494e",
      "1579586197152-6a0c5c2b7f8e",
      "1555421689-491a97ff2041",
      "1460925895917-afdab827c52e",
      "1507679799987-578555d9e7e7",
      "1571897046562-9c32a6e6a648"
    ],
  },
  Mobiles: {
    brands: ["Apple", "Samsung", "OnePlus", "Vivo", "Oppo", "Redmi"],
    names: ["Nova Phone", "Pixel Edge", "Galaxy Core", "Reno Max", "Turbo Note"],
    specs: ["AMOLED Display", "256GB Storage", "Fast Charging", "AI Camera"],
    query: "smartphone,mobile",
    basePrice: 18000,
    images: [
      "1598327105666-5b89351aff97",
      "1511707171634-5f897ff02aa9",
      "1565849904461-04a58ad377e0",
      "1605236453806-6ff36851218e",
      "1616348436168-de43ad0db179",
      "1695048133142-1a20484d2569",
      "1592759757826-3b928193c648",
      "1580910051074-3eb6948868a9",
      "1567581935884-3342610693b6",
      "1574944985052-6f9a8788e527",
      "1512438276830-92f5be354bf1",
      "1592759757826-3b928193c649",
      "1580910051074-3eb6948868a0",
      "1567581935884-3342610693b7",
      "1574944985052-6f9a8788e528",
      "1512438276830-92f5be354bf2",
      "1598327105666-5b89351aff98",
      "1511707171634-5f897ff02aa0",
      "1565849904461-04a58ad377e1",
      "1605236453806-6ff368512189",
      "1616348436168-de43ad0db178",
      "1695048133142-1a20484d2560",
      "1592759757826-3b928193c640",
      "1580910051074-3eb6948868a1",
      "1567581935884-3342610693b8",
      "1574944985052-6f9a8788e529",
      "1512438276830-92f5be354bf3",
      "1598327105666-5b89351aff99",
      "1511707171634-5f897ff02aa1",
      "1565849904461-04a58ad377e2"
    ],
  },
  TVs: {
    brands: ["Sony", "Samsung", "LG", "TCL", "OnePlus"],
    names: ["Cinema View", "Neo QLED", "Ultra Vision", "Smart Panel", "Home Theatre TV"],
    specs: ["4K HDR", "Dolby Vision", "120Hz Panel", "Smart Remote"],
    query: "television,tv",
    basePrice: 36000,
    images: [
      "1593784991095-a205069470b6",
      "1601944179066-29786cb9d32a",
      "1461151304267-38535e780c79",
      "1593359633429-81c3f1238e0c",
      "1567016432778-4b44b5e7b4e4",
      "1593359633429-81c3f1238e0d",
      "1567016432778-4b44b5e7b4e5",
      "1461151304267-38535e780c71",
      "1593359633429-81c3f1238e0e",
      "1567016432778-4b44b5e7b4e6",
      "1593784991095-a205069470b9",
      "1601944179066-29786cb9d32d",
      "1461151304267-38535e780c72",
      "1593359633429-81c3f1238e0f",
      "1567016432778-4b44b5e7b4e7",
      "1593784991095-a205069470b0",
      "1601944179066-29786cb9d32e",
      "1461151304267-38535e780c73",
      "1593359633429-81c3f1238e0a",
      "1567016432778-4b44b5e7b4e8",
      "1593784991095-a205069470b1",
      "1601944179066-29786cb9d32f",
      "1461151304267-38535e780c74",
      "1593359633429-81c3f1238e0b",
      "1567016432778-4b44b5e7b4e9",
      "1593784991095-a205069470b2",
      "1601944179066-29786cb9d320",
      "1461151304267-38535e780c75",
      "1593359633429-81c3f1238e0f",
      "1567016432778-4b44b5e7b4ea"
    ],
  },
  Gaming: {
    brands: ["Sony", "Microsoft", "Nintendo", "ASUS ROG", "Logitech"],
    names: ["Console Pro", "Game Station", "Velocity Box", "Arcade Kit", "Elite Controller"],
    specs: ["4K Gaming", "Wireless Controller", "Fast Load", "RGB Lighting"],
    query: "gaming,console",
    basePrice: 22000,
    images: [
      "1606144042614-b2417e99c4e3",
      "1592840496694-26d035b52b48",
      "1580327344181-c1163234e5a0",
      "1621259182978-fbf93132d53d",
      "1578303512597-81e6cc155b3e",
      "1592840496694-26d035b52b49",
      "1580327344181-c1163234e5a1",
      "1621259182978-fbf93132d53e",
      "1578303512597-81e6cc155b3f",
      "1606144042614-b2417e99c4e5",
      "1592840496694-26d035b52b4a",
      "1580327344181-c1163234e5a2",
      "1621259182978-fbf93132d53f",
      "1578303512597-81e6cc155b30",
      "1606144042614-b2417e99c4e6",
      "1592840496694-26d035b52b4b",
      "1580327344181-c1163234e5a3",
      "1621259182978-fbf93132d530",
      "1578303512597-81e6cc155b31",
      "1606144042614-b2417e99c4e7",
      "1592840496694-26d035b52b4c",
      "1580327344181-c1163234e5a4",
      "1621259182978-fbf93132d531",
      "1578303512597-81e6cc155b32",
      "1606144042614-b2417e99c4e8",
      "1592840496694-26d035b52b4d",
      "1580327344181-c1163234e5a5",
      "1621259182978-fbf93132d532",
      "1578303512597-81e6cc155b33",
      "1606144042614-b2417e99c4e9",
      "1592840496694-26d035b52b4e"
    ],
  },
  Cameras: {
    brands: ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic"],
    names: ["Creator Cam", "Street Zoom", "Mirrorless Air", "Photo Pro", "Vlog Camera"],
    specs: ["4K Video", "24MP Sensor", "Fast Autofocus", "WiFi Transfer"],
    query: "camera,photography",
    basePrice: 30000,
    images: [
      "1516035069371-29a1b244cc32",
      "1502920917128-1aa500764cbd",
      "1452780212940-6f5c0d14d848",
      "1526170373596-243a53d5890a",
      "1502920514313-72175b8a56ea",
      "1526170373596-243a53d5890b",
      "1502920514313-72175b8a56eb",
      "1516035069371-29a1b244cc34",
      "1502920917128-1aa500764cbg",
      "1452780212940-6f5c0d14d84a",
      "1526170373596-243a53d5890c",
      "1502920514313-72175b8a56ec",
      "1516035069371-29a1b244cc35",
      "1502920917128-1aa500764cbh",
      "1452780212940-6f5c0d14d84b",
      "1526170373596-243a53d5890d",
      "1502920514313-72175b8a56ed",
      "1516035069371-29a1b244cc36",
      "1502920917128-1aa500764cbi",
      "1452780212940-6f5c0d14d84c",
      "1526170373596-243a53d5890e",
      "1502920514313-72175b8a56ee",
      "1516035069371-29a1b244cc37",
      "1502920917128-1aa500764cbj",
      "1452780212940-6f5c0d14d84d",
      "1526170373596-243a53d5890f",
      "1502920514313-72175b8a56ef",
      "1516035069371-29a1b244cc38",
      "1502920917128-1aa500764cbk",
      "1452780212940-6f5c0d14d84e",
      "1526170373596-243a53d5891a",
      "1502920514313-72175b8a56f0"
    ],
  },
  "Smart Watches": {
    brands: ["Apple", "Samsung", "Garmin", "Fitbit", "Noise"],
    names: ["Watch Active", "Health Band", "Fit Pro", "Pulse Watch", "GPS Tracker"],
    specs: ["AMOLED Display", "Heart Monitor", "GPS", "Sleep Tracking"],
    query: "smartwatch,wearable",
    basePrice: 8000,
    images: [
      "1434493789847-2f02dc6ca35d",
      "1551816230-ef5deaed4a26",
      "1557935728-e6d1eaabe558",
      "1508685096489-7aacd43bd3b1",
      "1523275335684-37898b6baf30",
      "1551816230-ef5deaed4a27",
      "1557935728-e6d1eaabe559",
      "1508685096489-7aacd43bd3b2",
      "1523275335684-37898b6baf31",
      "1434493789847-2f02dc6ca35f",
      "1551816230-ef5deaed4a28",
      "1557935728-e6d1eaabe550",
      "1508685096489-7aacd43bd3b3",
      "1523275335684-37898b6baf32",
      "1434493789847-2f02dc6ca351",
      "1551816230-ef5deaed4a29",
      "1557935728-e6d1eaabe551",
      "1508685096489-7aacd43bd3b4",
      "1523275335684-37898b6baf33",
      "1434493789847-2f02dc6ca352",
      "1551816230-ef5deaed4a2a",
      "1557935728-e6d1eaabe552",
      "1508685096489-7aacd43bd3b5",
      "1523275335684-37898b6baf34",
      "1434493789847-2f02dc6ca353",
      "1551816230-ef5deaed4a2b",
      "1557935728-e6d1eaabe553",
      "1508685096489-7aacd43bd3b6",
      "1523275335684-37898b6baf35",
      "1434493789847-2f02dc6ca354",
      "1551816230-ef5deaed4a2c",
      "1557935728-e6d1eaabe554",
      "1508685096489-7aacd43bd3b7"
    ],
  },
  Speakers: {
    brands: ["JBL", "Sony", "Bose", "Marshall", "Nothing"],
    names: ["Bass Beam", "Party Speaker", "Sound Bar", "Aura Beat", "Portable Boom"],
    specs: ["Deep Bass", "Bluetooth 5.3", "Water Resistant", "Long Battery"],
    query: "speaker,audio",
    basePrice: 5000,
    images: [
      "1545454675-3531b543be5d",
      "1608043152269-423dbba4e7e1",
      "1589003077984-894e133dabab",
      "1558089807-79676c3c39b0",
      "1589003077984-894e133dabac",
      "1545454675-3531b543be5e",
      "1608043152269-423dbba4e7e2",
      "1589003077984-894e133dabad",
      "1558089807-79676c3c39b1",
      "1545454675-3531b543be5f",
      "1608043152269-423dbba4e7e3",
      "1589003077984-894e133dabae",
      "1558089807-79676c3c39b2",
      "1589003077984-894e133dabaf",
      "1545454675-3531b543be50",
      "1608043152269-423dbba4e7e4",
      "1589003077984-894e133dabb0",
      "1558089807-79676c3c39b3",
      "1589003077984-894e133dabb1",
      "1545454675-3531b543be51",
      "1608043152269-423dbba4e7e5",
      "1589003077984-894e133dabb2",
      "1558089807-79676c3c39b4",
      "1589003077984-894e133dabb3",
      "1545454675-3531b543be52",
      "1608043152269-423dbba4e7e6",
      "1589003077984-894e133dabb4",
      "1558089807-79676c3c39b5",
      "1589003077984-894e133dabb5",
      "1545454675-3531b543be53",
      "1608043152269-423dbba4e7e7",
      "1589003077984-894e133dabb6",
      "1558089807-79676c3c39b6"
    ],
  },
};

function createImageUrl(imageId, slot = "main") {
  return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=900&q=80`;
}

function buildProducts(limit) {
  const categories = Object.keys(categoryTemplates);

  return Array.from({ length: limit }, (_, index) => {
    const id = index + 1;
    const category = categories[index % categories.length];
    const template = categoryTemplates[category];
    const brand = template.brands[index % template.brands.length];
    const name = template.names[Math.floor(index / categories.length) % template.names.length];
    const price = template.basePrice + (index % 9) * 4500 + Math.floor(index / categories.length) * 650;
    const rating = Number((4.3 + (index % 7) * 0.1).toFixed(1));
    
    // Assign unique image based on product ID within category
    const imageIndex = index % template.images.length;
    const imageId = template.images[imageIndex];

    return {
      id,
      title: `${brand} ${name} ${String(id).padStart(3, "0")}`,
      brand,
      category,
      price,
      oldPrice: price + 6000 + (index % 5) * 1200,
      rating,
      discount: `${12 + (index % 14)}% OFF`,
      image: createImageUrl(imageId),
      gallery: [
        createImageUrl(template.images[(imageIndex + 1) % template.images.length]),
        createImageUrl(template.images[(imageIndex + 2) % template.images.length]),
        createImageUrl(template.images[(imageIndex + 3) % template.images.length]),
      ],
      specs: template.specs,
      reviews: [
        "Good value product with clean performance.",
        "Looks premium and works well for daily use.",
      ],
    };
  });
}

const productsToSeed = buildProducts(PRODUCT_LIMIT);

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing. Add it in backend/.env");
}

async function seedProducts() {
  await mongoose.connect(process.env.MONGO_URI);

  await Product.deleteMany({});

  const operations = productsToSeed.map((product) => ({
    updateOne: {
      filter: { id: product.id },
      update: { $set: product },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(operations);

  console.log(
    `Seed complete. Kept ${productsToSeed.length} products. Inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}, matched: ${result.matchedCount}`,
  );

  await mongoose.disconnect();
}

seedProducts().catch(async (error) => {
  console.error("Product seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
