const fs = require('fs');
const path = require('path');

function escapeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/'/g, "''");
}

function generateSql() {
  let sql = `-- MASTER SEED SCRIPT FOR COMPANIES_JSON AND RLS\n\n`;

  // 1. Create companies_json because it's missing!
  sql += `CREATE TABLE IF NOT EXISTS public.companies_json (
  json_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id text NOT NULL,
  short_json jsonb NOT NULL,
  full_json jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);\n\n`;

  // 2. Disable RLS for all three tables so the frontend can read them automatically!
  sql += `ALTER TABLE public.companies_json DISABLE ROW LEVEL SECURITY;\n`;
  sql += `ALTER TABLE public.innovx_json DISABLE ROW LEVEL SECURITY;\n`;
  sql += `ALTER TABLE public.job_role_details_json DISABLE ROW LEVEL SECURITY;\n\n`;
  sql += `-- TRUNCATE BEFORE SEEDING\nTRUNCATE TABLE public.companies_json;\n`;

  // 3. SEED COMPANIES JSON
  console.log("Generating companies_json inserts...");
  const fullContent = fs.readFileSync(path.join(__dirname, 'schema', 'company_full.json'), 'utf8');
  const fullData = JSON.parse(fullContent);
  const shortContent = fs.readFileSync(path.join(__dirname, 'schema', 'company_short.schema.json'), 'utf8');
  const shortData = JSON.parse(shortContent);

  for (const full of fullData) {
    const short = shortData.find(s => String(s.company_id) === String(full.company_id)) || {};
    const shortStr = escapeString(JSON.stringify(short));
    const fullStr = escapeString(JSON.stringify(full));
    
    // Using string company_id as per our schema definition
    sql += `INSERT INTO public.companies_json (company_id, short_json, full_json) VALUES ('${full.company_id}', '${shortStr}'::jsonb, '${fullStr}'::jsonb);\n`;
  }

  // Write to file
  fs.writeFileSync(path.join(__dirname, 'seed_companies_and_rls.sql'), sql, 'utf8');
  console.log("SQL generated at seed_companies_and_rls.sql");
}

generateSql();
