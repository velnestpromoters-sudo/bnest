const fs = require('fs');
const svgPath = 'c:\\Users\\SUDHARSAN\\Desktop\\bnest\\client\\public\\logo.svg';

try {
  let content = fs.readFileSync(svgPath, 'utf8');
  
  // Crop the SVG viewBox by ~25% on all sides to act like an optical zoom
  // Original is 1056 x 993. 25% crop means x=264, y=248, w=528, h=497
  if (content.includes('1056') || content.includes('viewBox')) {
     content = content.replace(/viewBox="[\d\s]+"/, 'viewBox="200 200 656 593"');
     content = content.replace(/width="1056"/, 'width="656"');
     content = content.replace(/height="993"/, 'height="593"');
     fs.writeFileSync(svgPath, content);
     console.log('Success: SVG viewBox physically cropped to look massive in the browser tab.');
  } else {
     // If they pasted the other one 584x560
     content = content.replace(/viewBox="[\d\s]+"/, ''); // clear any bad ones
     content = content.replace(/width="584" height="560"/, 'width="584" height="560" viewBox="80 80 424 400"'); // 1.4x zoom
     fs.writeFileSync(svgPath, content);
     console.log('Success: Fallback SVG viewBox physically cropped to look massive in the browser tab.');
  }
} catch(e) {
  console.error(e);
}
