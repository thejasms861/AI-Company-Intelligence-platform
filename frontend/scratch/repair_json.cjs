const fs = require('fs');
const path = require('path');
const target = path.join(process.cwd(), 'schema', 'company_full.json');

try {
  let raw = fs.readFileSync(target, 'utf8');
  
  // 1. Fix the missing ID for Practo
  raw = raw.replace(/\"company_id\":\s*,/g, '\"company_id\": 3,');
  
  // 2. Clean up Whitespace
  raw = raw.trim();
  
  // 3. Convert multiple objects to an array if they aren't already
  // We look for objects ending in } followed by {
  if (!raw.startsWith('[')) {
    // This is a bit naive but should work if the format is consistent
    // We add commas between adjacent objects
    raw = '[' + raw.replace(/\}\s*\{/g, '}, {') + ']';
  }
  
  // 4. Validate and Format
  const data = JSON.parse(raw);
  fs.writeFileSync(target, JSON.stringify(data, null, 2), 'utf8');
  
  console.log('Successfully fixed and formatted company_full.json');
  console.log('Number of companies found:', data.length);
} catch (error) {
  console.error('Error fixing file:', error.message);
  process.exit(1);
}
