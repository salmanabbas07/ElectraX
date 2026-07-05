import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing. Add it in backend/.env");
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function hash(productId, salt = 0) {
  const safeId = typeof productId === 'number' && !isNaN(productId) ? productId :
                 (typeof productId === 'string' ? productId.charCodeAt(0) : 1);
  return Math.abs((safeId * 2654435761 + salt * 40503) % 2147483647);
}

/** Pick from array deterministically */
function pick(arr, productId, salt = 0) {
  return arr[hash(productId, salt) % arr.length];
}

/** Price tier bucket */
function priceTier(price) {
  if (price < 15000) return "budget";
  if (price < 40000) return "mid";
  if (price < 80000) return "premium";
  return "flagship";
}

// ---------------------------------------------------------------------------
// 1. DESCRIPTIONS — 10 templates per category, interpolated with title/brand
// ---------------------------------------------------------------------------

const descriptionTemplates = {
  Mobiles: [
    (t, b) => `The ${t} by ${b} delivers a seamless mobile experience with its powerful chipset and stunning display, perfect for multitasking and media consumption.`,
    (t, b) => `Experience exceptional photography and all-day battery life with the ${t} from ${b}, designed for users who demand top-tier performance on the go.`,
    (t, b) => `${b} redefines smartphone excellence with the ${t}, combining a sleek design, vibrant screen, and advanced camera system in one compelling package.`,
    (t, b) => `Stay connected and productive with the ${t}. ${b} has engineered this device to offer blazing-fast speeds and an immersive multimedia experience.`,
    (t, b) => `Capture every moment in vivid detail with the ${t}. ${b}'s latest offering balances cutting-edge technology with elegant aesthetics effortlessly.`,
    (t, b) => `The ${t} from ${b} is built for speed and style, featuring a high-refresh-rate display and optimized battery management for power users.`,
    (t, b) => `Unlock new possibilities with the ${t} by ${b}, a smartphone that excels in gaming, photography, and everyday productivity without compromise.`,
    (t, b) => `${b} pushes boundaries with the ${t}, offering a refined user experience backed by a robust processor and AI-enhanced camera capabilities.`,
    (t, b) => `Sleek, powerful, and reliable — the ${t} from ${b} is engineered to keep up with your lifestyle, from dawn till dusk.`,
    (t, b) => `Featuring a pro-grade camera and lightning-fast performance, the ${t} by ${b} sets a new benchmark for modern smartphones.`,
  ],
  Laptops: [
    (t, b) => `The ${t} from ${b} combines raw computing power with a portable form factor, making it the ideal companion for professionals and creatives alike.`,
    (t, b) => `Boost your productivity with the ${t} by ${b}, featuring a high-performance processor, vivid display, and all-day battery life in a lightweight chassis.`,
    (t, b) => `${b} delivers workstation-class performance in the ${t}, perfect for demanding workflows, content creation, and multitasking without thermal throttling.`,
    (t, b) => `From coding marathons to video editing sessions, the ${t} by ${b} handles it all with its cutting-edge hardware and refined build quality.`,
    (t, b) => `Experience premium computing with the ${t}. ${b} has crafted a laptop that balances performance, portability, and display excellence seamlessly.`,
    (t, b) => `The ${t} from ${b} empowers you to work anywhere, anytime — with fast storage, responsive keyboards, and an immersive screen estate.`,
    (t, b) => `Whether you're a student or a professional, the ${t} by ${b} offers the right blend of speed, battery endurance, and build precision.`,
    (t, b) => `${b}'s ${t} stands out with its sleek aluminium design, vibrant color-accurate display, and whisper-quiet cooling for uninterrupted focus.`,
    (t, b) => `Power through your toughest tasks with the ${t} from ${b}, engineered with next-gen silicon and smart thermal management for sustained performance.`,
    (t, b) => `The ${t} by ${b} is a versatile powerhouse, offering seamless multitasking, stunning visuals, and enterprise-grade security in one sleek package.`,
  ],
  TVs: [
    (t, b) => `Transform your living room with the ${t} from ${b}, offering cinema-grade picture quality and immersive sound that brings every scene to life.`,
    (t, b) => `The ${t} by ${b} delivers breathtaking 4K visuals paired with Dolby-enhanced audio, making it the centrepiece of any home entertainment setup.`,
    (t, b) => `Experience movies, sports, and gaming like never before with the ${t}. ${b}'s advanced panel technology produces deep blacks and vibrant colours.`,
    (t, b) => `${b} brings smart entertainment home with the ${t}, featuring a built-in voice assistant, seamless app ecosystem, and stunning HDR performance.`,
    (t, b) => `Elevate your viewing experience with the ${t} from ${b}, designed with ultra-slim bezels and an AI-powered picture engine for lifelike clarity.`,
    (t, b) => `The ${t} by ${b} turns any content into a visual spectacle with its wide colour gamut, high refresh rate, and adaptive brightness.`,
    (t, b) => `Stream, game, and binge-watch in style with the ${t}. ${b}'s smart TV platform offers instant access to thousands of apps and channels.`,
    (t, b) => `With Dolby Vision and Atmos support, the ${t} from ${b} delivers a truly cinematic experience right in the comfort of your home.`,
    (t, b) => `${b}'s ${t} combines elegant design with powerful processing, delivering smooth motion handling and brilliant picture quality across all content types.`,
    (t, b) => `The ${t} by ${b} is your gateway to premium entertainment — featuring crystal-clear resolution, rich bass output, and effortless smart connectivity.`,
  ],
  Gaming: [
    (t, b) => `Dominate every match with the ${t} from ${b}, built for competitive gamers who demand lightning-fast response times and immersive gameplay.`,
    (t, b) => `The ${t} by ${b} unlocks next-gen gaming with powerful hardware, expansive storage, and a vast library of titles at your fingertips.`,
    (t, b) => `${b} delivers an unrivalled gaming experience with the ${t}, combining high-fidelity graphics, low-latency input, and premium build quality.`,
    (t, b) => `Level up your setup with the ${t}. ${b}'s engineering ensures smooth frame rates, rapid load times, and hours of uninterrupted play.`,
    (t, b) => `From AAA blockbusters to indie gems, the ${t} from ${b} handles every title with ease, delivering stunning visuals and responsive controls.`,
    (t, b) => `The ${t} by ${b} is the ultimate gaming companion, offering ergonomic design, adaptive triggers, and seamless online connectivity for every gamer.`,
    (t, b) => `Experience gaming without limits with the ${t}. ${b} has packed cutting-edge tech into a sleek form factor built for marathon sessions.`,
    (t, b) => `${b}'s ${t} redefines what a gaming device can do, with ray-tracing support, 3D audio, and a vibrant ecosystem of exclusive content.`,
    (t, b) => `Get the competitive edge with the ${t} from ${b}, featuring high-refresh visuals, customisable controls, and ultra-fast connectivity for online play.`,
    (t, b) => `The ${t} by ${b} brings console-quality gaming to new heights with its advanced chipset, immersive haptics, and expandable storage options.`,
  ],
  Cameras: [
    (t, b) => `Capture the world in stunning detail with the ${t} from ${b}, a camera that empowers both professionals and enthusiasts with exceptional image quality.`,
    (t, b) => `The ${t} by ${b} delivers outstanding low-light performance and razor-sharp autofocus, making every shot a masterpiece regardless of conditions.`,
    (t, b) => `${b} raises the bar with the ${t}, offering a high-resolution sensor, weather-sealed body, and intuitive controls for effortless shooting.`,
    (t, b) => `From landscapes to portraits, the ${t} from ${b} produces rich, true-to-life colours and impressive dynamic range in every frame.`,
    (t, b) => `The ${t} by ${b} is designed for creators who need speed and precision — with continuous shooting, 4K video, and reliable battery endurance.`,
    (t, b) => `Unleash your creativity with the ${t}. ${b}'s advanced imaging engine processes photos with remarkable clarity and natural skin tones.`,
    (t, b) => `Whether in the studio or the wild, the ${t} from ${b} delivers consistent, professional-grade results with its versatile lens ecosystem.`,
    (t, b) => `${b}'s ${t} combines cutting-edge sensor technology with a lightweight body, making it the perfect travel companion for serious photographers.`,
    (t, b) => `The ${t} by ${b} offers lightning-fast autofocus tracking, 4K cinematic video, and a robust build that withstands demanding shooting environments.`,
    (t, b) => `Elevate your photography with the ${t} from ${b}, featuring in-body stabilisation, dual card slots, and a high-resolution electronic viewfinder.`,
  ],
  "Smart Watches": [
    (t, b) => `Stay connected and on top of your fitness goals with the ${t} from ${b}, a smartwatch that blends health tracking with everyday convenience.`,
    (t, b) => `The ${t} by ${b} keeps you informed with real-time notifications, GPS tracking, and comprehensive health monitoring right on your wrist.`,
    (t, b) => `${b} combines style and substance in the ${t}, offering an always-on display, heart-rate monitoring, and multi-day battery life.`,
    (t, b) => `Track workouts, manage calls, and monitor your sleep with the ${t}. ${b}'s wearable technology adapts to your active lifestyle seamlessly.`,
    (t, b) => `The ${t} from ${b} is your ultimate wellness companion, featuring SpO2 tracking, stress monitoring, and over 100 workout modes.`,
    (t, b) => `Experience smart living with the ${t} by ${b}, designed with a vibrant AMOLED display, water resistance, and customisable watch faces.`,
    (t, b) => `${b}'s ${t} empowers you to take charge of your health with advanced sensors, guided breathing exercises, and activity reminders.`,
    (t, b) => `From morning runs to boardroom meetings, the ${t} from ${b} transitions effortlessly with its elegant design and smart notification system.`,
    (t, b) => `The ${t} by ${b} offers best-in-class battery life, accurate fitness tracking, and seamless smartphone integration for the modern professional.`,
    (t, b) => `Upgrade your wrist with the ${t}. ${b} delivers a premium smartwatch experience with voice assistant support, NFC payments, and health insights.`,
  ],
  Speakers: [
    (t, b) => `Fill any room with rich, immersive sound using the ${t} from ${b}, a speaker that delivers audiophile-grade performance in a portable package.`,
    (t, b) => `The ${t} by ${b} combines deep bass, crystal-clear highs, and rugged durability for music lovers who want great sound everywhere they go.`,
    (t, b) => `${b} brings studio-quality audio to your fingertips with the ${t}, featuring custom-tuned drivers and multi-device Bluetooth connectivity.`,
    (t, b) => `Take your music outdoors with the ${t}. ${b}'s weather-resistant design and powerful output ensure the party never stops.`,
    (t, b) => `Experience 360-degree sound with the ${t} from ${b}, engineered for balanced audio reproduction and extended wireless range.`,
    (t, b) => `The ${t} by ${b} is the perfect blend of portability and power, delivering room-filling sound from an ultra-compact form factor.`,
    (t, b) => `${b}'s ${t} redefines portable audio with its long-lasting battery, IPX-rated water resistance, and deep, punchy bass response.`,
    (t, b) => `Whether at home or on an adventure, the ${t} from ${b} delivers consistent, high-fidelity sound with zero distortion at any volume.`,
    (t, b) => `Stream your favourite tracks in stunning clarity with the ${t} by ${b}, featuring multi-room support and voice assistant integration.`,
    (t, b) => `The ${t} from ${b} turns any space into a concert venue with its dynamic equaliser, wireless stereo pairing, and premium acoustics.`,
  ],
};

function generateDescription(product) {
  const templates = descriptionTemplates[product.category] || descriptionTemplates.Mobiles;
  // Fallback to a safe number if product.id is missing or not a number
  const safeId = typeof product.id === 'number' && !isNaN(product.id) ? product.id : 
                 (typeof product._id === 'string' ? product._id.charCodeAt(0) : 1);
  const idx = hash(safeId, 7) % templates.length;
  const template = templates[idx];
  
  if (typeof template === 'function') {
    return template(product.title || 'Product', product.brand || 'Brand');
  }
  return "Designed for people who want speed, premium materials and a sharper everyday tech experience without extra fuss.";
}

// ---------------------------------------------------------------------------
// 2. CATEGORY-SPECIFIC SPECS — varying by price tier
// ---------------------------------------------------------------------------

const specTemplates = {
  Mobiles: (tier, pid) => {
    const displays = {
      budget: ["6.5 inch IPS LCD", "6.4 inch HD+ LCD", "6.6 inch IPS HD+", "6.5 inch HD+ TFT"],
      mid: ["6.5 inch Full HD+ AMOLED", "6.6 inch Super AMOLED", "6.4 inch Full HD+ IPS", "6.7 inch AMOLED 90Hz"],
      premium: ["6.7 inch Super AMOLED 120Hz", "6.6 inch LTPO AMOLED", "6.5 inch Dynamic AMOLED 2X", "6.8 inch Fluid AMOLED 120Hz"],
      flagship: ["6.8 inch LTPO AMOLED 120Hz", "6.7 inch Dynamic AMOLED 2X 120Hz", "6.9 inch ProMotion OLED", "6.7 inch Super Retina XDR"],
    };
    const processors = {
      budget: ["MediaTek Helio G35", "Snapdragon 460", "Unisoc T612", "MediaTek Helio G85"],
      mid: ["Snapdragon 695", "MediaTek Dimensity 7050", "Snapdragon 778G", "MediaTek Dimensity 8100"],
      premium: ["Snapdragon 8 Gen 1", "MediaTek Dimensity 9200", "Snapdragon 8+ Gen 1", "Google Tensor G3"],
      flagship: ["Snapdragon 8 Gen 3", "Apple A17 Pro", "Snapdragon 8 Elite", "Samsung Exynos 2400"],
    };
    const rams = { budget: ["3GB", "4GB"], mid: ["6GB", "8GB"], premium: ["8GB", "12GB"], flagship: ["12GB", "16GB"] };
    const storages = { budget: ["32GB", "64GB"], mid: ["128GB", "256GB"], premium: ["256GB", "512GB"], flagship: ["256GB", "512GB", "1TB"] };
    const batteries = { budget: ["4000 mAh", "5000 mAh"], mid: ["5000 mAh", "4500 mAh"], premium: ["4500 mAh", "5000 mAh"], flagship: ["5000 mAh", "4855 mAh", "5500 mAh"] };
    const rearCams = { budget: ["13MP Dual", "48MP Triple", "50MP Dual"], mid: ["64MP Triple", "50MP Triple OIS", "108MP Quad"], premium: ["108MP Triple OIS", "50MP Triple OIS + Telephoto", "200MP Quad"], flagship: ["200MP Quad OIS", "50MP Triple Periscope Zoom", "48MP ProRAW Triple"] };
    const frontCams = { budget: ["5MP", "8MP"], mid: ["16MP", "32MP"], premium: ["32MP", "12MP Ultra-Wide"], flagship: ["12MP TrueDepth", "32MP Autofocus", "16MP Ultra-Wide"] };
    const oses = { budget: ["Android 13", "Android 14 Go"], mid: ["Android 14", "Android 14 (One UI 6)"], premium: ["Android 14 (OxygenOS 14)", "iOS 17"], flagship: ["Android 14 (One UI 6.1)", "iOS 18", "Android 15"] };

    return [
      `Display: ${pick(displays[tier], pid, 10)}`,
      `Processor: ${pick(processors[tier], pid, 11)}`,
      `RAM: ${pick(rams[tier], pid, 12)}`,
      `Storage: ${pick(storages[tier], pid, 13)}`,
      `Battery: ${pick(batteries[tier], pid, 14)}`,
      `Camera (Rear): ${pick(rearCams[tier], pid, 15)}`,
      `Camera (Front): ${pick(frontCams[tier], pid, 16)}`,
      `OS: ${pick(oses[tier], pid, 17)}`,
    ];
  },

  Laptops: (tier, pid) => {
    const processors = {
      budget: ["Intel Core i3-1215U", "AMD Ryzen 3 7320U", "Intel Celeron N5100", "Intel Core i3-1115G4"],
      mid: ["Intel Core i5-1340P", "AMD Ryzen 5 7530U", "Intel Core i5-12450H", "AMD Ryzen 5 7535HS"],
      premium: ["Intel Core i7-13700H", "AMD Ryzen 7 7840HS", "Apple M2 Pro", "Intel Core i7-1365H"],
      flagship: ["Intel Core i9-14900HX", "Apple M3 Max", "AMD Ryzen 9 7945HX", "Intel Core Ultra 9 185H"],
    };
    const rams = { budget: ["4GB DDR4", "8GB DDR4"], mid: ["8GB DDR5", "16GB DDR4"], premium: ["16GB DDR5", "32GB DDR5"], flagship: ["32GB DDR5", "64GB DDR5", "36GB Unified"] };
    const storages = { budget: ["256GB SSD", "512GB HDD", "256GB eMMC"], mid: ["512GB NVMe SSD", "256GB NVMe SSD"], premium: ["512GB NVMe SSD", "1TB NVMe SSD"], flagship: ["1TB NVMe SSD", "2TB NVMe SSD", "1TB Gen4 NVMe"] };
    const displays = {
      budget: ["15.6 inch Full HD IPS", "14 inch HD TN", "15.6 inch HD Anti-Glare"],
      mid: ["14 inch Full HD IPS 60Hz", "15.6 inch Full HD IPS 144Hz", "16 inch Full HD+ IPS"],
      premium: ["14 inch 2.8K OLED 90Hz", "16 inch QHD+ IPS 165Hz", "15.6 inch Full HD IPS 300Hz"],
      flagship: ["16 inch Mini-LED 3456x2234 120Hz", "14 inch 3K OLED 120Hz", "16 inch 4K OLED 120Hz"],
    };
    const gpus = {
      budget: ["Integrated Intel UHD", "AMD Radeon Vega 3", "Intel UHD 730"],
      mid: ["NVIDIA GeForce RTX 3050", "AMD Radeon RX 6500M", "Intel Iris Xe"],
      premium: ["NVIDIA GeForce RTX 4060", "AMD Radeon RX 7600M", "NVIDIA RTX 4050 6GB"],
      flagship: ["NVIDIA GeForce RTX 4090", "NVIDIA RTX 4080 12GB", "Apple M3 Max 40-core GPU"],
    };
    const batteries = { budget: ["37 Wh", "42 Wh"], mid: ["54 Wh", "57 Wh"], premium: ["72 Wh", "86 Wh"], flagship: ["99.8 Wh", "96 Wh", "100 Wh"] };
    const oses = { budget: ["Windows 11 Home", "FreeDOS"], mid: ["Windows 11 Home", "Windows 11 Pro"], premium: ["Windows 11 Pro", "macOS Sonoma"], flagship: ["Windows 11 Pro", "macOS Sequoia"] };
    const weights = { budget: ["1.8 kg", "2.1 kg"], mid: ["1.6 kg", "1.7 kg"], premium: ["1.4 kg", "1.8 kg"], flagship: ["1.6 kg", "2.4 kg", "1.55 kg"] };

    return [
      `Processor: ${pick(processors[tier], pid, 20)}`,
      `RAM: ${pick(rams[tier], pid, 21)}`,
      `Storage: ${pick(storages[tier], pid, 22)}`,
      `Display: ${pick(displays[tier], pid, 23)}`,
      `GPU: ${pick(gpus[tier], pid, 24)}`,
      `Battery: ${pick(batteries[tier], pid, 25)}`,
      `OS: ${pick(oses[tier], pid, 26)}`,
      `Weight: ${pick(weights[tier], pid, 27)}`,
    ];
  },

  TVs: (tier, pid) => {
    const sizes = { budget: ["32 inch", "40 inch", "43 inch"], mid: ["43 inch", "50 inch", "55 inch"], premium: ["55 inch", "65 inch"], flagship: ["65 inch", "75 inch", "85 inch"] };
    const resolutions = { budget: ["HD Ready (720p)", "Full HD (1080p)"], mid: ["Full HD (1080p)", "4K Ultra HD"], premium: ["4K Ultra HD", "4K HDR10+"], flagship: ["4K OLED", "8K QLED", "4K MicroLED"] };
    const panels = { budget: ["LED", "VA Panel"], mid: ["IPS LED", "QLED"], premium: ["QLED", "OLED"], flagship: ["OLED Evo", "QD-OLED", "Neo QLED"] };
    const hdrs = { budget: ["HDR10", "No"], mid: ["HDR10", "HDR10+"], premium: ["HDR10+", "Dolby Vision"], flagship: ["Dolby Vision IQ", "HDR10+ Adaptive", "Dolby Vision + HDR10+"] };
    const oses = { budget: ["Android TV 11", "WebOS Lite", "Linux-based"], mid: ["Google TV", "WebOS 23", "Tizen 7.0"], premium: ["Google TV", "WebOS 24", "Tizen 8.0"], flagship: ["WebOS 24", "Tizen 8.0", "Google TV (AI-enhanced)"] };
    const speakers = { budget: ["10W Stereo", "16W Dual"], mid: ["20W with Dolby Audio", "24W Stereo"], premium: ["40W with Dolby Atmos", "30W Harman Kardon"], flagship: ["60W Dolby Atmos 4.2 ch", "80W with Sub", "50W Dolby Atmos 2.2 ch"] };
    const refreshRates = { budget: ["60Hz", "50Hz"], mid: ["60Hz", "120Hz"], premium: ["120Hz", "144Hz"], flagship: ["120Hz VRR", "144Hz HDMI 2.1"] };
    const ports = { budget: ["2 HDMI, 1 USB", "3 HDMI, 2 USB"], mid: ["3 HDMI, 2 USB, 1 Optical", "3 HDMI 2.0, 2 USB"], premium: ["4 HDMI 2.1, 3 USB, eARC", "3 HDMI 2.1, 2 USB, eARC"], flagship: ["4 HDMI 2.1, 3 USB, eARC, Ethernet", "4 HDMI 2.1, 3 USB, eARC, Wi-Fi 6E"] };

    return [
      `Screen Size: ${pick(sizes[tier], pid, 30)}`,
      `Resolution: ${pick(resolutions[tier], pid, 31)}`,
      `Panel Type: ${pick(panels[tier], pid, 32)}`,
      `HDR: ${pick(hdrs[tier], pid, 33)}`,
      `Smart TV OS: ${pick(oses[tier], pid, 34)}`,
      `Speakers: ${pick(speakers[tier], pid, 35)}`,
      `Refresh Rate: ${pick(refreshRates[tier], pid, 36)}`,
      `Ports: ${pick(ports[tier], pid, 37)}`,
    ];
  },

  Gaming: (tier, pid) => {
    const types = {
      budget: ["Handheld Console", "Gaming Controller", "Gaming Headset"],
      mid: ["Gaming Console", "Gaming Laptop Accessory Kit", "VR Headset Entry"],
      premium: ["Home Console", "Gaming Laptop", "VR Headset"],
      flagship: ["Premium Home Console", "High-End Gaming PC", "Pro Gaming Setup"],
    };
    const processorChips = {
      budget: ["Custom ARM Cortex-A55", "Quad-core 1.8 GHz", "MediaTek MT8183"],
      mid: ["AMD Zen 2 Custom APU", "Snapdragon XR2 Gen 1", "Custom AMD Ryzen"],
      premium: ["AMD Zen 2 8-core 3.5 GHz", "Snapdragon XR2 Gen 2", "AMD Ryzen 7 7840U"],
      flagship: ["Custom AMD Zen 4", "Apple M2 Ultra", "AMD Ryzen 9 7945HX3D"],
    };
    const connectivities = {
      budget: ["Bluetooth 5.0", "Bluetooth 5.0 + USB-C", "Wi-Fi 5"],
      mid: ["Bluetooth 5.1 + Wi-Fi 5", "Wi-Fi 6 + Bluetooth 5.2", "USB-C + Wi-Fi 6"],
      premium: ["Wi-Fi 6 + Bluetooth 5.2 + Ethernet", "Wi-Fi 6E + Bluetooth 5.3", "Wi-Fi 6 + USB-C 3.2"],
      flagship: ["Wi-Fi 6E + Bluetooth 5.3 + Ethernet", "Wi-Fi 7 + Bluetooth 5.4", "Thunderbolt 4 + Wi-Fi 6E"],
    };
    const storages = { budget: ["64GB eMMC", "N/A", "32GB"], mid: ["256GB SSD", "128GB", "512GB SSD"], premium: ["512GB NVMe SSD", "825GB Custom SSD", "1TB NVMe"], flagship: ["1TB NVMe SSD", "2TB NVMe SSD", "1TB Custom SSD"] };
    const controllers = { budget: ["Built-in Controls", "Included Wireless Controller", "N/A"], mid: ["DualSense Wireless", "Wireless Controller", "Touch Controllers"], premium: ["DualSense Edge", "Xbox Elite Controller", "Pro Controller"], flagship: ["Adaptive Haptic Controller", "DualSense Edge Pro", "Custom Mechanical Controller"] };
    const resolutions = { budget: ["720p", "1080p", "N/A"], mid: ["1080p", "1440p", "1832x1920 per eye"], premium: ["4K", "1440p 120fps", "2064x2208 per eye"], flagship: ["4K 120fps", "8K upscaled", "Native 4K HDR"] };
    const compatibilities = { budget: ["Mobile + PC", "PC / Console", "Multi-platform"], mid: ["PlayStation / PC", "Meta Quest Store", "Steam + Epic"], premium: ["PlayStation 5", "Xbox Series X|S", "Steam / PC"], flagship: ["PlayStation 5 Pro", "Xbox Series X|S + PC", "Full PC VR + Standalone"] };

    return [
      `Type: ${pick(types[tier], pid, 40)}`,
      `Processor/Chipset: ${pick(processorChips[tier], pid, 41)}`,
      `Connectivity: ${pick(connectivities[tier], pid, 42)}`,
      `Storage: ${pick(storages[tier], pid, 43)}`,
      `Controller: ${pick(controllers[tier], pid, 44)}`,
      `Resolution: ${pick(resolutions[tier], pid, 45)}`,
      `Compatibility: ${pick(compatibilities[tier], pid, 46)}`,
    ];
  },

  Cameras: (tier, pid) => {
    const sensors = {
      budget: ["1/2.3 inch CMOS", "APS-C CMOS 23.5x15.6mm", "1 inch BSI-CMOS"],
      mid: ["APS-C CMOS 23.5x15.6mm", "APS-C X-Trans CMOS 4", "APS-C CMOS 22.3x14.9mm"],
      premium: ["Full-Frame CMOS 35.9x24mm", "Full-Frame BSI-CMOS", "APS-C X-Trans CMOS 5 HR"],
      flagship: ["Full-Frame Stacked CMOS", "Medium Format 43.8x32.9mm", "Full-Frame BSI-CMOS II"],
    };
    const resolutions = { budget: ["16 MP", "20 MP", "24.2 MP"], mid: ["24.2 MP", "26.1 MP", "32.5 MP"], premium: ["33 MP", "45 MP", "40.2 MP"], flagship: ["50.1 MP", "61 MP", "102 MP"] };
    const mounts = { budget: ["Fixed Lens", "Canon EF-S", "Micro Four Thirds"], mid: ["Canon RF", "Fujifilm X", "Nikon Z DX"], premium: ["Sony E (Full-Frame)", "Canon RF", "Nikon Z"], flagship: ["Sony E (Full-Frame)", "Canon RF", "Fujifilm G"] };
    const isos = { budget: ["100 – 6400", "100 – 12800"], mid: ["100 – 25600", "160 – 12800", "100 – 51200"], premium: ["50 – 102400", "64 – 51200", "100 – 204800"], flagship: ["50 – 204800", "64 – 102400", "100 – 409600"] };
    const videos = { budget: ["Full HD 30fps", "Full HD 60fps", "4K 15fps"], mid: ["4K 30fps", "4K 60fps (cropped)", "6.2K 30fps"], premium: ["4K 60fps", "4K 120fps", "8K 30fps"], flagship: ["8K 30fps RAW", "4K 120fps 10-bit", "ProRes 4K 60fps"] };
    const displaySizes = { budget: ["3.0 inch Fixed LCD", "3.0 inch Tilt LCD"], mid: ["3.0 inch Vari-Angle Touchscreen", "3.0 inch Tilt Touchscreen"], premium: ["3.2 inch Vari-Angle Touchscreen", "3.0 inch Dual-Axis Tilt"], flagship: ["3.2 inch Vari-Angle Touch OLED", "3.2 inch 4-Axis Multi-Angle"] };
    const batteryLives = { budget: ["250 shots", "310 shots", "380 shots"], mid: ["440 shots", "500 shots", "600 shots"], premium: ["580 shots", "740 shots", "610 shots"], flagship: ["700 shots", "900 shots", "530 shots (video-optimised)"] };
    const weights = { budget: ["290g", "365g", "450g"], mid: ["429g", "471g", "510g"], premium: ["580g", "650g", "710g"], flagship: ["735g", "900g", "1115g"] };

    return [
      `Sensor: ${pick(sensors[tier], pid, 50)}`,
      `Resolution: ${pick(resolutions[tier], pid, 51)}`,
      `Lens Mount: ${pick(mounts[tier], pid, 52)}`,
      `ISO Range: ${pick(isos[tier], pid, 53)}`,
      `Video Recording: ${pick(videos[tier], pid, 54)}`,
      `Display: ${pick(displaySizes[tier], pid, 55)}`,
      `Battery Life: ${pick(batteryLives[tier], pid, 56)}`,
      `Weight: ${pick(weights[tier], pid, 57)}`,
    ];
  },

  "Smart Watches": (tier, pid) => {
    const displays = {
      budget: ["1.3 inch TFT LCD", "1.4 inch IPS LCD", "1.69 inch TFT Touch"],
      mid: ["1.4 inch AMOLED", "1.43 inch Super AMOLED", "1.39 inch AMOLED"],
      premium: ["1.4 inch AMOLED Always-On", "1.43 inch Super AMOLED 466x466", "1.5 inch LTPO AMOLED"],
      flagship: ["1.5 inch LTPO AMOLED Always-On", "1.47 inch Sapphire AMOLED", "1.45 inch OLED Retina"],
    };
    const sensors = {
      budget: ["Heart Rate, SpO2", "Heart Rate, Pedometer", "Heart Rate, SpO2, Sleep"],
      mid: ["Heart Rate, SpO2, Stress, Sleep", "Heart Rate, SpO2, Blood Pressure", "Heart Rate, SpO2, GPS, Altimeter"],
      premium: ["HR, SpO2, ECG, Temperature", "HR, SpO2, Stress, GPS, Altimeter, Compass", "HR, SpO2, ECG, Blood Pressure"],
      flagship: ["HR, SpO2, ECG, Temperature, Depth Gauge", "HR, SpO2, ECG, Body Composition, GPS", "HR, SpO2, ECG, Temperature, Crash Detection"],
    };
    const batteryLives = { budget: ["7 days", "10 days", "5 days"], mid: ["14 days", "10 days", "7 days"], premium: ["3 days", "5 days (AOD), 7 days", "18 hours (Always-On)"], flagship: ["36 hours (Always-On)", "4 days", "14 days (ultra-saver)"] };
    const waterResistances = { budget: ["IP67", "IP68", "3 ATM"], mid: ["5 ATM", "IP68 + Pool Swimming", "5 ATM"], premium: ["5 ATM + Open Water", "10 ATM", "WR50"], flagship: ["10 ATM", "EN13319 Diving", "WR100"] };
    const connectivities = { budget: ["Bluetooth 5.0", "Bluetooth 5.1"], mid: ["Bluetooth 5.2 + GPS", "Bluetooth 5.0 + Wi-Fi", "Bluetooth 5.2 + GPS + GLONASS"], premium: ["Bluetooth 5.3 + Wi-Fi + GPS", "LTE + Bluetooth 5.2 + GPS", "Bluetooth 5.3 + Wi-Fi + NFC"], flagship: ["LTE + Bluetooth 5.3 + Wi-Fi + GPS + NFC", "Bluetooth 5.3 + Dual-band GPS + UWB", "LTE + Wi-Fi 6 + Bluetooth 5.3"] };
    const oses = { budget: ["Proprietary RTOS", "Zepp OS", "Realme OS"], mid: ["Wear OS 3", "HarmonyOS 3", "Zepp OS 2.0"], premium: ["Wear OS 4 (One UI Watch 5)", "watchOS 10", "HarmonyOS 4"], flagship: ["Wear OS 4 (One UI Watch 6)", "watchOS 11", "HarmonyOS 4 (Ultra)"] };
    const straps = { budget: ["Silicone", "TPU", "Rubber"], mid: ["Silicone + Leather option", "Fluoroelastomer", "Nylon Weave"], premium: ["Fluoroelastomer + Stainless Steel option", "Leather + Silicone", "Titanium + Alpine Loop"], flagship: ["Titanium + Trail Loop", "Sapphire + Ocean Band", "Ceramic + Milanese Loop"] };

    return [
      `Display: ${pick(displays[tier], pid, 60)}`,
      `Sensors: ${pick(sensors[tier], pid, 61)}`,
      `Battery Life: ${pick(batteryLives[tier], pid, 62)}`,
      `Water Resistance: ${pick(waterResistances[tier], pid, 63)}`,
      `Connectivity: ${pick(connectivities[tier], pid, 64)}`,
      `OS: ${pick(oses[tier], pid, 65)}`,
      `Strap Material: ${pick(straps[tier], pid, 66)}`,
    ];
  },

  Speakers: (tier, pid) => {
    const driverSizes = { budget: ["40mm", "45mm", "36mm"], mid: ["50mm", "52mm", "2x 45mm"], premium: ["55mm + Passive Radiator", "2x 52mm", "61mm Woofer + 20mm Tweeter"], flagship: ["2x 55mm + Dual Passive Radiator", "3-Way: 25mm Tweeter + 80mm Woofer + 120mm Sub", "4x 50mm Array"] };
    const outputPowers = { budget: ["5W", "10W", "3W"], mid: ["20W", "30W", "24W"], premium: ["40W", "50W", "2x 30W Stereo"], flagship: ["80W", "100W", "2x 50W Stereo"] };
    const connectivities = { budget: ["Bluetooth 5.0", "Bluetooth 5.1 + AUX", "Bluetooth 5.0 + Micro-USB"], mid: ["Bluetooth 5.2 + AUX + USB-C", "Bluetooth 5.2 + Wi-Fi", "Bluetooth 5.1 + NFC"], premium: ["Bluetooth 5.3 + Wi-Fi + AirPlay 2", "Bluetooth 5.3 + AUX + USB-C", "Bluetooth 5.2 + Wi-Fi + Chromecast"], flagship: ["Bluetooth 5.3 + Wi-Fi 6 + AirPlay 2 + Chromecast", "Bluetooth 5.4 + Wi-Fi 6E + Spotify Connect", "Bluetooth 5.3 + Wi-Fi + HDMI eARC"] };
    const batteryLives = { budget: ["6 hours", "8 hours", "5 hours"], mid: ["12 hours", "15 hours", "10 hours"], premium: ["20 hours", "24 hours", "18 hours"], flagship: ["30 hours", "24 hours", "N/A (AC Powered)"] };
    const waterResistances = { budget: ["IPX4", "IPX5", "None"], mid: ["IPX5", "IPX7", "IP67"], premium: ["IP67", "IPX7", "IP68"], flagship: ["IP67", "IP68", "N/A (Indoor)"] };
    const frequencyRanges = { budget: ["200 Hz – 16 kHz", "150 Hz – 18 kHz", "180 Hz – 16 kHz"], mid: ["80 Hz – 20 kHz", "60 Hz – 20 kHz", "100 Hz – 20 kHz"], premium: ["50 Hz – 20 kHz", "45 Hz – 40 kHz (Hi-Res)", "55 Hz – 20 kHz"], flagship: ["35 Hz – 40 kHz (Hi-Res)", "30 Hz – 40 kHz", "40 Hz – 20 kHz"] };
    const weights = { budget: ["180g", "340g", "210g"], mid: ["540g", "680g", "450g"], premium: ["960g", "1.2 kg", "780g"], flagship: ["2.4 kg", "3.6 kg", "6.5 kg"] };

    return [
      `Driver Size: ${pick(driverSizes[tier], pid, 70)}`,
      `Output Power: ${pick(outputPowers[tier], pid, 71)}`,
      `Connectivity: ${pick(connectivities[tier], pid, 72)}`,
      `Battery Life: ${pick(batteryLives[tier], pid, 73)}`,
      `Water Resistance: ${pick(waterResistances[tier], pid, 74)}`,
      `Frequency Range: ${pick(frequencyRanges[tier], pid, 75)}`,
      `Weight: ${pick(weights[tier], pid, 76)}`,
    ];
  },
};

function generateSpecs(product) {
  const tier = priceTier(product.price);
  const generator = specTemplates[product.category];
  if (!generator) return [];
  return generator(tier, product.id);
}

// ---------------------------------------------------------------------------
// 3. REVIEWS — 3 per product, unique names, category-specific comments
// ---------------------------------------------------------------------------

const reviewerNames = [
  "Aarav Sharma", "Priya Patel", "Rohan Mehta", "Sneha Gupta", "Vikram Singh",
  "Ananya Reddy", "Karthik Nair", "Meera Joshi", "Arjun Verma", "Divya Iyer",
  "Rahul Kapoor", "Nisha Bhatt", "Amit Desai", "Pooja Kulkarni", "Siddharth Rao",
  "Riya Malhotra", "Varun Chopra", "Kavita Saxena", "Nikhil Tiwari", "Shreya Agarwal",
  "Manish Pandey", "Deepika Chauhan", "Rajesh Kumar", "Sunita Devi", "Harsh Vardhan",
  "Tanvi Khanna", "Gaurav Mishra", "Sakshi Dubey", "Aditya Sinha", "Megha Pillai",
  "Suresh Yadav", "Rekha Menon", "Vivek Jain", "Pallavi Hegde", "Kunal Bajaj",
  "Swati Patil", "Mohit Bansal", "Anjali Thakur", "Pranav Goyal", "Neha Dhawan",
  "Ashish Rathi", "Bhavna Soni", "Dhruv Mahajan", "Isha Rawat", "Jayesh Kothari",
  "Kritika Bhat", "Lakshmi Venkat", "Manav Sethi", "Nandini Garg", "Om Prakash",
  "Pankaj Mathur", "Ritu Srivastava", "Sameer Qureshi", "Tanya Chadha", "Uday Shankar",
  "Vandana Arora", "Wasim Akram", "Yash Tandon", "Zara Khan", "Abhinav Dutta",
  "Chitra Raghavan", "Dev Anand Roy", "Esha Fernandes", "Farhan Sheikh", "Geeta Bose",
];

const reviewComments = {
  Mobiles: [
    (t) => `The ${t} has an excellent display and the camera quality exceeded my expectations. Great value for money.`,
    (t) => `Battery life on the ${t} is impressive — easily lasts a full day with heavy usage. Very satisfied.`,
    (t) => `Smooth performance and snappy UI. The ${t} handles multitasking like a charm without any lag.`,
    (t) => `Love the camera setup on this phone. Night mode photos on the ${t} are surprisingly detailed.`,
    (t) => `The ${t} feels premium in hand. The build quality and finish are top-notch for this price range.`,
    (t) => `Fast charging works brilliantly — 0 to 50% in under 30 minutes on the ${t}. Highly recommend.`,
    (t) => `Gaming on the ${t} is a delight. No frame drops even on graphics-intensive titles.`,
    (t) => `The fingerprint sensor on the ${t} is lightning fast. Unlocks in a blink, truly convenient.`,
    (t) => `Call quality and speaker output on the ${t} are clear and loud. Perfect for everyday use.`,
    (t) => `Software updates have been regular on the ${t}. Nice to see continued support from the brand.`,
    (t) => `The ${t} offers a stunning AMOLED display — vibrant colours and deep blacks make content shine.`,
    (t) => `Lightweight and sleek, the ${t} slips right into your pocket without feeling bulky.`,
    (t) => `Video recording quality on the ${t} is excellent, especially with OIS stabilisation.`,
    (t) => `The ${t}'s dual speakers deliver stereo sound that's genuinely enjoyable for media consumption.`,
    (t) => `Happy with the ${t} overall. It handles daily apps smoothly and the camera is above average.`,
    (t) => `The ${t}'s face unlock works reliably even in low light. A great all-round smartphone.`,
    (t) => `Switched to the ${t} from an older phone and the performance leap is night and day.`,
    (t) => `The ${t} runs cool even under load. No heating issues during extended gaming sessions.`,
  ],
  Laptops: [
    (t) => `The ${t} boots up in seconds and handles my development workflow without breaking a sweat.`,
    (t) => `Fan noise on the ${t} is minimal — great for meetings and library sessions.`,
    (t) => `Display quality on the ${t} is superb. Colour accuracy is spot-on for photo editing work.`,
    (t) => `The ${t}'s keyboard is comfortable for long typing sessions. Best-in-class travel and feedback.`,
    (t) => `Battery life on the ${t} genuinely lasts 8+ hours for my office tasks. Very impressive.`,
    (t) => `Solid build quality on the ${t}. The aluminium chassis feels durable yet surprisingly lightweight.`,
    (t) => `The ${t} handles 4K video editing smoothly — a real productivity powerhouse.`,
    (t) => `Trackpad on the ${t} is spacious and responsive. Gestures work flawlessly out of the box.`,
    (t) => `I run multiple VMs on the ${t} daily and it never slows down. Excellent RAM management.`,
    (t) => `The ${t}'s port selection is generous — no need for a dongle hub, which is a huge plus.`,
    (t) => `Upgraded to the ${t} and my compile times dropped by half. Worth every rupee.`,
    (t) => `The webcam quality on the ${t} is above average, making it great for video calls.`,
    (t) => `Thermals on the ${t} are well-managed. Sustained performance without throttling.`,
    (t) => `The ${t} wakes from sleep instantly. Zero wait time, just open the lid and go.`,
    (t) => `I love the matte display on the ${t} — no reflections even in bright outdoor lighting.`,
    (t) => `The ${t}'s speakers are surprisingly good for a laptop. Clear mids and decent bass.`,
  ],
  TVs: [
    (t) => `Picture quality on the ${t} is stunning. HDR content looks incredibly lifelike and vibrant.`,
    (t) => `The ${t}'s smart platform is snappy — apps load quickly and the remote is intuitive.`,
    (t) => `Blacks on the ${t} are deep and true. Watching movies in a dark room is an amazing experience.`,
    (t) => `Sound quality on the ${t} is better than expected. We rarely need the external soundbar now.`,
    (t) => `The ${t} blends seamlessly into our living room décor with its slim bezels and clean design.`,
    (t) => `Gaming on the ${t} with my console is smooth — low input lag and great motion handling.`,
    (t) => `Viewing angles on the ${t} are wide. Everyone on the couch gets the same vivid picture.`,
    (t) => `Setup of the ${t} was a breeze. Connected to Wi-Fi and all apps were ready in minutes.`,
    (t) => `The ${t}'s voice assistant integration is handy — we search content hands-free all the time.`,
    (t) => `Sports look fantastic on the ${t} with the motion smoothing enabled. Crisp and fluid action.`,
    (t) => `The ${t} supports all major streaming services natively. No need for an external stick.`,
    (t) => `Upscaling on the ${t} is impressive — even older 1080p content looks sharp and detailed.`,
    (t) => `Dolby Atmos on the ${t} creates a genuinely immersive audio experience for movies.`,
    (t) => `The ${t}'s ambient mode turns the screen into a beautiful digital art frame when not in use.`,
    (t) => `Excellent value for a TV of this size. The ${t} punches well above its price bracket.`,
    (t) => `The ${t}'s remote control feels premium and the magic cursor is a great quality-of-life feature.`,
  ],
  Gaming: [
    (t) => `The ${t} delivers incredible performance. Load times are virtually non-existent thanks to the SSD.`,
    (t) => `Graphics on the ${t} are mind-blowing. Ray tracing makes game worlds look photorealistic.`,
    (t) => `The controller feel on the ${t} is next-level — adaptive triggers add so much immersion.`,
    (t) => `Backward compatibility on the ${t} is excellent. My entire library plays flawlessly.`,
    (t) => `Online multiplayer on the ${t} is smooth with no noticeable latency. Great netcode support.`,
    (t) => `The ${t} runs whisper-quiet even during intense gameplay sessions. Very impressive cooling.`,
    (t) => `Game Pass integration with the ${t} gives incredible value — hundreds of games on day one.`,
    (t) => `The ${t}'s haptic feedback is a game-changer. You can feel the terrain under your feet.`,
    (t) => `Quick resume on the ${t} lets me switch between games instantly. A killer feature.`,
    (t) => `Storage expansion on the ${t} is straightforward — just slot in an NVMe drive and go.`,
    (t) => `The ${t} handles 4K 60fps gaming effortlessly. Everything looks sharp and runs smooth.`,
    (t) => `VR performance on the ${t} is outstanding. No motion sickness even after extended sessions.`,
    (t) => `The ${t}'s build quality is solid. It feels like a premium piece of hardware on the shelf.`,
    (t) => `Audio output through the ${t}'s 3D audio engine creates an incredible spatial sound experience.`,
    (t) => `Setting up the ${t} was easy — plugged in, downloaded updates, and was gaming within 20 minutes.`,
    (t) => `The ${t} is perfect for couch co-op. We've had amazing family gaming nights with it.`,
  ],
  Cameras: [
    (t) => `Image sharpness on the ${t} is outstanding. Corner-to-corner clarity even at wide apertures.`,
    (t) => `The ${t}'s autofocus is blazing fast — tracks subjects with near-perfect accuracy.`,
    (t) => `Low light performance on the ${t} is remarkable. High ISO shots are clean with minimal grain.`,
    (t) => `Ergonomics of the ${t} are well thought out. Comfortable grip even during long photo walks.`,
    (t) => `Video quality on the ${t} is cinema-grade. 4K footage is detailed and colour-rich.`,
    (t) => `The ${t}'s in-body stabilisation is impressive — handheld shots look tripod-steady.`,
    (t) => `Dynamic range on the ${t} is excellent. Shadow recovery in post is clean and artefact-free.`,
    (t) => `Battery life on the ${t} easily covers a full day of shooting. No need for a spare.`,
    (t) => `The ${t} pairs well with third-party lenses. Mount adapter performance is seamless.`,
    (t) => `Menu system on the ${t} is logical and customisable. Quick to set up my preferred shooting style.`,
    (t) => `Colour science on the ${t} produces beautiful skin tones straight out of camera.`,
    (t) => `The ${t}'s electronic viewfinder is bright, lag-free, and accurate. A pleasure to shoot with.`,
    (t) => `Weather sealing on the ${t} gives me confidence shooting in rain and dust without worry.`,
    (t) => `Continuous shooting on the ${t} keeps up with fast action — sports and wildlife are a breeze.`,
    (t) => `The ${t}'s dual card slot setup is great for backup redundancy on commercial shoots.`,
    (t) => `Overall build quality of the ${t} is top-tier. Feels professional and inspires confidence.`,
  ],
  "Smart Watches": [
    (t) => `The ${t}'s health tracking is accurate and comprehensive. Love the SpO2 and stress monitoring.`,
    (t) => `Battery life on the ${t} is stellar — I charge it once a week and it still has juice left.`,
    (t) => `The ${t} looks stylish on the wrist. I get compliments on it regularly.`,
    (t) => `Notification management on the ${t} is seamless. I can reply to messages right from my wrist.`,
    (t) => `GPS tracking on the ${t} is precise. My running routes are accurately mapped every time.`,
    (t) => `Sleep tracking on the ${t} has helped me improve my sleep habits. Very insightful data.`,
    (t) => `The ${t}'s always-on display is crisp and readable even under direct sunlight.`,
    (t) => `Water resistance on the ${t} is reliable — I swim with it and it works perfectly.`,
    (t) => `Workout tracking modes on the ${t} cover everything — from yoga to HIIT to outdoor cycling.`,
    (t) => `The ${t} pairs smoothly with my phone. Syncing data takes seconds via the companion app.`,
    (t) => `Custom watch faces on the ${t} let me match it to my outfit. Great personalisation options.`,
    (t) => `Heart rate monitoring on the ${t} is continuous and matches my chest strap readings closely.`,
    (t) => `The ${t} feels light and comfortable for all-day wear. I barely notice it's on my wrist.`,
    (t) => `NFC payments via the ${t} work flawlessly. Tapping to pay is incredibly convenient.`,
    (t) => `The ${t}'s alarm and reminder features are handy. It buzzes gently to wake me without noise.`,
    (t) => `ECG feature on the ${t} provides peace of mind. Quick and easy heart rhythm checks anytime.`,
  ],
  Speakers: [
    (t) => `Bass on the ${t} is punchy and well-defined. It fills a room without any distortion.`,
    (t) => `The ${t} is incredibly portable — lightweight and compact, perfect for outdoor trips.`,
    (t) => `Sound clarity on the ${t} is remarkable. Vocals and instruments are well-separated and crisp.`,
    (t) => `Battery life on the ${t} is outstanding. Played music all weekend without needing a charge.`,
    (t) => `The ${t}'s water resistance has been tested — survived a pool splash without any issues.`,
    (t) => `Pairing two ${t} units for stereo sound creates an immersive listening experience.`,
    (t) => `Bluetooth range on the ${t} is solid. Stays connected even two rooms away without dropouts.`,
    (t) => `The ${t}'s build quality is rugged and durable. Dropped it a few times, still works perfectly.`,
    (t) => `360-degree sound on the ${t} means everyone around it hears equally good audio.`,
    (t) => `Volume output on the ${t} is surprisingly loud for its size. Great for parties and gatherings.`,
    (t) => `Voice assistant integration on the ${t} works well. Just press the button and ask away.`,
    (t) => `The ${t} connects to multiple devices simultaneously. Easy switching between phone and laptop.`,
    (t) => `Sound profile on the ${t} can be customised via the app. EQ settings make a real difference.`,
    (t) => `The ${t}'s USB-C charging is convenient. No hunting for proprietary cables anymore.`,
    (t) => `Mid-range and treble on the ${t} are well-balanced. Great for acoustic and vocal-heavy tracks.`,
    (t) => `Unboxing the ${t} was delightful — premium packaging and included accessories are a nice touch.`,
  ],
};

/** Generate a deterministic date string between Jan 2024 and Jun 2025 */
function generateDate(productId, reviewIndex) {
  const baseTimestamp = new Date("2024-01-15").getTime();
  const rangeMs = new Date("2025-06-15").getTime() - baseTimestamp;
  const offset = hash(productId, 100 + reviewIndex) % rangeMs;
  const date = new Date(baseTimestamp + offset);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Clamp a value between min and max */
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function generateReviews(product) {
  const comments = reviewComments[product.category] || reviewComments.Mobiles;
  const reviews = [];

  for (let i = 0; i < 3; i++) {
    // Pick unique reviewer name per product — offset by product id to avoid collisions
    const nameIdx = (hash(product.id, 200 + i)) % reviewerNames.length;
    // Ensure no duplicate names within the same product's reviews
    let name = reviewerNames[nameIdx];
    const usedNames = reviews.map((r) => r.name);
    if (usedNames.includes(name)) {
      // Walk forward to find an unused name
      let offset = 1;
      while (usedNames.includes(reviewerNames[(nameIdx + offset) % reviewerNames.length])) {
        offset++;
      }
      name = reviewerNames[(nameIdx + offset) % reviewerNames.length];
    }

    // Rating: close to product's rating ± 0.5, clamped 1-5
    const ratingOffsets = [-0.5, 0, 0.5, -0.3, 0.3, 0.2, -0.2, 0.4, -0.4, 0.1];
    const ratingOffset = ratingOffsets[hash(product.id, 300 + i) % ratingOffsets.length];
    const rating = clamp(
      Math.round((product.rating + ratingOffset) * 10) / 10,
      1,
      5,
    );

    // Comment: pick from category pool, interpolate with product title
    const commentIdx = hash(product.id, 400 + i) % comments.length;
    let comment = comments[commentIdx](product.title);
    // If duplicate comment index within same product, walk forward
    const usedCommentIdxs = reviews.map((r) => r._commentIdx);
    let finalCommentIdx = commentIdx;
    if (usedCommentIdxs.includes(finalCommentIdx)) {
      let offset = 1;
      while (usedCommentIdxs.includes((finalCommentIdx + offset) % comments.length)) {
        offset++;
      }
      finalCommentIdx = (finalCommentIdx + offset) % comments.length;
      comment = comments[finalCommentIdx](product.title);
    }

    reviews.push({
      name,
      rating,
      comment,
      date: generateDate(product.id, i),
      _commentIdx: finalCommentIdx, // temporary, stripped before save
    });
  }

  // Strip internal tracking field
  return reviews.map(({ _commentIdx, ...rest }) => rest);
}

// ---------------------------------------------------------------------------
// MIGRATION RUNNER
// ---------------------------------------------------------------------------

async function migrateProductData() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find().sort({ id: 1 });
  console.log(`Found ${products.length} products to migrate`);

  if (products.length === 0) {
    console.log("No products found. Aborting migration.");
    await mongoose.disconnect();
    return;
  }

  const operations = products.map((product, index) => {
    const description = generateDescription(product);
    const specs = generateSpecs(product);
    const reviews = generateReviews(product);

    if ((index + 1) % 50 === 0 || index === 0 || index === products.length - 1) {
      console.log(
        `  Preparing product ${index + 1}/${products.length}: [${product.id}] ${product.title}`,
      );
    }

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            description,
            specs,
            reviews,
          },
        },
      },
    };
  });

  console.log(`Executing bulkWrite for ${operations.length} products...`);
  const result = await Product.bulkWrite(operations);

  console.log(
    `Migration complete. Products: ${products.length}, Modified: ${result.modifiedCount}, Matched: ${result.matchedCount}`,
  );

  await mongoose.disconnect();
}

migrateProductData().catch(async (error) => {
  console.error("Migration failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
