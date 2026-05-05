const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?output=csv';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
    if (data.indexOf('\n') !== -1) {
      const headerLine = data.split('\n')[0];
      const headers = headerLine.split(',');
      headers.forEach((h, i) => {
        if (h.includes('2026') || h.includes('TOTAL') || h.includes('AVANCE')) {
          console.log(`Index ${i}: ${h}`);
        }
      });
      res.destroy(); // Stop downloading after getting headers
    }
  });
}).on('error', (e) => {
  console.error(e);
});
