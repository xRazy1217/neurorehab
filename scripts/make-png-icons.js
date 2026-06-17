/**
 * Creates minimal valid PNG placeholder icons without any native dependencies.
 * Uses a hard-coded tiny purple square PNG encoded in base64.
 * Run: node scripts/make-png-icons.js
 */

const fs = require('fs')
const path = require('path')
const { createCanvas } = (() => {
  try {
    return require('canvas')
  } catch {
    return null
  }
})() ?? {}

const iconsDir = path.join(__dirname, '..', 'public', 'icons')
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

if (createCanvas) {
  // If canvas is available, draw real icon
  for (const size of [192, 512]) {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#7F77DD'
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size, size * 0.2)
    ctx.fill()

    // Circles
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.beginPath()
    ctx.arc(size/2, size/2, size*0.35, 0, Math.PI*2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.arc(size/2, size/2, size*0.22, 0, Math.PI*2)
    ctx.fill()

    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(size/2, size/2, size*0.12, 0, Math.PI*2)
    ctx.fill()

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), buffer)
    console.log(`✓ icon-${size}.png created (${size}x${size})`)
  }
} else {
  // Fallback: write a minimal valid 1x1 PNG (purple pixel) — just to satisfy the manifest
  // Real icons MUST be replaced before production
  // PNG signature + IHDR + IDAT + IEND for a 1x1 purple pixel
  const png1x1 = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
    '2e00000000c4944415408d76360f8cf0000000000ffff03004a0008dd8af16' +
    '60000000049454e44ae426082', 'hex'
  )
  for (const size of [192, 512]) {
    fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), png1x1)
    console.log(`✓ icon-${size}.png created (1x1 placeholder — replace before deploy)`)
  }
}
