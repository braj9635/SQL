
export interface ColumnDefinition {
  name: string;
  type: string;
  notNull?: boolean;
  defaultValue?: any;
  primaryKey?: boolean;
  unique?: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  data: Record<string, any>[];
}

// Initial Data
const INITIAL_SCHEMA: TableSchema[] = [
  {
    name: "departments",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "name", type: "VARCHAR" },
      { name: "location", type: "VARCHAR" },
    ],
    data: [
      { id: 1, name: "Engineering", location: "Building A" },
      { id: 2, name: "HR", location: "Building B" },
      { id: 3, name: "Sales", location: "Building C" },
      { id: 4, name: "Marketing", location: "Building A" },
    ],
  },
  {
    name: "customers",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "name", type: "VARCHAR" },
      { name: "email", type: "VARCHAR" },
      { name: "department_id", type: "INTEGER" },
    ],
    data: [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", department_id: 1 },
      { id: 2, name: "Bob Smith", email: "bob@example.com", department_id: 3 },
      { id: 3, name: "Charlie Brown", email: "charlie@example.com", department_id: 2 },
      { id: 4, name: "Diana Prince", email: "diana@example.com", department_id: 1 },
      { id: 5, name: "Evan Wright", email: "evan@example.com", department_id: 4 },
    ],
  },
  {
    name: "products",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "name", type: "VARCHAR" },
      { name: "price", type: "DECIMAL" },
      { name: "stock", type: "INTEGER" },
      { name: "category", type: "VARCHAR" },
    ],
    data: [
      { id: 101, name: "Wireless Mouse", price: 29.99, stock: 150, category: "Electronics" },
      { id: 102, name: "Mechanical Keyboard", price: 89.99, stock: 75, category: "Electronics" },
      { id: 103, name: "Monitor 24inch", price: 199.99, stock: 30, category: "Electronics" },
      { id: 104, name: "Coffee Mug", price: 12.50, stock: 200, category: "Kitchen" },
      { id: 105, name: "Notebook", price: 5.99, stock: 500, category: "Stationery" },
    ],
  },
  {
    name: "orders",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "customer_id", type: "INTEGER" },
      { name: "total", type: "DECIMAL" },
      { name: "status", type: "VARCHAR" },
      { name: "created_at", type: "DATETIME" },
    ],
    data: [
      { id: 1001, customer_id: 1, total: 29.99, status: "completed", created_at: "2023-10-01" },
      { id: 1002, customer_id: 2, total: 102.49, status: "pending", created_at: "2023-10-02" },
      { id: 1003, customer_id: 1, total: 199.99, status: "completed", created_at: "2023-10-05" },
      { id: 1004, customer_id: 3, total: 12.50, status: "shipped", created_at: "2023-10-06" },
      { id: 1005, customer_id: 4, total: 95.98, status: "cancelled", created_at: "2023-10-08" },
    ],
  },
  {
    name: "sales",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "sale_date", type: "DATE" },
      { name: "region", type: "VARCHAR" },
      { name: "salesperson", type: "VARCHAR" },
      { name: "amount", type: "DECIMAL" },
    ],
    data: [
      { id: 1, sale_date: "2022-01-01", region: "North", salesperson: "Alice", amount: 100 },
      { id: 2, sale_date: "2022-01-02", region: "South", salesperson: "Bob", amount: 200 },
      { id: 3, sale_date: "2022-01-03", region: "North", salesperson: "Alice", amount: 150 },
      { id: 4, sale_date: "2022-01-04", region: "East", salesperson: "Charlie", amount: 300 },
      { id: 5, sale_date: "2022-01-05", region: "South", salesperson: "Bob", amount: 100 },
      { id: 6, sale_date: "2022-01-06", region: "North", salesperson: "Alice", amount: 50 },
    ],
  },
];

// Mutable Schema State
let currentSchema: TableSchema[] = JSON.parse(JSON.stringify(INITIAL_SCHEMA));

export function getSchema(): TableSchema[] {
  return JSON.parse(JSON.stringify(currentSchema));
}

export function getInitialSchema(): TableSchema[] {
  return JSON.parse(JSON.stringify(INITIAL_SCHEMA));
}

export function resetSchema(): void {
  currentSchema = JSON.parse(JSON.stringify(INITIAL_SCHEMA));
  SCHEMA = currentSchema;
}

export function setSchema(nextSchema: TableSchema[]): void {
  currentSchema = JSON.parse(JSON.stringify(nextSchema));
  SCHEMA = currentSchema;
}

// Keep explicit export for compatibility
export let SCHEMA = currentSchema;

export interface QueryResult {
  columns: string[];
  rows: any[];
  error?: string;
  message?: string;
  executionTime?: number;
}

// Helper to strip SQL comments
function stripComments(sql: string): string {
  // Remove single-line comments (-- ...)
  let cleanSql = sql.replace(/--.*/g, " ");
  // Remove multi-line comments (/* ... */)
  cleanSql = cleanSql.replace(/\/\*[\s\S]*?\*\//g, " ");
  return cleanSql;
}

export function executeMockQuery(query: string): QueryResult {
  const startTime = performance.now();

  const parseValue = (raw: string) => {
    const trimmed = raw.trim();
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      return trimmed.substring(1, trimmed.length - 1);
    }
    if (trimmed.toLowerCase() === 'null') {
      return null;
    }
    if (!isNaN(Number(trimmed))) {
      return Number(trimmed);
    }
    return trimmed;
  };

  const evaluateCondition = (row: Record<string, any>, condition: string): boolean => {
    if (!condition) return true;

    // Handle BETWEEN (val BETWEEN start AND end)
    const betweenMatch = condition.match(/(.+?)\s+between\s+(.+?)\s+and\s+(.+)/i);
    if (betweenMatch) {
      const val = evaluateExpression(row, betweenMatch[1].trim());
      const start = evaluateExpression(row, betweenMatch[2].trim());
      const end = evaluateExpression(row, betweenMatch[3].trim());
      return val >= start && val <= end;
    }

    const operatorMatch = condition.match(/(.+?)(=|!=|>|<|>=|<=|like)(.+)/i);
    if (!operatorMatch) {
      // If no operator, check if it's a boolean column or expression
      const val = evaluateExpression(row, condition);
      return !!val;
    }

    const colExpr = operatorMatch[1].trim();
    const op = operatorMatch[2].toLowerCase();
    const valExpr = operatorMatch[3].trim();

    const rowVal = evaluateExpression(row, colExpr);
    const compareValue = evaluateExpression(row, valExpr);

    if (op === 'like') {
      const pattern = String(compareValue ?? '');
      const sRowVal = String(rowVal ?? '');
      if (pattern.startsWith('%') && pattern.endsWith('%')) {
        return sRowVal.includes(pattern.slice(1, -1));
      }
      if (pattern.startsWith('%')) {
        return sRowVal.endsWith(pattern.slice(1));
      }
      if (pattern.endsWith('%')) {
        return sRowVal.startsWith(pattern.slice(0, -1));
      }
      return sRowVal === pattern;
    }

    switch (op) {
      case "=": return rowVal == compareValue;
      case "!=": return rowVal != compareValue;
      case ">": return compareValue !== null && rowVal > compareValue;
      case "<": return compareValue !== null && rowVal < compareValue;
      case ">=": return compareValue !== null && rowVal >= compareValue;
      case "<=": return compareValue !== null && rowVal <= compareValue;
      default: return false;
    }
  };

  const evaluateExpression = (row: Record<string, any>, expr: string): any => {
    const trimmed = expr.trim();
    if (!trimmed) return null;
    const lower = trimmed.toLowerCase();

    // Parentheses stripping (basic)
    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      return evaluateExpression(row, trimmed.substring(1, trimmed.length - 1));
    }

    // Arithmetic (very basic: -1)
    if (trimmed.includes(" - ")) {
      const parts = trimmed.split(" - ");
      return evaluateExpression(row, parts[0]) - evaluateExpression(row, parts[1]);
    }

    // CASE WHEN ... THEN ... [ELSE ...] END
    if (lower.startsWith("case")) {
      const whens: { condition: string, result: string }[] = [];
      // Better regex for nested cases/expressions
      const whenRegex = /when\s+([\s\S]+?)\s+then\s+([\s\S]+?)(?=\s+when|\s+else|\s+end)/gi;
      let match;
      while ((match = whenRegex.exec(trimmed)) !== null) {
        whens.push({ condition: match[1].trim(), result: match[2].trim() });
      }

      for (const when of whens) {
        if (evaluateCondition(row, when.condition)) {
          return evaluateExpression(row, when.result);
        }
      }

      const elseMatch = trimmed.match(/else\s+([\s\S]+?)\s+end/i);
      if (elseMatch) {
        return evaluateExpression(row, elseMatch[1].trim());
      }
      return null;
    }

    // EXTRACT(part FROM col)
    const extractMatch = trimmed.match(/extract\s*\(\s*(\w+)\s+from\s+([\s\S]+?)\s*\)/i);
    if (extractMatch) {
      const part = extractMatch[1].toUpperCase();
      const sourceExpr = extractMatch[2].trim();
      const val = evaluateExpression(row, sourceExpr);
      if (!val) return null;
      const date = new Date(val);
      if (isNaN(date.getTime())) return null;
      switch (part) {
        case "YEAR": return date.getFullYear();
        case "MONTH": return date.getMonth() + 1;
        case "DAY": return date.getDate();
        default: return null;
      }
    }

    // Raw column (checking case-insensitively)
    const colName = Object.keys(row).find(k => k.toLowerCase() === lower);
    if (colName) return row[colName];

    // Literal
    return parseValue(trimmed);
  };

  const applyWhereClause = (rows: Record<string, any>[], wherePart: string) => {
    if (!wherePart) return rows;
    return rows.filter(row => evaluateCondition(row, wherePart));
  };

  const splitOutside = (str: string) => {
    const result: string[] = [];
    let current = "";
    let inParens = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
      if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
      if (char === "(" && !inSingleQuote && !inDoubleQuote) inParens++;
      if (char === ")" && !inSingleQuote && !inDoubleQuote) inParens--;

      if (char === "," && inParens === 0 && !inSingleQuote && !inDoubleQuote) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    if (current.trim()) result.push(current.trim());
    return result;
  };

  try {
    const cleanQuery = stripComments(query);
    const normalizedQuery = cleanQuery.trim();
    const lowerQuery = normalizedQuery.toLowerCase();

    if (!normalizedQuery) {
      return { columns: [], rows: [], error: "Query is empty" };
    }

    // --- DDL: CREATE TABLE ---
    if (lowerQuery.startsWith("create table")) {
      const parts = normalizedQuery.match(/create\s+table\s+([a-zA-Z0-9_]+)\s*\(([\s\S]+)\)/i);

      if (!parts) {
        throw new Error("Syntax error in CREATE TABLE. Expected: CREATE TABLE name (col type, ...)");
      }

      const tableName = parts[1];
      const columnsDef = parts[2];

      if (currentSchema.find(t => t.name.toLowerCase() === tableName.toLowerCase())) {
        throw new Error(`Table '${tableName}' already exists`);
      }

      // Parse columns
      const columns: ColumnDefinition[] = splitOutside(columnsDef).map(c => {
        const cParts = c.trim().match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+(?:\(\d+\))?)(.*)$/i);
        if (!cParts) throw new Error(`Invalid column definition: ${c}`);

        const name = cParts[1];
        const type = cParts[2].toUpperCase();
        const constraints = cParts[3].trim().toUpperCase();

        const definition: ColumnDefinition = { name, type };

        if (constraints.includes("PRIMARY KEY")) {
          definition.primaryKey = true;
          definition.notNull = true;
          definition.unique = true;
        }
        if (constraints.includes("NOT NULL")) {
          definition.notNull = true;
        }
        if (constraints.includes("UNIQUE")) {
          definition.unique = true;
        }
        const defaultMatch = constraints.match(/DEFAULT\s+([\w'.]+)/i);
        if (defaultMatch) {
          definition.defaultValue = parseValue(defaultMatch[1]);
        }

        return definition;
      });

      currentSchema.push({
        name: tableName,
        columns: columns,
        data: []
      });

      return {
        columns: [],
        rows: [],
        message: `Table '${tableName}' created successfully.`,
        executionTime: performance.now() - startTime
      };
    }


    // --- DDL: DROP TABLE ---
    if (lowerQuery.startsWith("drop table")) {
      const parts = normalizedQuery.match(/drop\s+table\s+([a-zA-Z0-9_]+)/i);
      if (!parts) {
        throw new Error("Syntax error in DROP TABLE. Expected: DROP TABLE name");
      }

      const tableName = parts[1];
      const index = currentSchema.findIndex(t => t.name.toLowerCase() === tableName.toLowerCase());

      if (index === -1) {
        throw new Error(`Table '${tableName}' not found`);
      }

      currentSchema.splice(index, 1);

      return {
        columns: [],
        rows: [],
        message: `Table '${tableName}' dropped successfully.`,
        executionTime: performance.now() - startTime
      };
    }

    // --- DDL: ALTER TABLE ---
    if (lowerQuery.startsWith("alter table")) {
      const addColumnMatch = normalizedQuery.match(/alter\s+table\s+([a-zA-Z0-9_]+)\s+add\s+column\s+([a-zA-Z0-9_]+)\s+([\s\S]+)/i);
      const renameToMatch = normalizedQuery.match(/alter\s+table\s+([a-zA-Z0-9_]+)\s+rename\s+to\s+([a-zA-Z0-9_]+)/i);

      if (addColumnMatch) {
        const tableName = addColumnMatch[1];
        const columnName = addColumnMatch[2];
        const rest = addColumnMatch[3].replace(/;$/, "").trim();
        const typeMatch = rest.match(/^([a-zA-Z0-9_]+(?:\(\d+\))?)(.*)$/i);

        if (!typeMatch) throw new Error(`Invalid column definition in ALTER TABLE: ${rest}`);

        const columnType = typeMatch[1].toUpperCase();
        const constraints = typeMatch[2].trim().toUpperCase();

        const table = currentSchema.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        if (!table) throw new Error(`Table '${tableName}' not found`);

        if (table.columns.find(c => c.name.toLowerCase() === columnName.toLowerCase())) {
          throw new Error(`Column '${columnName}' already exists in table '${tableName}'`);
        }

        const definition: ColumnDefinition = { name: columnName, type: columnType };
        if (constraints.includes("PRIMARY KEY")) {
          definition.primaryKey = true;
          definition.notNull = true;
          definition.unique = true;
        }
        if (constraints.includes("NOT NULL")) {
          definition.notNull = true;
        }
        if (constraints.includes("UNIQUE")) {
          definition.unique = true;
        }
        const defaultMatch = constraints.match(/DEFAULT\s+([\w'.]+)/i);
        if (defaultMatch) {
          definition.defaultValue = parseValue(defaultMatch[1]);
        }

        table.columns.push(definition);

        // Populate default values for existing rows
        if (definition.defaultValue !== undefined) {
          table.data.forEach(row => {
            row[columnName] = definition.defaultValue;
          });
        }

        return {
          columns: [],
          rows: [],
          message: `Column '${columnName}' added to table '${tableName}' successfully.`,
          executionTime: performance.now() - startTime
        };
      }

      if (renameToMatch) {
        const oldName = renameToMatch[1];
        const newName = renameToMatch[2];

        const table = currentSchema.find(t => t.name.toLowerCase() === oldName.toLowerCase());
        if (!table) throw new Error(`Table '${oldName}' not found`);

        if (currentSchema.find(t => t.name.toLowerCase() === newName.toLowerCase())) {
          throw new Error(`Table '${newName}' already exists`);
        }

        table.name = newName;

        return {
          columns: [],
          rows: [],
          message: `Table '${oldName}' renamed to '${newName}' successfully.`,
          executionTime: performance.now() - startTime
        };
      }

      throw new Error("Syntax error in ALTER TABLE. Supported: ADD COLUMN, RENAME TO");
    }

    // --- SELECT ---
    if (lowerQuery.startsWith("select")) {
      // Find the main FROM clause (not inside parentheses, e.g., EXTRACT(... FROM ...))
      let fromIndex = -1;
      let inParens = 0;
      let inSingleQuote = false;
      let inDoubleQuote = false;

      for (let i = 0; i < normalizedQuery.length - 4; i++) {
        const char = normalizedQuery[i];
        if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
        if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if (char === "(" && !inSingleQuote && !inDoubleQuote) inParens++;
        if (char === ")" && !inSingleQuote && !inDoubleQuote) inParens--;

        if (inParens === 0 && !inSingleQuote && !inDoubleQuote) {
          if (normalizedQuery.substring(i, i + 5).toLowerCase() === "from ") {
            fromIndex = i;
            break;
          }
        }
      }

      if (fromIndex === -1) {
        throw new Error("Syntax error: Missing FROM clause");
      }

      const selectPart = normalizedQuery.substring(6, fromIndex).trim();
      let restPart = normalizedQuery.substring(fromIndex + 5).trim();

      let wherePart = "";
      let tableName = restPart;

      const whereIndex = restPart.toLowerCase().indexOf("where");
      if (whereIndex !== -1) {
        tableName = restPart.substring(0, whereIndex).trim();
        wherePart = restPart.substring(whereIndex + 5).trim();
      }

      // Find table
      tableName = tableName.split(/\s+/)[0];
      tableName = tableName.replace(/;$/, "");

      const table = currentSchema.find(t => t.name.toLowerCase() === tableName.toLowerCase());
      if (!table) {
        throw new Error(`Table '${tableName}' not found`);
      }

      let resultRows = applyWhereClause([...table.data], wherePart);

      // Columns to select
      let columns: string[] = [];
      if (selectPart === "*") {
        columns = table.columns.map(c => c.name);
      } else {
        const requestedCols = splitOutside(selectPart);

        // Handle Expressions and logic
        const windowCols: { colName: string, func: string, partitionExpr: string | null, orderExpr: string | null, desc: boolean }[] = [];
        const basicAggregates: { colName: string, func: string, arg: string }[] = [];
        const expressionCols: { colName: string, expression: string }[] = [];

        columns = requestedCols.map(col => {
          const aliasMatch = col.match(/([\s\S]+)\s+as\s+([a-zA-Z0-9_]+)$/i);
          const colContent = aliasMatch ? aliasMatch[1].trim() : col.trim();
          const colAlias = aliasMatch ? aliasMatch[2].trim() : colContent;

          // Robust window function parsing (handle nested parentheses)
          const lowerContent = colContent.toLowerCase();
          const overIndex = lowerContent.toLowerCase().lastIndexOf(" over ");
          if (overIndex !== -1) {
            const funcPart = colContent.substring(0, overIndex).trim();
            const overStart = colContent.indexOf("(", overIndex);
            if (overStart !== -1) {
              // Extract balanced content for OVER clause
              let overContent = "";
              let pCount = 0;
              for (let i = overStart + 1; i < colContent.length; i++) {
                if (colContent[i] === "(") pCount++;
                else if (colContent[i] === ")") {
                  if (pCount === 0) {
                    overContent = colContent.substring(overStart + 1, i);
                    break;
                  }
                  pCount--;
                }
              }

              const funcMatch = funcPart.match(/(\w+)\s*\(([\s\S]*)\)/i);
              if (funcMatch) {
                const func = funcMatch[1].toUpperCase();
                const arg = funcMatch[2].trim();

                let partitionExpr = null;
                let orderExpr = null;
                let desc = false;

                const lowerOver = overContent.toLowerCase();
                const pIndex = lowerOver.indexOf("partition by");
                const oIndex = lowerOver.indexOf("order by");

                if (pIndex !== -1) {
                  const startP = pIndex + 12;
                  const endP = oIndex !== -1 ? oIndex : overContent.length;
                  partitionExpr = overContent.substring(startP, endP).trim();
                }
                if (oIndex !== -1) {
                  let orderPart = overContent.substring(oIndex + 8).trim();
                  const rowsIndex = orderPart.toLowerCase().indexOf("rows between");
                  if (rowsIndex !== -1) orderPart = orderPart.substring(0, rowsIndex).trim();

                  if (orderPart.toLowerCase().endsWith(" desc")) {
                    desc = true;
                    orderExpr = orderPart.substring(0, orderPart.length - 5).trim();
                  } else if (orderPart.toLowerCase().endsWith(" asc")) {
                    orderExpr = orderPart.substring(0, orderPart.length - 4).trim();
                  } else {
                    orderExpr = orderPart;
                  }
                }

                windowCols.push({
                  colName: colAlias,
                  func: func === "ROW_NUMBER" ? "ROW_NUMBER" : `${func}(${arg})`,
                  partitionExpr,
                  orderExpr,
                  desc
                });
                return colAlias;
              }
            }
          }

          // Basic Aggregate (no OVER)
          const aggMatch = colContent.match(/^(SUM|AVG|COUNT|MIN|MAX)\s*\(\s*([^)]*)\s*\)$/i);
          if (aggMatch) {
            basicAggregates.push({
              colName: colAlias,
              func: aggMatch[1].toUpperCase(),
              arg: aggMatch[2].trim()
            });
            return colAlias;
          }

          // Complex expression
          expressionCols.push({
            colName: colAlias,
            expression: colContent
          });
          return colAlias;
        });

        // Evaluate expressions for all rows
        expressionCols.forEach(ext => {
          resultRows.forEach(row => {
            row[ext.colName] = evaluateExpression(row, ext.expression);
          });
        });

        // Apply basic aggregation if no GROUP BY (collapsing to single row)
        if (basicAggregates.length > 0) {
          const aggRow: Record<string, any> = {};
          columns.forEach(c => aggRow[c] = null);

          basicAggregates.forEach(agg => {
            const values = resultRows.map(r => evaluateExpression(r, agg.arg)).filter(v => v !== null && v !== undefined);
            const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));

            switch (agg.func) {
              case "SUM":
                aggRow[agg.colName] = numericValues.reduce((a, b) => a + b, 0);
                break;
              case "AVG":
                aggRow[agg.colName] = numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : null;
                break;
              case "COUNT":
                aggRow[agg.colName] = agg.arg === "*" ? resultRows.length : values.length;
                break;
              case "MIN":
                aggRow[agg.colName] = numericValues.length > 0 ? Math.min(...numericValues) : (values.length > 0 ? values.sort()[0] : null);
                break;
              case "MAX":
                aggRow[agg.colName] = numericValues.length > 0 ? Math.max(...numericValues) : (values.length > 0 ? values.sort().reverse()[0] : null);
                break;
            }
          });

          if (resultRows.length > 0) {
            columns.forEach(c => {
              if (aggRow[c] === null && resultRows[0][c] !== undefined) {
                aggRow[c] = resultRows[0][c];
              }
            });
          }
          resultRows = [aggRow];
        }

        // Calculate Window Functions (existing logic)
        windowCols.forEach(win => {
          const groups: Record<string, any[]> = {};
          resultRows.forEach(row => {
            const key = win.partitionExpr ? String(evaluateExpression(row, win.partitionExpr)) : "DEFAULT";
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
          });

          Object.values(groups).forEach(group => {
            if (win.orderExpr) {
              group.sort((a, b) => {
                const valA = evaluateExpression(a, win.orderExpr!);
                const valB = evaluateExpression(b, win.orderExpr!);
                if (valA < valB) return win.desc ? 1 : -1;
                if (valA > valB) return win.desc ? -1 : 1;
                return 0;
              });
            }

            if (win.func === "ROW_NUMBER") {
              group.forEach((row, idx) => row[win.colName] = idx + 1);
            } else if (win.func.startsWith("SUM(")) {
              const arg = win.func.match(/SUM\((.+)\)/)![1];
              if (win.orderExpr) {
                let runningTotal = 0;
                group.forEach(row => {
                  runningTotal += (Number(evaluateExpression(row, arg)) || 0);
                  row[win.colName] = runningTotal;
                });
              } else {
                const total = group.reduce((acc, r) => acc + (Number(evaluateExpression(r, arg)) || 0), 0);
                group.forEach(row => row[win.colName] = total);
              }
            } else if (win.func.startsWith("AVG(")) {
              const arg = win.func.match(/AVG\((.+)\)/)![1];
              if (win.orderExpr) {
                let runningTotal = 0;
                let count = 0;
                group.forEach(row => {
                  runningTotal += (Number(evaluateExpression(row, arg)) || 0);
                  count++;
                  row[win.colName] = runningTotal / count;
                });
              } else {
                const total = group.reduce((acc, r) => acc + (Number(evaluateExpression(r, arg)) || 0), 0);
                const avg = total / group.length;
                group.forEach(row => row[win.colName] = avg);
              }
            } else if (win.func.startsWith("COUNT(")) {
              if (win.orderExpr) {
                let count = 0;
                group.forEach(row => {
                  count++;
                  row[win.colName] = count;
                });
              } else {
                const count = group.length;
                group.forEach(row => row[win.colName] = count);
              }
            }
          });
        });

        resultRows = resultRows.map(row => {
          const newRow: any = {};
          columns.forEach(col => {
            // Find the original column name or alias expression
            const aliasMatch = requestedCols.find(rc => {
              const parts = rc.match(/(.+)as\s+([a-zA-Z0-9_]+)/i);
              return parts ? parts[2].trim().toLowerCase() === col.toLowerCase() : rc.trim().toLowerCase() === col.toLowerCase();
            });

            const colContent = aliasMatch ? (aliasMatch.match(/(.+)as\s+([a-zA-Z0-9_]+)/i)?.[1].trim() || aliasMatch.trim()) : col;

            if (row[col] !== undefined) {
              newRow[col] = row[col];
            } else if (row[colContent] !== undefined) {
              newRow[col] = row[colContent];
            } else {
              newRow[col] = null;
            }
          });
          return newRow;
        });
      }

      const endTime = performance.now();
      return {
        columns,
        rows: resultRows,
        executionTime: endTime - startTime
      };
    }

    // --- INSERT ---
    if (lowerQuery.startsWith("insert into")) {
      const parts = normalizedQuery.match(/insert\s+into\s+([a-zA-Z0-9_]+)\s*(\((.+)\))?\s*values\s*([\s\S]+)$/i);
      if (!parts) throw new Error("Syntax error. Expected: INSERT INTO table (col1, col2) VALUES (val1, val2), (val3, val4)");

      const tableName = parts[1];
      const colsPart = parts[3];
      const allValuesStr = parts[4].trim();

      const table = currentSchema.find(t => t.name.toLowerCase() === tableName.toLowerCase());
      if (!table) throw new Error(`Table '${tableName}' not found`);

      // Extract value tuples from strings like "(v1, v2), (v3, v4)"
      const extractTuples = (str: string) => {
        const tuples: string[] = [];
        let current = "";
        let depth = 0;
        let inSingleQuote = false;
        let inDoubleQuote = false;

        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
          if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;

          if (char === "(" && !inSingleQuote && !inDoubleQuote) {
            depth++;
            if (depth === 1) {
              current = "";
              continue;
            }
          }
          if (char === ")" && !inSingleQuote && !inDoubleQuote) {
            depth--;
            if (depth === 0) {
              tuples.push(current.trim());
              current = "";
              continue;
            }
          }
          current += char;
        }
        return tuples;
      };

      const columnsNames = colsPart ? splitOutside(colsPart) : table.columns.map(c => c.name);
      const tuples = extractTuples(allValuesStr);

      if (tuples.length === 0) {
        throw new Error("No values provided for insertion");
      }

      let insertedCount = 0;
      tuples.forEach((tuple) => {
        const valsStr = splitOutside(tuple);
        if (columnsNames.length !== valsStr.length) {
          throw new Error(`Column count (${columnsNames.length}) does not match value count (${valsStr.length}) in tuple: (${tuple})`);
        }

        const newRow: Record<string, any> = {};

        // Map provided values
        const providedValues: Record<string, any> = {};
        columnsNames.forEach((col: string, idx: number) => {
          const field = col.replace(/[`"]/g, "").trim();
          providedValues[field] = parseValue(valsStr[idx]);
        });

        // Resolve all columns with defaults and constraints
        table.columns.forEach(colDef => {
          let val = providedValues[colDef.name];

          // Apply Default
          if (val === undefined && colDef.defaultValue !== undefined) {
            val = colDef.defaultValue;
          }

          // Enforce NOT NULL
          if (colDef.notNull && (val === null || val === undefined)) {
            throw new Error(`NOT NULL constraint violation: Column '${colDef.name}' cannot be null`);
          }

          // Enforce UNIQUE / PRIMARY KEY
          if ((colDef.unique || colDef.primaryKey) && val !== null && val !== undefined) {
            const isDuplicate = table.data.some(r => r[colDef.name] == val);
            if (isDuplicate) {
              throw new Error(`${colDef.primaryKey ? 'PRIMARY KEY' : 'UNIQUE'} constraint violation: Duplicate value '${val}' in column '${colDef.name}'`);
            }
          }

          newRow[colDef.name] = val ?? null;
        });

        table.data.push(newRow);
        insertedCount++;
      });

      return {
        columns: [],
        rows: [],
        message: `${insertedCount} row(s) inserted into '${tableName}'.`,
        executionTime: performance.now() - startTime
      };
    }


    // --- UPDATE ---
    if (lowerQuery.startsWith("update")) {
      const parts = normalizedQuery.match(/update\s+([a-zA-Z0-9_]+)\s+set\s+([\s\S]+?)(?:\s+where\s+([\s\S]+))?$/i);
      if (!parts) throw new Error("Syntax error. Expected: UPDATE table SET col = val WHERE condition");

      const tableName = parts[1];
      const setPart = parts[2].replace(/;$/, "");
      const wherePart = parts[3]?.replace(/;$/, "") || "";

      const table = currentSchema.find(t => t.name.toLowerCase() === tableName.toLowerCase());
      if (!table) throw new Error(`Table '${tableName}' not found`);

      const updates = setPart.split(",").map(assign => {
        const [key, ...rest] = assign.split("=");
        if (!key || rest.length === 0) throw new Error(`Invalid SET clause: ${assign}`);
        return { key: key.trim(), value: parseValue(rest.join("=").trim()) };
      });

      const targetRows = applyWhereClause([...table.data], wherePart);
      let affected = 0;

      table.data = table.data.map(row => {
        if (!targetRows.includes(row)) {
          return row;
        }

        const updatedRow = { ...row };
        updates.forEach(update => {
          const colDef = table.columns.find(c => c.name.toLowerCase() === update.key.toLowerCase());
          if (!colDef) throw new Error(`Column '${update.key}' not found`);

          const val = update.value;

          // Enforce NOT NULL
          if (colDef.notNull && (val === null || val === undefined)) {
            throw new Error(`NOT NULL constraint violation: Column '${colDef.name}' cannot be null`);
          }

          // Enforce UNIQUE / PRIMARY KEY
          if ((colDef.unique || colDef.primaryKey) && val !== null && val !== undefined) {
            // Check other rows for duplicates
            const isDuplicate = table.data.some(r => r !== row && r[colDef.name] == val);
            if (isDuplicate) {
              throw new Error(`${colDef.primaryKey ? 'PRIMARY KEY' : 'UNIQUE'} constraint violation: Duplicate value '${val}' in column '${colDef.name}'`);
            }
          }

          updatedRow[colDef.name] = val;
        });

        affected += 1;
        return updatedRow;
      });

      return {
        columns: [],
        rows: [],
        message: `${affected} row(s) updated in '${tableName}'.`,
        executionTime: performance.now() - startTime
      };
    }

    // --- DELETE ---
    if (lowerQuery.startsWith("delete")) {
      const parts = normalizedQuery.match(/delete\s+from\s+([a-zA-Z0-9_]+)(?:\s+where\s+([\s\S]+))?$/i);
      if (!parts) throw new Error("Syntax error. Expected: DELETE FROM table WHERE condition");

      const tableName = parts[1];
      const wherePart = parts[2]?.replace(/;$/, "") || "";

      const table = currentSchema.find(t => t.name.toLowerCase() === tableName.toLowerCase());
      if (!table) throw new Error(`Table '${tableName}' not found`);

      const targetRows = applyWhereClause([...table.data], wherePart);
      const affected = targetRows.length;

      table.data = table.data.filter(row => !targetRows.includes(row));

      return {
        columns: [],
        rows: [],
        message: `${affected} row(s) deleted from '${tableName}'.`,
        executionTime: performance.now() - startTime
      };
    }

    throw new Error("Only SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, DROP TABLE queries are supported in this demo.");

  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      error: err.message
    };
  }
}

