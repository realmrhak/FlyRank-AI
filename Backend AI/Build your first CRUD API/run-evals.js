// This script runs all 8 eval cases against the /tasks/enrich endpoint
// and reports how many matched the expected category.

import fs from 'fs';

const cases = JSON.parse(fs.readFileSync('./evals/cases.json', 'utf-8'));

let passed = 0;
const failures = [];

console.log(`Running ${cases.length} eval cases...\n`);

for (const testCase of cases) {
   const response = await fetch('http://localhost:3000/tasks/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: testCase.title }),
   });

   const result = await response.json();
   const actualCategory = result.category;
   const isMatch = actualCategory === testCase.expected_category;

   if (isMatch) {
      passed++;
      console.log(`✅ PASS: "${testCase.title}" → ${actualCategory}`);
   } else {
      failures.push({ ...testCase, actual: actualCategory });
      console.log(`❌ FAIL: "${testCase.title}" → expected ${testCase.expected_category}, got ${actualCategory}`);
   }
}

console.log(`\n${passed}/${cases.length} passed (${Math.round((passed / cases.length) * 100)}%)`);

if (failures.length > 0) {
   console.log('\nFailures:');
   failures.forEach((f) => {
      console.log(`  - "${f.title}" (${f.note}): expected ${f.expected_category}, got ${f.actual}`);
   });
}