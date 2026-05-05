const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?output=csv';

async function run() {
  const res = await fetch(url);
  const text = await res.text();
  const headers = text.split('\n')[0].split(',');
  headers.forEach((h, i) => {
    if (h.includes('2026') || h.includes('TOTAL') || h.includes('AVANCE') || h.includes('PLANEADO') || h.includes('EJECUTADO') || h.includes('T1') || h.includes('Q1') || h.includes('ESTADO')) {
      console.log(`${i} -> ${h}`);
    }
  });
}
run();
