const fs = require('fs');
const path = require('path');

function escapeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/'/g, "''");
}

function generateSql() {
  let sql = `-- Seed Script for innovx_json and job_role_details_json\n\n`;

  // Pre-load full data to map company_id correctly
  const fullContent = fs.readFileSync(path.join(__dirname, 'schema', 'company_full.schema.json'), 'utf8');
  const fullData = JSON.parse(fullContent);

  // 1. INNOVAX JSON
  console.log("Generating innovx_json inserts...");
  const innovexPath = path.join(__dirname, 'schema', 'innovex_json.schema.json');
  if (fs.existsSync(innovexPath)) {
    const innovexData = JSON.parse(fs.readFileSync(innovexPath, 'utf8'));
    for (let i = 0; i < innovexData.length; i++) {
      const item = innovexData[i];
      const master = item.innovx_master || {};
      const companyNameStr = master.company_name || "Unknown";
      
      // Retrieve correct integer company_id by matching name
      const c = fullData.find(f => f.name.toLowerCase() === companyNameStr.toLowerCase());
      const companyId = c ? c.company_id : (i + 1);
      
      const companyNameEscaped = escapeString(companyNameStr);
      const jsonStr = escapeString(JSON.stringify(item));

      sql += `INSERT INTO public.innovx_json (company_id, name, json_data) VALUES (${companyId}, '${companyNameEscaped}', '${jsonStr}'::jsonb);\n`;
    }
  }

  sql += `\n-- --------------------------------------------------------\n\n`;

  // 2. JOB ROLE DETAILS JSON
  console.log("Generating job_role_details_json inserts...");
  const hiringPath = path.join(__dirname, 'schema', 'hiring_rounds_json.schema.json');
  if (fs.existsSync(hiringPath)) {
    const hiringData = JSON.parse(fs.readFileSync(hiringPath, 'utf8'));

    for (let i = 0; i < hiringData.length; i++) {
        const item = hiringData[i];
        const name = item.company_name;
        
        const c = fullData.find(f => f.name.toLowerCase() === name.toLowerCase());
        const companyId = c ? c.company_id : (i + 1);
        
        const nameEscaped = escapeString(name);
        const jsonStr = escapeString(JSON.stringify(item));

        sql += `INSERT INTO public.job_role_details_json (company_id, company_name, job_role_json) VALUES (${companyId}, '${nameEscaped}', '${jsonStr}'::jsonb);\n`;
    }
  }

  // Write to file
  fs.writeFileSync(path.join(__dirname, 'seed_data.sql'), sql, 'utf8');
  console.log("SQL generated at seed_data.sql");
}

generateSql();
