const fs = require('fs');
let c = fs.readFileSync('schema/company_full.json', 'utf8');
c = c.replace(/"company_id":\s*,\s*"name":\s*"Practo/g, '"company_id": 3,\n  "name": "Practo');
fs.writeFileSync('schema/company_full.json', c);
console.log('Fixed');
