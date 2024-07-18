// simple js script to change ./public/version for version checking

const args = process.argv.slice(2);

// Ensure the required arguments are provided
if (args.length < 1) {
  console.error('Usage: node script.js <version>');
  process.exit(1);
}

const [content] = args;
const fs = require('fs');
const filename = __dirname + '/src/version.js';
fs.writeFile(
  filename,
  `const d = { version: '${content}' };\nexport default d`,
  // `const d = {version: 'v20240713170544-beta'};\nexport default d`,
  err => {
    if (err) throw err;
    console.log(`File created and content written to ${filename}`);
  },
);
