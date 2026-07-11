const fs = require('fs');
const path = require('path');

const fullPath = path.join(process.cwd(), 'schema', 'company_full.json');
const shortPath = path.join(process.cwd(), 'schema', 'company_short.json');
const oldShortPath = path.join(process.cwd(), 'schema', 'company_short.schema.json');

try {
  const fullData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  
  // Mapping full data to short data
  // Note: Some fields like operating_countries might need manual padding if full doesn't have them yet,
  // but we can extract what's there.
  const shortData = fullData.map(c => ({
    company_id: c.company_id,
    name: c.name,
    short_name: c.short_name,
    logo_url: c.logo_url || `https://logo.clearbit.com/${c.short_name.toLowerCase().replace(/\s+/g, '')}.com`,
    category: c.category,
    operating_countries: (c.operations && c.operations.countries) ? c.operations.countries.join('; ') : "Global",
    office_locations: (c.operations && c.operations.office_locations) ? (Array.isArray(c.operations.office_locations) ? c.operations.office_locations.join('; ') : c.operations.office_locations) : "Global",
    employee_size: (c.operations && c.operations.employee_size) ? c.operations.employee_size : "~500",
    yoy_growth_rate: (c.financials && c.financials.growth_rate) ? c.financials.growth_rate : "Stable"
  }));

  fs.writeFileSync(shortPath, JSON.stringify(shortData, null, 2), 'utf8');
  if (fs.existsSync(oldShortPath)) fs.unlinkSync(oldShortPath);
  
  console.log('Successfully synchronized company_short.json from company_full.json');
  console.log('Total Sync Count:', shortData.length);
} catch (error) {
  console.error('FAILED SYNC:', error.message);
}
