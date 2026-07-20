const SHEET_ID = "15y62nIUtoIgRMVhC-uXiKWkmIJcOWasSXUXQLegdPeA";
const SHEET_NAME = "stratabase data";

// ===== COLUMN CONFIG =====
// type drives which Tabulator header filter is used,
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
  { field: "P1 Metal Symbol", type: "text", visible: false },
  { field: "Precursor 2", type: "select", visible: true },
  { field: "P2 Bubbler Temp", type: "number", visible: false },
  { field: "P2 Dose Time (ms)", type: "number", visible: false },
  { field: "P2 Purge Time (s)", type: "number", visible: false },
  { field: "SMILES for Precursor 2", type: "text", visible: false },
  { field: "P2 # Functional Groups", type: "number", visible: false },
  { field: "Precursor 2 Class", type: "select", visible: true },
  { field: "P2 Ligand/Functional Group Type", type: "select", visible: false },
  { field: "P2 Metal Symbol", type: "text", visible: false },
  { field: "Precursor 3", type: "select", visible: true },
  { field: "P3 Bubbler Temp", type: "number", visible: false },
  { field: "P3 Dose Time (ms)", type: "number", visible: false },
  { field: "P3 Purge Time (s)", type: "number", visible: false },
  { field: "SMILES for Precursor 3", type: "text", visible: false },
  { field: "P3 # Functional Groups", type: "number", visible: false },
  { field: "Precursor 3 Class", type: "select", visible: true },
  { field: "P3 Ligand/Functional Group Type", type: "select", visible: false },
  { field: "P3 Metal Symbol", type: "text", visible: false },
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

// ===== FETCH SHEET DATA =====
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

// ===== TABULATOR COLUMN DEFS =====
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

// ===== HYBRID / ALL-ORGANIC MODE FILTER =====
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
  document.getElementById("periodic-table-chart").style.display = mode === "hybrid" ? "block" : "none";
  document.getElementById("chart-organic").style.display = mode === "all-organic" ? "block" : "none";
  document.getElementById("toggle-hybrid").classList.toggle("active", mode === "hybrid");
  document.getElementById("toggle-organic").classList.toggle("active", mode === "all-organic");
  if (table) table.refreshFilter();
}


// ===== PERIODIC TABLE: ELEMENT LAYOUT =====
const ELEMENTS = [
  [1,"H",1,1],[2,"He",1,18],
  [3,"Li",2,1],[4,"Be",2,2],[5,"B",2,13],[6,"C",2,14],[7,"N",2,15],[8,"O",2,16],[9,"F",2,17],[10,"Ne",2,18],
  [11,"Na",3,1],[12,"Mg",3,2],[13,"Al",3,13],[14,"Si",3,14],[15,"P",3,15],[16,"S",3,16],[17,"Cl",3,17],[18,"Ar",3,18],
  [19,"K",4,1],[20,"Ca",4,2],[21,"Sc",4,3],[22,"Ti",4,4],[23,"V",4,5],[24,"Cr",4,6],[25,"Mn",4,7],[26,"Fe",4,8],
  [27,"Co",4,9],[28,"Ni",4,10],[29,"Cu",4,11],[30,"Zn",4,12],[31,"Ga",4,13],[32,"Ge",4,14],[33,"As",4,15],[34,"Se",4,16],
  [35,"Br",4,17],[36,"Kr",4,18],
  [37,"Rb",5,1],[38,"Sr",5,2],[39,"Y",5,3],[40,"Zr",5,4],[41,"Nb",5,5],[42,"Mo",5,6],[43,"Tc",5,7],[44,"Ru",5,8],
  [45,"Rh",5,9],[46,"Pd",5,10],[47,"Ag",5,11],[48,"Cd",5,12],[49,"In",5,13],[50,"Sn",5,14],[51,"Sb",5,15],[52,"Te",5,16],
  [53,"I",5,17],[54,"Xe",5,18],
  [55,"Cs",6,1],[56,"Ba",6,2],[72,"Hf",6,4],[73,"Ta",6,5],[74,"W",6,6],[75,"Re",6,7],[76,"Os",6,8],[77,"Ir",6,9],
  [78,"Pt",6,10],[79,"Au",6,11],[80,"Hg",6,12],[81,"Tl",6,13],[82,"Pb",6,14],[83,"Bi",6,15],[84,"Po",6,16],[85,"At",6,17],[86,"Rn",6,18],
  [57,"La","L",1],[58,"Ce","L",2],[59,"Pr","L",3],[60,"Nd","L",4],[61,"Pm","L",5],[62,"Sm","L",6],[63,"Eu","L",7],
  [64,"Gd","L",8],[65,"Tb","L",9],[66,"Dy","L",10],[67,"Ho","L",11],[68,"Er","L",12],[69,"Tm","L",13],[70,"Yb","L",14],[71,"Lu","L",15]
];

// ===== PERIODIC TABLE: FUNCTIONAL GROUP COLORS (Okabe-Ito colorblind-safe palette) =====
const FUNCTIONAL_GROUP_COLORS = {
  alcohol: "#0072B2",
  amine: "#E69F00",
  carboxylic: "#009E73",
  thiol: "#F0E442",
  anhydride: "#CC79A7",
  ringopening: "#56B4E9",
  other: "#D55E00"
};

const FUNCTIONAL_GROUP_LABELS = {
  alcohol: "Alcohol/Hydroxyl",
  amine: "Amine",
  carboxylic: "Carboxylic Acid",
  thiol: "Thiol",
  anhydride: "Anhydride",
  ringopening: "Ring Opening",
  other: "Other"
};

// ===== BUILDING THE ELEMENT -> FUNCTIONAL GROUP MAP FROM SHEET DATA =====
function getOrganometallicSlot(row) {
  if (row["Precursor 1 Class"] === "Organometallic") return 1;
  if (row["Precursor 2 Class"] === "Organometallic") return 2;
  if (row["Precursor 3 Class"] === "Organometallic") return 3;
  return null;
}

function getMetalSymbolForRow(row) {
  const slot = getOrganometallicSlot(row);
  if (!slot) return null;
  const symbol = row[`P${slot} Metal Symbol`];
  return symbol ? symbol : null;
}

function normalizeLigandTypeToBucket(rawLigandType) {
  if (!rawLigandType) return new Set(["other"]);
  const tokens = String(rawLigandType).toLowerCase().split(",").map(t => t.trim());
  const buckets = new Set();
  tokens.forEach(token => {
    if (token.includes("hydroxyl")) buckets.add("alcohol");
    else if (token.includes("amine")) buckets.add("amine");
    else if (token.includes("carboxylic")) buckets.add("carboxylic");
    else if (token.includes("thiol")) buckets.add("thiol");
    else if (token.includes("anhydride")) buckets.add("anhydride");
    else if (token.includes("epoxide") || token.includes("ring")) buckets.add("ringopening");
    else buckets.add("other");
  });
  return buckets;
}

function getOrganicFunctionalGroupsForRow(row) {
  const metalSlot = getOrganometallicSlot(row);
  const groups = new Set();
  for (let slot = 1; slot <= 3; slot++) {
    if (slot === metalSlot) continue;
    const precursorName = row[`Precursor ${slot}`];
    if (!precursorName) continue;
    normalizeLigandTypeToBucket(row[`P${slot} Ligand/Functional Group Type`]).forEach(g => groups.add(g));
  }
  return groups;
}

function buildElementFunctionalGroupMap(data) {
  const map = {};
  data.forEach(row => {
    const symbol = getMetalSymbolForRow(row);
    if (!symbol) return;
    if (!map[symbol]) map[symbol] = new Set();
    getOrganicFunctionalGroupsForRow(row).forEach(g => map[symbol].add(g));
  });
  return map;
}

// ===== RENDERING THE PERIODIC TABLE =====
function createElementCell(z, sym, elementGroupMap) {
  const cell = document.createElement("div");
  cell.className = "pt-cell";

  const numberEl = document.createElement("div");
  numberEl.className = "pt-number";
  numberEl.textContent = z;
  cell.appendChild(numberEl);

  const symbolEl = document.createElement("div");
  symbolEl.className = "pt-symbol";
  symbolEl.textContent = sym;
  cell.appendChild(symbolEl);

  const groups = elementGroupMap[sym];
  if (groups && groups.size > 0) {
    cell.classList.add("pt-has-data");
    const tagRow = document.createElement("div");
    tagRow.className = "pt-tags";
    [...groups].forEach(g => {
      const tag = document.createElement("span");
      tag.className = "pt-tag";
      tag.style.backgroundColor = FUNCTIONAL_GROUP_COLORS[g];
      tag.title = FUNCTIONAL_GROUP_LABELS[g];
      tagRow.appendChild(tag);
    });
    cell.appendChild(tagRow);
  }
  return cell;
}

function renderPeriodicTable(elementGroupMap) {
  const container = document.getElementById("periodic-table-chart");
  container.innerHTML = "";

  const mainGrid = document.createElement("div");
  mainGrid.className = "pt-grid";

  ELEMENTS.forEach(([z, sym, period, group]) => {
    if (period === "L") return;
    const cell = createElementCell(z, sym, elementGroupMap);
    cell.style.gridRow = period;
    cell.style.gridColumn = group;
    mainGrid.appendChild(cell);
  });

  const placeholder = document.createElement("div");
  placeholder.className = "pt-cell pt-placeholder";
  placeholder.textContent = "57-71";
  placeholder.style.gridRow = 6;
  placeholder.style.gridColumn = 3;
  mainGrid.appendChild(placeholder);

  container.appendChild(mainGrid);

  const label = document.createElement("div");
  label.className = "pt-lanthanide-label";
  label.textContent = "Lanthanoids";
  container.appendChild(label);

  const lanthanideGrid = document.createElement("div");
  lanthanideGrid.className = "pt-grid pt-lanthanide-grid";
  ELEMENTS.forEach(([z, sym, period, group]) => {
    if (period !== "L") return;
    const cell = createElementCell(z, sym, elementGroupMap);
    cell.style.gridColumn = group;
    lanthanideGrid.appendChild(cell);
  });
  container.appendChild(lanthanideGrid);

  const legend = document.createElement("div");
  legend.className = "pt-legend";
  Object.keys(FUNCTIONAL_GROUP_COLORS).forEach(key => {
    const item = document.createElement("div");
    item.className = "pt-legend-item";
    item.innerHTML = `<span class="pt-legend-swatch" style="background:${FUNCTIONAL_GROUP_COLORS[key]}"></span> ${FUNCTIONAL_GROUP_LABELS[key]}`;
    legend.appendChild(item);
  });
  container.appendChild(legend);
}

// ===== INIT =====
async function init() {
  const data = await fetchSheetData();

  const elementGroupMap = buildElementFunctionalGroupMap(data);
  renderPeriodicTable(elementGroupMap);

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
  document.getElementById("clear-filters").addEventListener("click", () => table.clearHeaderFilter());

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
}

document.addEventListener("DOMContentLoaded", () => {
  init().then(() => setMode("hybrid"));
});