// Run: node scripts/generate-icons.js
// Requires: npm install sharp (already installed)
const sharp = require('sharp')
const path = require('path')

const svgPath = path.join(__dirname, '../public/icons/icon.svg')
const outDir = path.join(__dirname, '../public/icons')

async function generate() {
  const sizes = [192, 512]
  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`))
    console.log(`✅ icon-${size}.png`)
  }
  // Also generate apple-touch-icon
  await sharp(svgPath).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'))
  console.log('✅ apple-touch-icon.png')
}

generate().catch(console.error)
