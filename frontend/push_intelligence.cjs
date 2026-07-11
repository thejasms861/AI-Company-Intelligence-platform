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
    console.log("Loading updated_companies.json...");
    const data = JSON.parse(fs.readFileSync('updated_companies.json', 'utf8'));
    
    console.log(`Found ${data.length} companies. Pushing to Supabase...`);
    
    let count = 0;
    for (const record of data) {
        const fullJson = record.full_json;
        const shortJson = record.short_json;
        
        // Ensure short_json has company_tier
        if (fullJson.intelligence_data?.company_tier && shortJson) {
            shortJson.company_tier = fullJson.intelligence_data.company_tier;
        }

        const { error } = await supabase
            .from('companies_json')
            .update({ full_json: fullJson, short_json: shortJson })
            .eq('company_id', record.company_id);
            
        if (error) {
            console.error(`Error updating ${fullJson.name}:`, error);
        } else {
            console.log(`Updated in DB: ${fullJson.name}`);
            count++;
        }
    }
    
    console.log(`\nSuccessfully pushed genuine AI Intelligence for ${count} companies.`);
}

run();
