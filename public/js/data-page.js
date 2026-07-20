const SHEET_ID = "15y62nIUtoIgRMVhC-uXiKWkmIJcOWasSXUXQLegdPeA";
const SHEET_NAME = "stratabase data";

// Column config: type drives which Tabulator header filter is used,
// visible drives whether it shows by default or behind "Show More Columns"
const columnConfig = [
  { field: "DOI", type: "text", visible: true },
  { field: "First Author", type: "text", visible: true },
  { field: "Last Author", type: "text", visible: false },
  { field: "Publication Year", type: "number", visible: true },
  { field: "Journal", type: "text", visible: true },
  { field: "Precursor 1", type: "select", visible: true },
  { field: "P1 Bubbler Temp", type: "number", visible: false },
  { field: "P1 Dose Time (ms)", type: "number", visible: false },
  { field: "P1 Purge Time (s)", type: "number", visible: false },
  { field: "SMILES for Precursor 1", type: "text", visible: false },
  { field: "P1 # Functional Groups", type: "number", visible: false },
  { field: "Precursor 1 Class", type: "select", visible: true },
  { field: "P1 Ligand/Functional Group Type", type: "select", visible: false },
  { field: "Precursor 2", type: "select", visible: true },
  { field: "P2 Bubbler Temp", type: "number", visible: false },
  { field: "P2 Dose Time (ms)", type: "number", visible: false },
  { field: "P2 Purge Time (s)", type: "number", visible: false },
  { field: "SMILES for Precursor 2", type: "text", visible: false },
  { field: "P2 # Functional Groups", type: "number", visible: false },
  { field: "Precursor 2 Class", type: "select", visible: true },
  { field: "P2 Ligand/Functional Group Type", type: "select", visible: false },
  { field: "Precursor 3", type: "select", visible: true },
  { field: "P3 Bubbler Temp", type: "number", visible: false },
  { field: "P3 Dose Time (ms)", type: "number", visible: false },
  { field: "P3 Purge Time (s)", type: "number", visible: false },
  { field: "SMILES for Precursor 3", type: "text", visible: false },
  { field: "P3 # Functional Groups", type: "number", visible: false },
  { field: "Precursor 3 Class", type: "select", visible: true },
  { field: "P3 Ligand/Functional Group Type", type: "select", visible: false },
  { field: "Film Material", type: "select", visible: true },
  { field: "Substrate", type: "select", visible: true },
  { field: "Growth Temperature", type: "number", visible: true },
  { field: "Growth Per Cycle", type: "number", visible: true },
  { field: "Growth Per Cycle Unit", type: "select", visible: true },
  { field: "Inert Gas Flow (sccm)", type: "number", visible: false },
  { field: "Refractive Index", type: "number", visible: false },
  { field: "Elastic Modulus", type: "number", visible: false },
  { field: "Elastic Modulus Unit", type: "select", visible: false },
  { field: "Hardness", type: "number", visible: false },
  { field: "Hardness Unit", type: "select", visible: false },
  { field: "Density (g/cm³)", type: "number", visible: false },
  { field: "Stability in Air (% thickness reduction/day)", type: "number", visible: false },
  { field: "Other Comments", type: "text", visible: false },
  { field: "ORCID iD", type: "text", visible: false },
  { field: "Contributor Name", type: "text", visible: false },
];

let table;
let currentMode = "hybrid";
let showAllColumns = false;

async function fetchSheetData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
  const res = await fetch(url);
  const text = await res.text();
  // Response is wrapped like: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const jsonString = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const json = JSON.parse(jsonString);

  const headers = json.table.cols.map(c => c.label);
  return json.table.rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      const cell = row.c[i];
      obj[header] = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : cell.v) : "";
    });
    return obj;
  });
}

function buildColumnDefs(config) {
  return config.map(col => {
    const def = {
      title: col.field,
      field: col.field,
      visible: col.visible,
      headerFilterPlaceholder: "filter..."
    };

    if (col.type === "select") {
      def.headerFilter = "list";
      def.headerFilterParams = { valuesLookup: true, clearable: true };
    } else if (col.type === "number") {
      def.headerFilter = "input";
      def.hozAlign = "right";
    } else {
      def.headerFilter = "input";
    }

    return def;
  });
}

function processFilter(data) {
  const classes = [
    data["Precursor 1 Class"],
    data["Precursor 2 Class"],
    data["Precursor 3 Class"]
  ];
  const isOrganometallic = classes.some(c => c === "Organometallic");
  return currentMode === "hybrid" ? isOrganometallic : !isOrganometallic;
}

function setMode(mode) {
  currentMode = mode;
  document.getElementById("chart-hybrid").style.display = mode === "hybrid" ? "block" : "none";
  document.getElementById("chart-organic").style.display = mode === "all-organic" ? "block" : "none";
  document.getElementById("toggle-hybrid").classList.toggle("active", mode === "hybrid");
  document.getElementById("toggle-organic").classList.toggle("active", mode === "all-organic");
  if (table) table.refreshFilter();
}

async function init() {
  const data = await fetchSheetData();
  const columns = buildColumnDefs(columnConfig);

  table = new Tabulator("#data-table", {
    data: data,
    columns: columns,
    layout: "fitDataFill",
    pagination: true,
    paginationSize: 25,
    paginationSizeSelector: [10, 25, 50, 100],
    placeholder: "No matching records found"
  });

  table.on("tableBuilt", function () {
    table.addFilter(processFilter);
  });

  document.getElementById("toggle-hybrid").addEventListener("click", () => setMode("hybrid"));
  document.getElementById("toggle-organic").addEventListener("click", () => setMode("all-organic"));

  document.getElementById("toggle-columns").addEventListener("click", () => {
    showAllColumns = !showAllColumns;
    columnConfig.forEach(col => {
      if (!col.visible) {
        showAllColumns ? table.showColumn(col.field) : table.hideColumn(col.field);
      }
    });
    document.getElementById("toggle-columns").textContent =
      showAllColumns ? "Show Fewer Columns" : "Show More Columns";
  });

    document.getElementById("clear-filters").addEventListener("click", () => {
        table.clearHeaderFilter();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  init().then(() => setMode("hybrid"));
});