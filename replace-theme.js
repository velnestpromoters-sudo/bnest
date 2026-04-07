const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['client/app', 'client/components'];

const replacements = [
  { search: /#FF5A1F/gi, replace: '#801786' },
  { search: /#E04812/gi, replace: '#a61c92' },
  { search: /#FF6A3D/gi, replace: '#ec38b7' },
  { search: /orange-500/gi, replace: 'purple-500' },
  { search: /orange-200/gi, replace: 'purple-200' },
  { search: /orange-100/gi, replace: 'purple-100' },
  { search: /orange-50/gi, replace: 'purple-50' }
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      for (const rule of replacements) {
        content = content.replace(rule.search, rule.replace);
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

DIRECTORIES.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});
console.log('✅ Theme Migration Complete.');
