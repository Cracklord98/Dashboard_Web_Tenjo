/**
 * Script de prueba para verificar columnas de Google Sheets
 * Especialmente verificar si BPIN (columna R) está disponible
 */

import Papa from "papaparse";
import fetch from "node-fetch";

// URL del CSV público - PDM (Plan de Desarrollo Municipal)
const CSV_URL =
  process.env.GOOGLE_SHEET_CSV_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMfCRuywb0fDRC6h5z8iEoAIJJfRGzFa92MXMzrJDYrrBHV6f6ehTrIqFKrqnNiWJE78ywRwKZ_z0D/pub?gid=815695373&single=true&output=csv";

async function testBPINColumn() {
  try {
    console.log("🔍 Verificando columnas de Google Sheets...\n");
    console.log("📍 URL:", CSV_URL);
    console.log("");

    // Fetch data
    const response = await fetch(CSV_URL);
    const csvText = await response.text();

    // Parse CSV
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (parsed.errors.length > 0) {
      console.error("❌ Errores al parsear CSV:", parsed.errors);
      return;
    }

    const rows = parsed.data;
    console.log(`✅ Total filas: ${rows.length}`);
    console.log("");

    if (rows.length === 0) {
      console.log("⚠️ No se encontraron filas en el CSV");
      return;
    }

    // Obtener todas las columnas
    const columnas = Object.keys(rows[0]);
    console.log(`📊 Total columnas: ${columnas.length}`);
    console.log("");

    // Buscar columnas relacionadas con BPIN y COD META
    console.log("🔎 Buscando columnas de BPIN y Código Meta:\n");

    const bpinColumns = columnas.filter(
      (col) =>
        col.toLowerCase().includes("bpin") || col.toUpperCase().includes("BPIN")
    );

    const codMetaColumns = columnas.filter(
      (col) =>
        col.toLowerCase().includes("cod") && col.toLowerCase().includes("meta")
    );

    if (bpinColumns.length > 0) {
      console.log("✅ Columnas de BPIN encontradas:");
      bpinColumns.forEach((col, idx) => {
        console.log(`   ${idx + 1}. "${col}"`);
      });
    } else {
      console.log("❌ NO se encontraron columnas de BPIN");
    }
    console.log("");

    if (codMetaColumns.length > 0) {
      console.log("✅ Columnas de Código Meta encontradas:");
      codMetaColumns.forEach((col, idx) => {
        console.log(`   ${idx + 1}. "${col}"`);
      });
    } else {
      console.log("❌ NO se encontraron columnas de Código Meta");
    }
    console.log("");

    // Mostrar todas las columnas (primeras 30)
    console.log("📋 Primeras 30 columnas disponibles:\n");
    columnas.slice(0, 30).forEach((col, idx) => {
      // Calcular letra de columna Excel (A, B, C... R, S...)
      const excelColumn = getExcelColumn(idx);
      console.log(`   ${excelColumn}. "${col}"`);
    });

    if (columnas.length > 30) {
      console.log(`   ... y ${columnas.length - 30} columnas más`);
    }
    console.log("");

    // Mostrar ejemplo de valores de la primera fila
    console.log("🔬 Ejemplo de valores en la primera fila:\n");

    // Mostrar BPIN si existe
    bpinColumns.forEach((col) => {
      console.log(`   ${col}: "${rows[0][col] || "(vacío)"}"`);
    });

    // Mostrar COD META si existe
    codMetaColumns.forEach((col) => {
      console.log(`   ${col}: "${rows[0][col] || "(vacío)"}"`);
    });
    console.log("");

    // Verificar columna R específicamente (índice 17, ya que A=0)
    const columnaR = columnas[17]; // R es la columna 18 (índice 17)
    console.log(`📍 Columna R (índice 17): "${columnaR}"`);
    console.log(
      `   Valor en primera fila: "${rows[0][columnaR] || "(vacío)"}"`
    );
    console.log("");

    // Estadísticas de valores no vacíos
    console.log("📈 Estadísticas de valores no vacíos:\n");
    bpinColumns.forEach((col) => {
      const valoresNoVacios = rows.filter(
        (row) => row[col] && row[col].trim() !== ""
      ).length;
      console.log(
        `   ${col}: ${valoresNoVacios} de ${rows.length} (${(
          (valoresNoVacios / rows.length) *
          100
        ).toFixed(1)}%)`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Función auxiliar para obtener letra de columna Excel
function getExcelColumn(index) {
  let column = "";
  let temp = index;

  while (temp >= 0) {
    column = String.fromCharCode((temp % 26) + 65) + column;
    temp = Math.floor(temp / 26) - 1;
  }

  return column;
}

// Ejecutar test
testBPINColumn();
