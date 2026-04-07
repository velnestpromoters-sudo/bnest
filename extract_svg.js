const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\SUDHARSAN\\.gemini\\antigravity\\brain\\503ca30b-5e6c-4324-971d-1daf12687169\\.system_generated\\logs\\overview.txt';
const targetPath = 'C:\\Users\\SUDHARSAN\\Desktop\\bnest\\client\\app\\icon.svg';

try {
  const log = fs.readFileSync(logPath, 'utf8');
  const match = log.match(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[\s\S]*?<\/svg>/);
  
  if (match) {
    fs.writeFileSync(targetPath, match[0]);
    console.log('SUCCESS: SVG successfully extracted and written to client/app/icon.svg');
  } else {
    console.log('ERROR: No SVG pattern found in transcript.');
  }
} catch (e) {
  console.error('ERROR reading transcript:', e);
}
