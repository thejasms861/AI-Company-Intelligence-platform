export const getDepartmentsForCompany = (name: any, category: any): string[] => {
  const n = String(name || "").toLowerCase();
  const c = String(category || "").toLowerCase();
  const depts: string[] = ["CSE", "ISE"];
  
  const eceKeywords = [
    "semiconductor", "hardware", "telecom", "electronics", "qualcomm", "amd", "nvidia", 
    "dell", "preferred networks", "networking", "iot", "robotics", "embedded",
    "infosys", "capgemini", "tcs", "tata consultancy", "wipro", "cognizant", "prodapt", "quest global"
  ];
  if (
    eceKeywords.some(kw => n.includes(kw) || c.includes(kw)) ||
    c.includes("it services") ||
    c.includes("consulting")
  ) {
    depts.push("ECE");
  }
  
  const mechKeywords = [
    "toyota", "automotive", "mechanical", "manufacturing", "aerospace", "heavy industry", 
    "quest global", "pepsi", "nike", "dell"
  ];
  if (mechKeywords.some(kw => n.includes(kw) || c.includes(kw))) {
    depts.push("MECH");
  }
  
  return depts;
};
