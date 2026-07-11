const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
const env = {};
for (const line of envLines) {
  const [key, ...val] = line.split('=');
  env[key] = val.join('=').trim();
}

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Starting data ingestion...");

  try {
    console.log("--- 1. Ingesting companies_json ---");
    const fullContent = fs.readFileSync(path.join(__dirname, 'schema', 'company_full.schema.json'), 'utf8');
    const shortContent = fs.readFileSync(path.join(__dirname, 'schema', 'company_short.schema.json'), 'utf8');
    
    const fullData = JSON.parse(fullContent);
    const shortData = JSON.parse(shortContent);

    let companiesSuccess = 0;
    for (const full of fullData) {
      const short = shortData.find(s => s.company_id === full.company_id);
      const { error } = await supabase.from('companies_json').insert({
        company_id: String(full.company_id),
        short_json: short || {},
        full_json: full
      });

      if (error) {
        console.error(`[Error] companies_json | ${full.name}:`, error.message);
      } else {
        companiesSuccess++;
      }
    }
    console.log(`-> Successfully ingested ${companiesSuccess}/${fullData.length} into companies_json`);


    console.log("\n--- 2. Ingesting innovx_json ---");
    const innovexContent = fs.readFileSync(path.join(__dirname, 'schema', 'innovex_json.schema.json'), 'utf8');
    const innovexData = JSON.parse(innovexContent);

    const INNOVEX_ID_MAP = {
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

    let innovxSuccess = 0;
    for (const item of innovexData) {
      const master = item.innovx_master || {};
      const companyName = master.company_name || "Unknown";
      const companyId = INNOVEX_ID_MAP[companyName] || "unknown";

      if (companyId === "unknown") {
        console.warn(`[Warning] innovx_json | Could not find company ID for: ${companyName}`);
      }

      const { error } = await supabase.from('innovx_json').insert({
        company_id: String(companyId),
        name: companyName,
        json_data: item
      });

      if (error) {
        console.error(`[Error] innovx_json | ${companyName}:`, error.message);
      } else {
        innovxSuccess++;
      }
    }
    console.log(`-> Successfully ingested ${innovxSuccess}/${innovexData.length} into innovx_json`);


    console.log("\n--- 3. Ingesting job_role_details_json ---");
    const hiringContent = fs.readFileSync(path.join(__dirname, 'schema', 'hiring_rounds_json.schema.json'), 'utf8');
    const hiringData = JSON.parse(hiringContent);

    let hiringSuccess = 0;
    for (let i = 0; i < hiringData.length; i++) {
        const item = hiringData[i];
        const name = item.company_name;
        const c = fullData.find(f => f.name.toLowerCase() === name.toLowerCase());
        const companyId = c ? c.company_id : String(i + 1);

        const { error } = await supabase.from('job_role_details_json').insert({
            company_id: String(companyId),
            company_name: name,
            job_role_json: item
        });

        if (error) {
            console.error(`[Error] job_role_details_json | ${name}:`, error.message);
        } else {
            hiringSuccess++;
        }
    }
    console.log(`-> Successfully ingested ${hiringSuccess}/${hiringData.length} into job_role_details_json`);

  } catch (err) {
    console.error("FATAL ERROR:", err);
  }

  console.log("\nIngestion process finished.");
}

run();
