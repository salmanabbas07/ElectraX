import fs from "fs";

const file = fs.readFileSync("./backend/scripts/seedProducts.js", "utf8");

// Sirf images array ke IDs nikalo
const regex = /"(\d+-[a-zA-Z0-9]+)"/g;

const ids = [];
let match;

while ((match = regex.exec(file)) !== null) {
  ids.push(match[1]);
}

console.log(`Found ${ids.length} image IDs\n`);

for (const id of ids) {
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=100&q=80`;

  try {
    const res = await fetch(url);

    if (res.ok) {
      console.log(`✅ ${id}`);
    } else {
      console.log(`❌ ${id} (${res.status})`);
    }
  } catch (err) {
    console.log(`❌ ${id} (Network Error)`);
  }
}