const fs = require('fs');
const path = require('path');

console.log('--- Casing Diagnostic ---');
console.log('Current Working Directory (CWD):', process.cwd());
console.log('__filename:', __filename);
console.log('__dirname:', __dirname);

const actualCWD = fs.realpathSync.native(process.cwd());
console.log('Native resolved CWD:', actualCWD);

if (process.cwd() !== actualCWD) {
    console.log('\n⚠️  MISMATCH DETECTED!');
    console.log('The process is running in:', process.cwd());
    console.log('But the filesystem says:  ', actualCWD);
} else {
    console.log('\n✅ CWD matches filesystem casing.');
}
