/**
 * Order-export parser.
 *
 * Store order exports are CSV or tab-separated files with different column
 * names (Amazon says "Title" and "Purchase Price Per Unit", Flipkart says
 * "Product Name" and "Price"). The parser maps the common aliases and drops
 * rows that cannot become a purchase, reporting how many were skipped instead
 * of importing half-formed records.
 */

const ORDER_ID_ALIASES = [
  "order id",
  "orderid",
  "order no",
  "order number",
  "order code",
];

const NAME_ALIASES = [
  "product name",
  "product",
  "item name",
  "item",
  "title",
  "description",
  "product title",
];

const PRICE_ALIASES = [
  "purchase price per unit",
  "unit price",
  "price per unit",
  "price",
  "item price",
  "amount",
  "total amount",
  "purchase price",
];

const TOTAL_ALIASES = ["total", "grand total", "order total", "item total"];

const QUANTITY_ALIASES = ["quantity", "qty", "units"];

const DATE_ALIASES = ["order date", "purchase date", "ordered on", "date"];

const CATEGORY_ALIASES = ["category", "product category", "department"];

const URL_ALIASES = ["product url", "url", "link", "product link"];

const normaliseHeader = (value) =>
  String(value || "")
    .replace(/^\uFEFF/, "")
    .replace(/["']/g, "")
    .replace(/[_\s]+/g, " ")
    .trim()
    .toLowerCase();

const splitLine = (line, delimiter) => {
  const cells = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (quoted) {
      if (character === '"' && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }

  cells.push(cell);
  return cells.map((value) => value.trim());
};

const detectDelimiter = (line) => {
  const counts = {
    "\t": (line.match(/\t/g) || []).length,
    ";": (line.match(/;/g) || []).length,
    ",": (line.match(/,/g) || []).length,
  };

  return Object.keys(counts).reduce(
    (best, key) => (counts[key] > counts[best] ? key : best),
    ",",
  );
};

const readCell = (row, aliases) => {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== "") return row[alias];
  }

  return "";
};

const parseMoney = (value) => {
  const cleaned = String(value || "").replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
};

const parseQuantity = (value) => {
  const number = Number.parseInt(String(value || "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(number) && number > 0 ? number : 1;
};

/** Normalises ISO, DD/MM/YYYY and free-form dates to `YYYY-MM-DD`. */
export const parseOrderDate = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

  const dayFirst = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(text);

  if (dayFirst) {
    const [, day, month, rawYear] = dayFirst;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString().slice(0, 10);
};

/**
 * @returns {{ orders: Array<object>, skipped: number, total: number }}
 */
export const parseOrderCsv = (text) => {
  const source = String(text || "").trim();

  if (!source) return { orders: [], skipped: 0, total: 0 };

  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return { orders: [], skipped: 0, total: 0 };

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitLine(lines[0], delimiter).map(normaliseHeader);

  const orders = [];
  const seen = new Set();
  let skipped = 0;

  lines.slice(1).forEach((line) => {
    const cells = splitLine(line, delimiter);

    if (cells.every((cell) => cell === "")) return;

    const row = headers.reduce((accumulator, header, index) => {
      if (header) accumulator[header] = cells[index] ?? "";
      return accumulator;
    }, {});

    const orderId = readCell(row, ORDER_ID_ALIASES).replace(/^'/, "");
    const name = readCell(row, NAME_ALIASES);
    const quantity = parseQuantity(readCell(row, QUANTITY_ALIASES));

    let unitPrice = parseMoney(readCell(row, PRICE_ALIASES));

    if (unitPrice === null) {
      const total = parseMoney(readCell(row, TOTAL_ALIASES));
      unitPrice = total === null ? null : total / quantity;
    }

    if (!orderId || name.length < 2 || unitPrice === null || unitPrice < 0) {
      skipped += 1;
      return;
    }

    if (seen.has(orderId)) {
      skipped += 1;
      return;
    }

    seen.add(orderId);

    const order = {
      orderId,
      name,
      unitPrice: Math.round(unitPrice * 100) / 100,
      quantity,
    };

    const purchaseDate = parseOrderDate(readCell(row, DATE_ALIASES));
    if (purchaseDate) order.purchaseDate = purchaseDate;

    const category = readCell(row, CATEGORY_ALIASES);
    if (category) order.category = category;

    const productUrl = readCell(row, URL_ALIASES);
    if (/^https?:\/\//i.test(productUrl)) order.productUrl = productUrl;

    orders.push(order);
  });

  return { orders, skipped, total: lines.length - 1 };
};
