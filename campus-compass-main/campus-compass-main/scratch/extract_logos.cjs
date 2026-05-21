const fs = require('fs');
const sql = fs.readFileSync('seed_companies_and_rls.sql', 'utf8');
const lines = sql.split('\n');
lines.forEach((l) => {
  if (l.toLowerCase().includes('microsoftpowerbi') || l.toLowerCase().includes('practo') || l.toLowerCase().includes('prodapt')) {
    const match = l.match(/"logo_url":"([^"]+)"/);
    if (match) {
      console.log(match[1]);
    }
  }
});
