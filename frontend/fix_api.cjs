const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk("./src").filter(f => f.endsWith(".js") || f.endsWith(".jsx"));

files.forEach(f => {
  let content = fs.readFileSync(f, "utf8");
  // Regex to match the old fallback block exactly, ignoring exact whitespace differences
  const regex = /const API_BASE_URL = import\.meta\.env\.VITE_API_BASE_URL \|\|[\s\S]*?\?\s*"http:\/\/localhost:5000"[\s\S]*?:\s*""\);/g;
  
  if (regex.test(content)) {
    const replacement = 'const API_BASE_URL = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) ? "http://localhost:5000" : "";';
    content = content.replace(regex, replacement);
    fs.writeFileSync(f, content);
    console.log("Updated", f);
  }
});
