const fs = require("fs");

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField); // NO TRIM
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      // Handle CRLF or LF
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentField); // NO TRIM
      rows.push(currentRow);
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField); // NO TRIM
    rows.push(currentRow);
  }
  return rows;
}

const data = fs.readFileSync("data.csv", "utf8");
const rows = parseCSV(data);
const headers = rows[0];

console.log("Headers Check:");
headers.forEach((h, i) => {
  if (h.includes("APROPIACION") || h.includes("COMPROMISOS")) {
    console.log(`Index ${i}: "${h}"`);
  }
});
