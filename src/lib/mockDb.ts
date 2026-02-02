
export interface TableSchema {
  name: string;
  columns: { name: string; type: string }[];
  data: Record<string, any>[];
}

export const SCHEMA: TableSchema[] = [
  {
    name: "users",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "name", type: "VARCHAR" },
      { name: "email", type: "VARCHAR" },
      { name: "role", type: "VARCHAR" },
    ],
    data: [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin" },
      { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user" },
      { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "user" },
      { id: 4, name: "Diana Prince", email: "diana@example.com", role: "moderator" },
      { id: 5, name: "Evan Wright", email: "evan@example.com", role: "user" },
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
      { name: "user_id", type: "INTEGER" },
      { name: "total", type: "DECIMAL" },
      { name: "status", type: "VARCHAR" },
      { name: "created_at", type: "DATETIME" },
    ],
    data: [
      { id: 1001, user_id: 1, total: 29.99, status: "completed", created_at: "2023-10-01" },
      { id: 1002, user_id: 2, total: 102.49, status: "pending", created_at: "2023-10-02" },
      { id: 1003, user_id: 1, total: 199.99, status: "completed", created_at: "2023-10-05" },
      { id: 1004, user_id: 3, total: 12.50, status: "shipped", created_at: "2023-10-06" },
      { id: 1005, user_id: 4, total: 95.98, status: "cancelled", created_at: "2023-10-08" },
    ],
  },
];

export interface QueryResult {
  columns: string[];
  rows: any[];
  error?: string;
  message?: string;
  executionTime?: number;
}

export function executeMockQuery(query: string): QueryResult {
  const startTime = performance.now();
  const normalizedQuery = query.trim();
  const lowerQuery = normalizedQuery.toLowerCase();

  // Very basic simulated delay
  // await new Promise(r => setTimeout(r, 100)); // synchronous for now

  try {
    if (!normalizedQuery) {
      return { columns: [], rows: [], error: "Query is empty" };
    }

    // Simple SELECT parser
    // Supported: SELECT * FROM [table]
    // Supported: SELECT [col1], [col2] FROM [table]
    // Supported: SELECT ... FROM [table] WHERE [col] = [val] (basic equality)
    
    if (lowerQuery.startsWith("select")) {
      const fromIndex = lowerQuery.indexOf("from");
      if (fromIndex === -1) {
        throw new Error("Syntax error: Missing FROM clause");
      }

      const selectPart = normalizedQuery.substring(6, fromIndex).trim();
      let restPart = normalizedQuery.substring(fromIndex + 4).trim();
      
      let wherePart = "";
      let tableName = restPart;

      const whereIndex = restPart.toLowerCase().indexOf("where");
      if (whereIndex !== -1) {
        tableName = restPart.substring(0, whereIndex).trim();
        wherePart = restPart.substring(whereIndex + 5).trim();
      }

      // Find table
      // Remove potential trailing semicolon
      tableName = tableName.replace(/;$/, "");
      
      const table = SCHEMA.find(t => t.name.toLowerCase() === tableName.toLowerCase());
      if (!table) {
        throw new Error(`Table '${tableName}' not found`);
      }

      let resultData = [...table.data];

      // Filter (WHERE)
      if (wherePart) {
        // Very basic WHERE parser: col = val
        const operatorMatch = wherePart.match(/(.+?)(=|!=|>|<|>=|<=)(.+)/);
        if (operatorMatch) {
          const col = operatorMatch[1].trim();
          const op = operatorMatch[2].trim();
          let valStr = operatorMatch[3].trim();
          
          // Handle quotes
          let val: any = valStr;
          if ((valStr.startsWith("'") && valStr.endsWith("'")) || (valStr.startsWith('"') && valStr.endsWith('"'))) {
            val = valStr.substring(1, valStr.length - 1);
          } else if (!isNaN(Number(valStr))) {
            val = Number(valStr);
          }

          resultData = resultData.filter(row => {
            const rowVal = row[col];
            // Loose comparison for simplicity
             switch (op) {
                case "=": return rowVal == val;
                case "!=": return rowVal != val;
                case ">": return rowVal > val;
                case "<": return rowVal < val;
                case ">=": return rowVal >= val;
                case "<=": return rowVal <= val;
                default: return false;
             }
          });
        }
      }

      // Columns to select
      let columns: string[] = [];
      if (selectPart === "*") {
        columns = table.columns.map(c => c.name);
      } else {
        const requestedCols = selectPart.split(",").map(c => c.trim());
        // Verify columns exist
        const availableCols = table.columns.map(c => c.name);
        for (const col of requestedCols) {
           if (!availableCols.includes(col)) {
             throw new Error(`Column '${col}' not found in table '${tableName}'`);
           }
        }
        columns = requestedCols;
        // Filter keys in data
        resultData = resultData.map(row => {
          const newRow: any = {};
          columns.forEach(col => newRow[col] = row[col]);
          return newRow;
        });
      }

      const endTime = performance.now();
      return {
        columns,
        rows: resultData,
        executionTime: endTime - startTime
      };
    } 
    
    // UPDATE / DELETE / INSERT (Mock)
    // We won't actually modify the mock data persistently to keep it simple, 
    // or we can just say "Success" without changing it, or actually change it in memory?
    // Let's just return a success message for now.
    
    const endTime = performance.now();
    
    if (lowerQuery.startsWith("insert") || lowerQuery.startsWith("update") || lowerQuery.startsWith("delete")) {
       return {
         columns: [],
         rows: [],
         message: `Query executed successfully. (Note: Data modification is simulated and not persistent in this demo).`,
         executionTime: endTime - startTime
       };
    }

    throw new Error("Only SELECT, INSERT, UPDATE, DELETE queries are supported in this demo.");

  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      error: err.message
    };
  }
}
