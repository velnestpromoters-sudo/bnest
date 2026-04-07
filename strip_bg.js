const fs = require('fs');
const svgPath = 'c:\\Users\\SUDHARSAN\\Desktop\\bnest\\client\\public\\logo.svg';

try {
  let content = fs.readFileSync(svgPath, 'utf8');
  
  // Find the exact path that draws the 1056x993 background box.
  // It looks like: <path d="M 0.00 496.50 L 0.00 0.00 L 528.00 0.00 L 1056.00 0.00 L 1056.00 496.50 L 1056.00 993.00 L 5... " ... />
  // We can use a regex to match it.
  
  const bgRegex = /<path d="M 0\.00 \d+\.\d+ L 0\.00 0\.00.*?"\s*(?:fill="[^"]*")?\s*\/>/g;
  const originalLength = content.length;
  content = content.replace(bgRegex, '');
  
  // Also try wiping out standard background rectangles if present
  const rectRegex = /<rect[^>]*width="100%"[^>]*height="100%"[^>]*fill="#ffffff"[^>]*\/>/gi;
  content = content.replace(rectRegex, '');
  
  if (content.length < originalLength) {
     console.log(`Success! Stripped background from SVG (${originalLength - content.length} bytes removed).`);
  } else {
     // If regex failed, let's just find the path containing "1056.00 993.00" and nuke it
     const alternativeBgRegex = /<path d="[^"]*1056\.00 993\.00[^"]*"[^>]*\/>/g;
     content = content.replace(alternativeBgRegex, '');
     console.log('Fired alternative background stripper.');
  }

  // Also remove it from the 580x560 fallback SVGs if they exist
  content = content.replace(/<path d="M0 0h584v560H0z"[^>]*\/>/, '');
  
  fs.writeFileSync(svgPath, content);
} catch(e) {
  console.error(e);
}
