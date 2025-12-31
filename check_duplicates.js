const fs = require("fs");
const data = fs.readFileSync("header.csv", "utf8");
const cols = data
  .trim()
  .split(",")
  .map((c) => c.trim());
const counts = {};
cols.forEach((c, i) => {
  if (!counts[c]) counts[c] = [];
  counts[c].push(i);
});
Object.keys(counts).forEach((c) => {
  if (counts[c].length > 1) {
    const indices = counts[c];
    const colNames = indices.map((idx) => {
      let dividend = idx + 1;
      let colName = "";
      while (dividend > 0) {
        let modulo = (dividend - 1) % 26;
        colName = String.fromCharCode(65 + modulo) + colName;
        dividend = Math.floor((dividend - 1) / 26);
      }
      return colName;
    });
    console.log(`${c}: ${indices.join(", ")} (${colNames.join(", ")})`);
  }
});
