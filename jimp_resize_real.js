const Jimp = require("jimp");
const path = require("path");

async function generate() {
  try {
    const imagePath = path.join(__dirname, "public", "icon.png");
    const image = await Jimp.read(imagePath);
    
    // Generate PWA icons using the new source image
    await image.clone().resize(192, 192).writeAsync(path.join(__dirname, "public", "pwa-icon-192.png"));
    await image.clone().resize(512, 512).writeAsync(path.join(__dirname, "public", "pwa-icon-512.png"));
    
    // Also copy to src/app/icon.png
    await image.clone().writeAsync(path.join(__dirname, "src", "app", "icon.png"));
    
    console.log("Icons generated successfully from public/icon.png");
  } catch (err) {
    console.error("Error generating icons:", err);
  }
}

generate();
