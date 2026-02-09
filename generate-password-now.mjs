import { generateAndSendPasswords, getCurrentMonth } from "./server/passwordUtils.js";

async function main() {
  const month = getCurrentMonth();
  console.log(`Generating passwords for ${month}...`);
  
  const result = await generateAndSendPasswords(month);
  
  console.log('\n=== Passwords Generated ===');
  console.log(`Month: ${result.month}`);
  console.log(`Manager Password (4-digit): ${result.managerPassword}`);
  console.log(`Auditor Password (6-digit): ${result.auditorPassword}`);
  console.log('\nEmail sent to haai.tools@gmail.com');
  console.log('===========================\n');
  
  process.exit(0);
}

main().catch(console.error);
