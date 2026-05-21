const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Root of the project (one level up from scratch/)
const ROOT = path.join(__dirname, '..');

// Manually parse .env
const envPath = path.join(ROOT, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
const env = {};
for (const line of envLines) {
  const [key, ...val] = line.split('=');
  env[key] = val.join('=').trim();
}

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

const COMPANY_ID_MAP = {
  'Postman':                '1',
  'Power BI (Microsoft)':   '2',
  'Practo':                 '3',
  'Preferred Networks':     '4',
  'Proactively Inc.':       '5',
  'Prodapt':                '6',
  'Publicis':               '7',
  'PwC Acceleration Centre': '8',
  'QICAP Markets LLP':      '9',
  'Qualcomm':               '10',
  'Quest Global':           '11',
  'Rapido':                 '12',
  'Rappi':                  '13',
  'Razorpay':               '14',
  'Redfin':                 '15',
  'Publicis Sapient':       '16',
  'Quora Poe':              '17',
  'Red Hat':                '18',
  'Redis Labs':             '19',
  'Replit':                 '20',
  'Retool':                 '21',
  'Revolut':                '22',
};

async function fixInnovex() {
  console.log('Starting Innovex data fix...\n');
  
  // 1. Delete all existing Innovex data
  console.log('Clearing innovx_json...');
  const { error: deleteError } = await supabase
    .from('innovx_json')
    .delete()
    .neq('name', '___NON_EXISTENT___');
  
  if (deleteError) {
    console.error('Delete failed:', deleteError.message);
    return;
  }
  console.log('Cleared existing data.\n');

  // 2. Run the main ingestion logic for Innovex
  const innovexContent = fs.readFileSync(path.join(ROOT, 'schema', 'innovex_json.schema.json'), 'utf8');
  const innovexData = JSON.parse(innovexContent);

  let success = 0;
  let failed = 0;

  for (const item of innovexData) {
    const master = item.innovx_master || {};
    const companyName = master.company_name || "Unknown";
    
    const companyId = COMPANY_ID_MAP[companyName];

    if (!companyId) {
      console.warn(`  [Warning] Skipping "${companyName}" - No ID found`);
      failed++;
      continue;
    }

    const { error } = await supabase.from('innovx_json').insert({
      company_id: String(companyId),
      name: companyName,
      json_data: item
    });

    if (error) {
      console.error(`  [FAIL] "${companyName}" (id=${companyId}): ${error.message}`);
      failed++;
    } else {
      console.log(`  [OK]   "${companyName}" -> company_id ${companyId} (${item.innovx_projects?.length || 0} projects)`);
      success++;
    }
  }
  
  console.log(`\nResult: ${success} inserted, ${failed} failed/skipped`);
}

fixInnovex().catch(console.error);
