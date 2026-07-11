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

function determineIntelligence(company) {
    const size = company.operations?.employee_size || company.employee_size || "";
    const category = (company.category || "").toLowerCase();
    const name = (company.name || "").toLowerCase();
    
    let tier = "Mid-Tier Recruiter";
    let reasoning = "Standard hiring patterns with moderate selectivity.";
    let campus_hiring_volumes = {
        tier_1: "5-10 students",
        tier_2: "10-20 students",
        tier_3: "Rarely hires"
    };
    let badges = ["Stable Backup"];
    
    if (size.includes("100,000") || size.includes("50,000") || category.includes("it services") || name.includes("tcs") || name.includes("cognizant")) {
        tier = "Mass Recruiter";
        reasoning = "Extremely high volume hiring with standardized, multi-round assessments focusing on baseline aptitude.";
        campus_hiring_volumes = {
            tier_1: "20-50 students",
            tier_2: "50-150 students",
            tier_3: "100-300 students"
        };
        badges = ["High Volume Hiring", "Standardized Assessment", "Accessible"];
    } else if (category.includes("deeptech") || category.includes("unicorn") || category.includes("startup") && !size.includes("1000")) {
        tier = "Premium Niche";
        reasoning = "Highly selective hiring focused on specialized skills, problem-solving, and cultural fit rather than volume.";
        campus_hiring_volumes = {
            tier_1: "3-8 students",
            tier_2: "1-3 students",
            tier_3: "Off-campus only"
        };
        badges = ["Highly Selective", "Specialized Skills", "High Growth"];
    } else if (category.includes("enterprise") || name.includes("microsoft") || name.includes("google") || name.includes("qualcomm") || size.includes("10,000")) {
        tier = "Elite Dream Company";
        reasoning = "Top-tier compensation and brand value. Hiring is highly competitive, emphasizing deep technical fundamentals and system design.";
        campus_hiring_volumes = {
            tier_1: "10-25 students",
            tier_2: "3-8 students",
            tier_3: "Off-campus only"
        };
        badges = ["Top Tier Pay", "Extremely Competitive", "Global Impact"];
    }
    
    return {
        company_tier: tier,
        reasoning: reasoning,
        campus_hiring_volumes: campus_hiring_volumes,
        badges: badges
    };
}

async function run() {
    console.log("Fetching companies from Supabase...");
    const { data: companies, error: fetchError } = await supabase.from('companies_json').select('company_id, full_json');
    
    if (fetchError) {
        console.error("Error fetching companies:", fetchError);
        return;
    }
    
    console.log(`Found ${companies.length} companies. Analyzing and updating...`);
    
    let updatedCount = 0;
    for (const record of companies) {
        if (!record.full_json) continue;
        
        const fullJson = record.full_json;
        const intel = determineIntelligence(fullJson);
        fullJson.intelligence_data = intel;
        
        const { error: updateError } = await supabase
            .from('companies_json')
            .update({ full_json: fullJson })
            .eq('company_id', record.company_id);
            
        if (updateError) {
            console.error(`Error updating ${fullJson.name}:`, updateError);
        } else {
            console.log(`Updated: ${fullJson.name} -> ${intel.company_tier}`);
            updatedCount++;
        }
    }
    
    console.log(`\nSuccessfully injected Intelligence Data into ${updatedCount} companies.`);
}

run();
