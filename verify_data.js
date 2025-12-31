const fs = require("fs");
const https = require("https");

const url =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?output=csv";

function parseCSVLine(text) {
  const result = [];
  let start = 0;
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') {
      inQuotes = !inQuotes;
    } else if (text[i] === "," && !inQuotes) {
      let field = text.substring(start, i);
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.substring(1, field.length - 1).replace(/""/g, '"');
      }
      result.push(field.trim());
      start = i + 1;
    }
  }
  let field = text.substring(start);
  if (field.startsWith('"') && field.endsWith('"')) {
    field = field.substring(1, field.length - 1).replace(/""/g, '"');
  }
  result.push(field.trim());
  return result;
}

function parseNumber(val) {
  if (!val) return 0;
  const cleaned = val.replace(/[$,%\s]/g, "").replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to fetch CSV: ${res.statusCode}`);
    if (res.headers.location) {
      https.get(res.headers.location, (res2) => {
        processResponse(res2);
      });
    }
    return;
  }
  processResponse(res);
});

function processResponse(res) {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const lines = data.split("\n");
    const headers = parseCSVLine(lines[0]);

    const ejeIndex = headers.indexOf("EJE");

    const getIndices = (name) =>
      headers.map((h, i) => (h === name ? i : -1)).filter((i) => i !== -1);

    const indices = {
      apropiacionInicial: getIndices("APROPIACION INICIAL 2025"),
      apropiacionDefinitiva: getIndices("APROPIACION DEFINITIVA 2025"),
      compromisos: getIndices("COMPROMISOS 2025"),
      pagos: getIndices("PAGOS 2025"),
      ejecucion: getIndices("% EJECUCION 2025"),
    };

    // Use the LAST occurrence
    const targetIndices = {
      apropiacionInicial:
        indices.apropiacionInicial[indices.apropiacionInicial.length - 1],
      apropiacionDefinitiva:
        indices.apropiacionDefinitiva[indices.apropiacionDefinitiva.length - 1],
      compromisos: indices.compromisos[indices.compromisos.length - 1],
      pagos: indices.pagos[indices.pagos.length - 1],
      ejecucion: indices.ejecucion[indices.ejecucion.length - 1],
    };

    const aggregation = {};

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const row = parseCSVLine(lines[i]);
      const eje = row[ejeIndex];

      if (!eje || !eje.startsWith("Eje")) continue;

      // Normalize Eje name (remove extra spaces, etc)
      const ejeKey = eje.split(".")[0].trim(); // "Eje 1", "Eje 2"

      if (!aggregation[ejeKey]) {
        aggregation[ejeKey] = {
          apropiacionInicial: 0,
          apropiacionDefinitiva: 0,
          compromisos: 0,
          pagos: 0,
        };
      }

      aggregation[ejeKey].apropiacionInicial += parseNumber(
        row[targetIndices.apropiacionInicial]
      );
      aggregation[ejeKey].apropiacionDefinitiva += parseNumber(
        row[targetIndices.apropiacionDefinitiva]
      );
      aggregation[ejeKey].compromisos += parseNumber(
        row[targetIndices.compromisos]
      );
      aggregation[ejeKey].pagos += parseNumber(row[targetIndices.pagos]);
    }

    console.log("\nAggregation Results:");
    Object.keys(aggregation)
      .sort()
      .forEach((eje) => {
        const data = aggregation[eje];
        const ejecucion = data.apropiacionDefinitiva
          ? (data.compromisos / data.apropiacionDefinitiva) * 100
          : 0;
        console.log(`${eje}`);
        console.log(`  Inicial: ${data.apropiacionInicial.toLocaleString()}`);
        console.log(
          `  Definitiva: ${data.apropiacionDefinitiva.toLocaleString()}`
        );
        console.log(`  Compromisos: ${data.compromisos.toLocaleString()}`);
        console.log(`  Pagos: ${data.pagos.toLocaleString()}`);
        console.log(`  % Ejecucion: ${ejecucion.toFixed(2)}%`);
      });
  });
}
