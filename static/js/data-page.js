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
  { field: "Precursor 1 Class", type: "select", visible: false },
  { field: "P1 Ligand/Functional Group Type", type: "select", visible: false },
  { field: "P1 Metal Symbol", type: "text", visible: false },
  { field: "Precursor 2", type: "select", visible: true },
  { field: "P2 Bubbler Temp", type: "number", visible: false },
  { field: "P2 Dose Time (ms)", type: "number", visible: false },
  { field: "P2 Purge Time (s)", type: "number", visible: false },
  { field: "SMILES for Precursor 2", type: "text", visible: false },
  { field: "P2 # Functional Groups", type: "number", visible: false },
  { field: "Precursor 2 Class", type: "select", visible: false },
  { field: "P2 Ligand/Functional Group Type", type: "select", visible: false },
  { field: "P2 Metal Symbol", type: "text", visible: false },
  { field: "Precursor 3", type: "select", visible: true },
  { field: "P3 Bubbler Temp", type: "number", visible: false },
  { field: "P3 Dose Time (ms)", type: "number", visible: false },
  { field: "P3 Purge Time (s)", type: "number", visible: false },
  { field: "SMILES for Precursor 3", type: "text", visible: false },
  { field: "P3 # Functional Groups", type: "number", visible: false },
  { field: "Precursor 3 Class", type: "select", visible: false },
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
  clearAllSelections();
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
  alcohol: "#4477AA",
  amine: "#66CCEE",
  carboxylic: "#228833",
  thiol: "#CCBB44",
  anhydride: "#EE6677",
  ringopening: "#AA3377",
  other: "#BBBBBB"
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

// ===== ALL-ORGANIC CHART: CATEGORY DEFINITIONS =====
const ORGANIC_NUCLEOPHILES = [
  { key: "amine", label: "Amine" },
  { key: "alcohol", label: "Alcohol" }
];

const ORGANIC_ELECTROPHILES = [
  { key: "acylchloride", label: "Acyl Chloride", color: "#c85f95" },
  { key: "anhydride", label: "Anhydride", color: "#e8a0a0" },
  { key: "isocyanate", label: "Isocyanate", color: "#e8c96a" },
  { key: "isothiocyanate", label: "Isothiocyanate", color: "#7fc97f" },
  { key: "aldehyde", label: "Aldehyde", color: "#7fb8e0" }
];

// nucleophile|electrophile -> product name. Omit a pair entirely if it has no product.
const ORGANIC_PRODUCT_MAP = {
  "amine|acylchloride": "Polyamides",
  "amine|anhydride": "Polyimides",
  "amine|isocyanate": "Polyureas",
  "amine|isothiocyanate": "Polythioureas",
  "amine|aldehyde": "Polyimines",
  "alcohol|acylchloride": "Polyesters",
  "alcohol|anhydride": "Polyesters",
  "alcohol|isocyanate": "Polyurethanes",
  "alcohol|isothiocyanate": "Polythiourethanes"
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

// ===== SHARED SELECTION STATE (periodic table + organic chart) =====
let selectedElementSymbol = null;
let selectedOrganicPair = null;

function updateSelectionBanner(text) {
  const banner = document.getElementById("element-filter-banner");
  const bannerSymbol = document.getElementById("element-filter-banner-symbol");
  if (text) {
    bannerSymbol.textContent = text;
    banner.style.display = "flex";
  } else {
    banner.style.display = "none";
  }
}

function updateElementSelection(sym) {
  selectedElementSymbol = (selectedElementSymbol === sym) ? null : sym;
  selectedOrganicPair = null;

  document.querySelectorAll(".pt-cell.pt-has-data").forEach(cell => {
    cell.classList.toggle("pt-selected", cell.dataset.symbol === selectedElementSymbol);
  });
  document.querySelectorAll(".organic-cell.selected").forEach(c => c.classList.remove("selected"));

  updateSelectionBanner(selectedElementSymbol);
  if (table) table.refreshFilter();
}

function updateOrganicSelection(pairKey, label) {
  selectedOrganicPair = (selectedOrganicPair === pairKey) ? null : pairKey;
  selectedElementSymbol = null;

  document.querySelectorAll(".pt-cell.pt-selected").forEach(c => c.classList.remove("pt-selected"));
  document.querySelectorAll(".organic-cell").forEach(cell => {
    cell.classList.toggle("selected", cell.dataset.pairKey === selectedOrganicPair);
  });

  updateSelectionBanner(selectedOrganicPair ? label : null);
  if (table) table.refreshFilter();
}

function clearAllSelections() {
  selectedElementSymbol = null;
  selectedOrganicPair = null;
  document.querySelectorAll(".pt-cell.pt-selected").forEach(c => c.classList.remove("pt-selected"));
  document.querySelectorAll(".organic-cell.selected").forEach(c => c.classList.remove("selected"));
  updateSelectionBanner(null);
  if (table) table.refreshFilter();
}

function elementFilter(row) {
  if (!selectedElementSymbol) return true;
  return getMetalSymbolForRow(row) === selectedElementSymbol;
}

// ===== RENDERING THE PERIODIC TABLE =====
function createElementCell(z, sym, elementGroupMap) {
  const cell = document.createElement("div");
  cell.className = "pt-cell";
  cell.dataset.symbol = sym;

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
    cell.addEventListener("click", () => updateElementSelection(sym));

    const swatchGrid = document.createElement("div");
    swatchGrid.className = "pt-swatch-grid";
    [...groups].forEach(g => {
      const swatch = document.createElement("span");
      swatch.className = "pt-swatch";
      swatch.style.backgroundColor = FUNCTIONAL_GROUP_COLORS[g];
      swatch.title = FUNCTIONAL_GROUP_LABELS[g];
      swatchGrid.appendChild(swatch);
    });
    cell.appendChild(swatchGrid);
  }

  return cell;
}

function renderDiagram() {
  const diagram = document.createElement("div");
  diagram.className = "pt-diagram";

  const visual = document.createElement("div");
  visual.className = "pt-diagram-visual";

  const exampleCell = document.createElement("div");
  exampleCell.className = "pt-cell pt-has-data pt-diagram-cell";

  const numberEl = document.createElement("div");
  numberEl.className = "pt-number";
  numberEl.textContent = "13";
  exampleCell.appendChild(numberEl);

  const symbolEl = document.createElement("div");
  symbolEl.className = "pt-symbol";
  symbolEl.textContent = "Al";
  exampleCell.appendChild(symbolEl);

  const swatchGrid = document.createElement("div");
  swatchGrid.className = "pt-swatch-grid";
  const swatch = document.createElement("span");
  swatch.className = "pt-swatch";
  swatch.style.backgroundColor = FUNCTIONAL_GROUP_COLORS.alcohol;
  swatchGrid.appendChild(swatch);
  exampleCell.appendChild(swatchGrid);

  visual.appendChild(exampleCell);

  const labels = document.createElement("div");
  labels.className = "pt-diagram-labels";
  labels.innerHTML = `
    <div class="pt-diagram-label" style="top:4px;"><span class="pt-diagram-tick"></span>Atomic number</div>
    <div class="pt-diagram-label" style="top:34px;"><span class="pt-diagram-tick"></span>Symbol</div>
    <div class="pt-diagram-label" style="top:64px;"><span class="pt-diagram-tick"></span>Functional groups reacted with this metal</div>
  `;
  visual.appendChild(labels);
  diagram.appendChild(visual);

  const legend = document.createElement("div");
  legend.className = "pt-diagram-legend";
  Object.keys(FUNCTIONAL_GROUP_COLORS).forEach(key => {
    const item = document.createElement("div");
    item.className = "pt-legend-item";
    item.innerHTML = `<span class="pt-legend-swatch" style="background:${FUNCTIONAL_GROUP_COLORS[key]}"></span> ${FUNCTIONAL_GROUP_LABELS[key]}`;
    legend.appendChild(item);
  });
  diagram.appendChild(legend);

  return diagram;
}

function renderPeriodicTable(elementGroupMap) {
  const container = document.getElementById("periodic-table-chart");
  container.innerHTML = "";

  const outer = document.createElement("div");
  outer.className = "pt-outer";

  const firstPeriodByColumn = {};
  ELEMENTS.forEach(([z, sym, period, group]) => {
    if (period === "L") return;
    if (!(group in firstPeriodByColumn) || period < firstPeriodByColumn[group]) {
      firstPeriodByColumn[group] = period;
    }
  });

  const wrapper = document.createElement("div");
  wrapper.className = "pt-wrapper";

  // Diagram now lives inside the grid itself, in the empty top-left block
  const diagram = renderDiagram();
  diagram.style.gridRow = "1 / 3";
  diagram.style.gridColumn = "3 / 13";
  wrapper.appendChild(diagram);

  ELEMENTS.forEach(([z, sym, period, group]) => {
    if (period === "L") return;
    const cell = createElementCell(z, sym, elementGroupMap);
    cell.style.gridRow = period;
    cell.style.gridColumn = group;

    if (period === firstPeriodByColumn[group]) {
      const colLabel = document.createElement("div");
      colLabel.className = "pt-column-label";
      colLabel.textContent = group;
      cell.appendChild(colLabel);
    }

    wrapper.appendChild(cell);
  });

  const placeholder = document.createElement("div");
  placeholder.className = "pt-cell pt-placeholder";
  placeholder.textContent = "57-71";
  placeholder.style.gridRow = 6;
  placeholder.style.gridColumn = 3;
  wrapper.appendChild(placeholder);

  outer.appendChild(wrapper);

  const lanthanideRow = document.createElement("div");
  lanthanideRow.className = "pt-lanthanide-row";

  const label = document.createElement("div");
  label.className = "pt-lanthanide-label";
  label.textContent = "Lanthanoids";
  lanthanideRow.appendChild(label);

  const lanthanideGrid = document.createElement("div");
  lanthanideGrid.className = "pt-lanthanide-grid";
  ELEMENTS.forEach(([z, sym, period, group]) => {
    if (period !== "L") return;
    const cell = createElementCell(z, sym, elementGroupMap);
    lanthanideGrid.appendChild(cell);
  });
  lanthanideRow.appendChild(lanthanideGrid);
  outer.appendChild(lanthanideRow);

  container.appendChild(outer);
}

// ===== ALL-ORGANIC CHART =====
function normalizeOrganicLigandType(rawLigandType) {
  if (!rawLigandType) return [];
  const tokens = String(rawLigandType).toLowerCase().split(",").map(t => t.trim());
  const buckets = [];
  tokens.forEach(token => {
    if (token.includes("hydroxyl") || token.includes("alcohol")) buckets.push("alcohol");
    else if (token.includes("amine")) buckets.push("amine");
    else if (token.includes("isothiocyanate")) buckets.push("isothiocyanate");
    else if (token.includes("isocyanate")) buckets.push("isocyanate");
    else if (token.includes("anhydride")) buckets.push("anhydride");
    else if (token.includes("acyl chloride") || token.includes("acylchloride")) buckets.push("acylchloride");
    else if (token.includes("aldehyde")) buckets.push("aldehyde");
  });
  return buckets;
}

const NUCLEOPHILE_KEYS = ORGANIC_NUCLEOPHILES.map(n => n.key);
const ELECTROPHILE_KEYS = ORGANIC_ELECTROPHILES.map(e => e.key);

function getOrganicPairsForRow(row) {
  const nucleophiles = new Set();
  const electrophiles = new Set();

  for (let slot = 1; slot <= 3; slot++) {
    const precursorName = row[`Precursor ${slot}`];
    if (!precursorName) continue;
    normalizeOrganicLigandType(row[`P${slot} Ligand/Functional Group Type`]).forEach(bucket => {
      if (NUCLEOPHILE_KEYS.includes(bucket)) nucleophiles.add(bucket);
      if (ELECTROPHILE_KEYS.includes(bucket)) electrophiles.add(bucket);
    });
  }

  const pairs = [];
  nucleophiles.forEach(nuc => {
    electrophiles.forEach(elec => pairs.push(`${nuc}|${elec}`));
  });
  return pairs;
}

function buildOrganicPairPresenceSet(data) {
  const set = new Set();
  data.forEach(row => {
    const classes = [row["Precursor 1 Class"], row["Precursor 2 Class"], row["Precursor 3 Class"]];
    const isOrganometallic = classes.some(c => c === "Organometallic");
    if (isOrganometallic) return;
    getOrganicPairsForRow(row).forEach(pairKey => set.add(pairKey));
  });
  return set;
}

function renderOrganicChart(pairPresenceSet) {
  const container = document.getElementById("chart-organic");
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "organic-grid";

  grid.appendChild(document.createElement("div")); // empty top-left corner

  ORGANIC_ELECTROPHILES.forEach(e => {
    const header = document.createElement("div");
    header.className = "organic-header electrophile-header";
    header.textContent = e.label;
    header.style.background = e.color;
    grid.appendChild(header);
  });

  ORGANIC_NUCLEOPHILES.forEach(n => {
    const rowLabel = document.createElement("div");
    rowLabel.className = "organic-header nucleophile-header";
    rowLabel.textContent = n.label;
    grid.appendChild(rowLabel);

    ORGANIC_ELECTROPHILES.forEach(e => {
      const pairKey = `${n.key}|${e.key}`;
      const product = ORGANIC_PRODUCT_MAP[pairKey];
      const cell = document.createElement("div");
      cell.className = "organic-cell";
      cell.dataset.pairKey = pairKey;

      if (!product) {
        cell.classList.add("organic-cell-empty");
        grid.appendChild(cell);
        return;
      }

      cell.textContent = product;
      cell.style.setProperty("--organic-color", e.color);

      if (pairPresenceSet.has(pairKey)) {
        cell.classList.add("organic-active");
        cell.addEventListener("click", () =>
          updateOrganicSelection(pairKey, `${n.label} + ${e.label} (${product})`)
        );
      } else {
        cell.classList.add("organic-greyed");
      }

      grid.appendChild(cell);
    });
  });

  container.appendChild(grid);
}

function organicPairFilter(row) {
  if (!selectedOrganicPair) return true;
  return getOrganicPairsForRow(row).includes(selectedOrganicPair);
}

// ===== INIT =====
async function init() {
  const data = await fetchSheetData();

  const elementGroupMap = buildElementFunctionalGroupMap(data);
  renderPeriodicTable(elementGroupMap);

  const organicPairPresenceSet = buildOrganicPairPresenceSet(data);
  renderOrganicChart(organicPairPresenceSet);

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
    table.addFilter(elementFilter);
    table.addFilter(organicPairFilter);
  });

  document.getElementById("toggle-hybrid").addEventListener("click", () => setMode("hybrid"));
  document.getElementById("toggle-organic").addEventListener("click", () => setMode("all-organic"));
  document.getElementById("clear-filters").addEventListener("click", () => {
    table.clearHeaderFilter();
    clearAllSelections();
  });
  document.getElementById("element-filter-clear").addEventListener("click", () => clearAllSelections());

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