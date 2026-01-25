/**
 * Icon Generator Script
 * Generates PNG icons from the SVG design
 *
 * Run: npm run generate-icons
 * Requires: npm install canvas
 */

const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const outputDir = path.join(__dirname, '..', 'assets', 'icons');

// Check if canvas is available
let createCanvas;
try {
  createCanvas = require('canvas').createCanvas;
} catch (e) {
  console.log('Canvas module not installed. Creating placeholder icons...');
  createPlaceholders();
  process.exit(0);
}

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const radius = size * 0.45;

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#667eea');
  grad.addColorStop(1, '#764ba2');

  // Background circle
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Eye ellipse
  ctx.beginPath();
  ctx.ellipse(center, center, size * 0.25, size * 0.18, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = Math.max(1, size * 0.03);
  ctx.stroke();

  // Outer pupil
  ctx.beginPath();
  ctx.arc(center, center, size * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Inner pupil
  ctx.beginPath();
  ctx.arc(center, center, size * 0.045, 0, Math.PI * 2);
  ctx.fillStyle = '#667eea';
  ctx.fill();

  return canvas;
}

function createPlaceholders() {
  // Create minimal valid PNG files as placeholders
  // These are 1x1 purple pixels, just to make the extension loadable
  const placeholder = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0x60, 0x60, 0xf8, 0x0f,
    0x00, 0x00, 0x01, 0x01, 0x00, 0x05, 0xfe, 0xcd, 0xa1, 0x7a, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  sizes.forEach((size) => {
    const filePath = path.join(outputDir, `icon${size}.png`);
    fs.writeFileSync(filePath, placeholder);
    console.log(`Created placeholder: icon${size}.png`);
  });

  console.log('\nTo generate proper icons, install canvas:');
  console.log('  npm install canvas');
  console.log('  npm run generate-icons');
}

// Main
if (createCanvas) {
  sizes.forEach((size) => {
    const canvas = drawIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(outputDir, `icon${size}.png`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: icon${size}.png`);
  });
  console.log('\nIcons generated successfully!');
} else {
  createPlaceholders();
}
