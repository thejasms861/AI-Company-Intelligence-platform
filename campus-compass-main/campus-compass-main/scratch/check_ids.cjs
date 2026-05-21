const hiring = require('./schema/hiring_rounds_json.schema.json');
const full = require('./schema/company_full.schema.json');

const MANUAL_MAP = {
  'postman': 1,
  'power bi (microsoft)': 2,
  'practo': 3,
  'preferred networks': 4,
  'proactively inc.': 5,
  'prodapt': 6,
  'publicis': 7,
  'publicis sapient': 8,
  'pwc acceleration centre': 9,
  'qicap markets llp': 10,
  'qualcomm': 11,
  'quest global': 12,
  'quora poe': 13,
  'rappi': 14,
  'razorpay': 15,
  'redfin': 16,
  'redhat': 17,
  'redis labs': 18,
  'replit': 19,
  'retool': 20,
  'revolut': 21,
};

hiring.forEach((h, i) => {
  const hiringName = h.company_name.toLowerCase();
  const manualId = MANUAL_MAP[hiringName];
  const fallbackId = i + 1;
  const finalId = manualId || fallbackId;
  const companyInFull = full.find(f => String(f.company_id) === String(finalId));
  console.log(i + ': hiring="' + h.company_name + '" -> id=' + finalId + ' full_company="' + (companyInFull ? companyInFull.name : 'NOT FOUND') + '"');
});
