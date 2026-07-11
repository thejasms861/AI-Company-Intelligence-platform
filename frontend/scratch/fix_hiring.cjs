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

// Explicit mapping: hiring schema company_name -> companies_json company_id
// Cross-referenced with seed_companies_and_rls.sql:
//  1=Postman  2=Microsoft/PowerBI  3=Practo  4=PrefNetworks  5=Proactively
//  6=Prodapt  7=PublicisGroupe  8=PwCAC  9=QICAP  10=Qualcomm
//  11=QuestGlobal  12=Rapido(no hiring data)  13=Rappi  14=Razorpay
//  15=Redfin  16=PublicisSapient  17=Poe(Quora)  18=RedHat
//  19=Redis  20=Replit  21=Retool  22=Revolut
const COMPANY_ID_MAP = {
  'Postman':               '1',
  'Power BI (Microsoft)':  '2',
  'Practo':                '3',
  'Preferred Networks':    '4',
  'Proactively Inc.':      '5',
  'Prodapt':               '6',
  'Publicis':              '7',
  'PWC Acceleration Centre': '8',
  'QICAP Markets LLP':     '9',
  'Qualcomm':              '10',
  'Quest Global':          '11',
  'Quora Poe':             '17',  // Poe by Quora = company_id 17
  'Rappi':                 '13',
  'RazorPay':              '14',
  'Redfin':                '15',
  'Publicis Sapient':      '16',
  'RedHat':                '18',
  'Redis Labs':            '19',
  'Replit':                '20',
  'Retool':                '21',
  'Revolut':               '22',
};

async function fixHiring() {
  console.log('Starting hiring data fix...\n');
  
  const hiringContent = fs.readFileSync(path.join(ROOT, 'schema', 'hiring_rounds_json.schema.json'), 'utf8');
  const hiringData = JSON.parse(hiringContent);

  // Deduplicate: if multiple entries share same company_name, keep only first
  const seen = new Set();
  const deduped = hiringData.filter(item => {
    if (seen.has(item.company_name)) {
      console.log(`  Skipping duplicate: "${item.company_name}"`);
      return false;
    }
    seen.add(item.company_name);
    return true;
  });
  
  // Delete all existing hiring data by selecting IDs first
  console.log('Clearing job_role_details_json...');
  const { data: existingRows, error: selectError } = await supabase
    .from('job_role_details_json')
    .select('id');

  if (selectError) {
    console.error('Select failed:', selectError.message);
    // Continue anyway — maybe table is already empty
  } else if (existingRows && existingRows.length > 0) {
    const ids = existingRows.map(r => r.id);
    const { error: deleteError } = await supabase
      .from('job_role_details_json')
      .delete()
      .in('id', ids);
    if (deleteError) {
      console.error('Delete failed:', deleteError.message);
      return;
    }
  }
  console.log('Cleared. Re-inserting with correct company_ids...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const item of deduped) {
    const name = item.company_name;
    const companyId = COMPANY_ID_MAP[name];
    
    if (!companyId) {
      console.warn(`  WARNING: No mapping for "${name}" — skipping`);
      failed++;
      continue;
    }
    
    const { error } = await supabase.from('job_role_details_json').insert({
      company_id: companyId,
      company_name: name,
      job_role_json: item,
    });
    
    if (error) {
      console.error(`  [FAIL] "${name}" (id=${companyId}): ${error.message}`);
      failed++;
    } else {
      console.log(`  [OK]   "${name}" -> company_id ${companyId} (${item.job_role_details?.length || 0} roles)`);
      success++;
    }
  }
  
  console.log(`\nResult: ${success} inserted, ${failed} failed/skipped`);
}

fixHiring().catch(console.error);
