import Papa from 'papaparse';

const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?output=csv';

async function run() {
  const res = await fetch(url);
  const csvText = await res.text();
  
  // parse first row manually
  const firstLine = csvText.split('\n')[0];
  const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const counts = {};
  headers.forEach(h => {
    counts[h] = (counts[h] || 0) + 1;
  });
  
  console.log("Duplicate headers:");
  for (const [h, count] of Object.entries(counts)) {
    if (count > 1) {
      console.log(`- "${h}" appears ${count} times`);
    }
  }
}
run();
