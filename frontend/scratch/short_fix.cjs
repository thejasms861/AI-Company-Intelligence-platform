const fs = require('fs');
const path = require('path');
const target = path.join(process.cwd(), 'schema', 'company_short.schema.json');
const output = path.join(process.cwd(), 'schema', 'company_short.json');

try {
  let raw = fs.readFileSync(target, 'utf8');
  
  // We'll use a better approach: find all company objects and re-array them.
  // Each object starts with { "company_id":
  // This is a bit brittle but good for this specific recovery.
  
  // Actually, I'll just fix the syntax manually in the string.
  // Replace "},\n[" with "}," and "]\n]" with "]"
  // And remove any double [[
  
  raw = raw.replace(/\}\s*\[/g, '},'); // Join the two arrays
  raw = raw.replace(/\[\s*\[/g, '[');  // Remove double starts
  raw = raw.replace(/\]\s*\]/g, ']');  // Remove double ends
  
  try {
    const data = JSON.parse(raw);
    fs.writeFileSync(output, JSON.stringify(data, null, 2), 'utf8');
    if (fs.existsSync(target)) fs.unlinkSync(target);
    console.log('Fixed and moved to .json');
    console.log('Count:', data.length);
  } catch (parseError) {
    console.log('Semi-manual fix failed, trying object harvest...');
    // Fallback: harvest anything that looks like an object
    const matches = raw.match(/\{[\s\S]+?\}(?=\s*(,|$|\]|\{))/g);
    if (matches) {
       const cleanData = matches.map(m => {
          try { return JSON.parse(m); } catch(e) { return null; }
       }).filter(x => x !== null);
       fs.writeFileSync(output, JSON.stringify(cleanData, null, 2), 'utf8');
       if (fs.existsSync(target)) fs.unlinkSync(target);
       console.log('Object harvest successful');
       console.log('Count:', cleanData.length);
    } else {
       throw new Error('Could not find any objects');
    }
  }
} catch (error) {
  console.error('CRITICAL ERROR:', error.message);
}
