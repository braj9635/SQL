export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Challenge {
  id: number;
  title: string;
  difficulty: Difficulty;
  sql: string;
}

export const CHALLENGES: Challenge[] = [
  // --- BASIC (1-15) ---
  {
    id: 1,
    title: "Get all departments",
    difficulty: "Easy",
    sql: "SELECT * FROM departments;"
  },
  {
    id: 2,
    title: "Get all customers",
    difficulty: "Easy",
    sql: "SELECT * FROM customers;"
  },
  {
    id: 3,
    title: "Get customer names and emails",
    difficulty: "Easy",
    sql: "SELECT name, email FROM customers;"
  },
  {
    id: 4,
    title: "Get all products with price",
    difficulty: "Easy",
    sql: "SELECT name, price FROM products;"
  },
  {
    id: 5,
    title: "Get orders with status = 'completed'",
    difficulty: "Easy",
    sql: "SELECT * FROM orders WHERE status = 'completed';"
  },
  {
    id: 6,
    title: "Get products with stock > 50",
    difficulty: "Easy",
    sql: "SELECT * FROM products WHERE stock > 50;"
  },
  {
    id: 7,
    title: "Get customers from department 2",
    difficulty: "Easy",
    sql: "SELECT * FROM customers WHERE department_id = 2;"
  },
  {
    id: 8,
    title: "Get orders created today",
    difficulty: "Easy",
    sql: "SELECT * FROM orders \nWHERE DATE(created_at) = CURRENT_DATE;"
  },
  {
    id: 9,
    title: "Get products in Electronics category",
    difficulty: "Easy",
    sql: "SELECT * FROM products WHERE category = 'Electronics';"
  },
  {
    id: 10,
    title: "Get distinct order statuses",
    difficulty: "Easy",
    sql: "SELECT DISTINCT status FROM orders;"
  },
  {
    id: 11,
    title: "Get customers ordered by name",
    difficulty: "Easy",
    sql: "SELECT * FROM customers ORDER BY name;"
  },
  {
    id: 12,
    title: "Get products ordered by price desc",
    difficulty: "Easy",
    sql: "SELECT * FROM products ORDER BY price DESC;"
  },
  {
    id: 13,
    title: "Get top 5 expensive products",
    difficulty: "Easy",
    sql: "SELECT * FROM products ORDER BY price DESC LIMIT 5;"
  },
  {
    id: 14,
    title: "Get orders with total > 1000",
    difficulty: "Easy",
    sql: "SELECT * FROM orders WHERE total > 1000;"
  },
  {
    id: 15,
    title: "Get customers whose name starts with 'A'",
    difficulty: "Easy",
    sql: "SELECT * FROM customers WHERE name LIKE 'A%';"
  },

  // --- AGGREGATION (16-30) ---
  {
    id: 16,
    title: "Count total customers",
    difficulty: "Medium",
    sql: "SELECT COUNT(*) FROM customers;"
  },
  {
    id: 17,
    title: "Count total orders",
    difficulty: "Medium",
    sql: "SELECT COUNT(*) FROM orders;"
  },
  {
    id: 18,
    title: "Get total revenue",
    difficulty: "Medium",
    sql: "SELECT SUM(total) FROM orders;"
  },
  {
    id: 19,
    title: "Get average order value",
    difficulty: "Medium",
    sql: "SELECT AVG(total) FROM orders;"
  },
  {
    id: 20,
    title: "Get max product price",
    difficulty: "Medium",
    sql: "SELECT MAX(price) FROM products;"
  },
  {
    id: 21,
    title: "Get min product price",
    difficulty: "Medium",
    sql: "SELECT MIN(price) FROM products;"
  },
  {
    id: 22,
    title: "Count customers per department",
    difficulty: "Medium",
    sql: "SELECT department_id, COUNT(*) \nFROM customers\nGROUP BY department_id;"
  },
  {
    id: 23,
    title: "Count products per category",
    difficulty: "Medium",
    sql: "SELECT category, COUNT(*) \nFROM products\nGROUP BY category;"
  },
  {
    id: 24,
    title: "Revenue per status",
    difficulty: "Medium",
    sql: "SELECT status, SUM(total)\nFROM orders\nGROUP BY status;"
  },
  {
    id: 25,
    title: "Orders per customer",
    difficulty: "Medium",
    sql: "SELECT customer_id, COUNT(*)\nFROM orders\nGROUP BY customer_id;"
  },
  {
    id: 26,
    title: "Customers with more than 3 orders",
    difficulty: "Medium",
    sql: "SELECT customer_id\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) > 3;"
  },
  {
    id: 27,
    title: "Departments with more than 5 customers",
    difficulty: "Medium",
    sql: "SELECT department_id\nFROM customers\nGROUP BY department_id\nHAVING COUNT(*) > 5;"
  },
  {
    id: 28,
    title: "Total stock per category",
    difficulty: "Medium",
    sql: "SELECT category, SUM(stock)\nFROM products\nGROUP BY category;"
  },
  {
    id: 29,
    title: "Average product price per category",
    difficulty: "Medium",
    sql: "SELECT category, AVG(price)\nFROM products\nGROUP BY category;"
  },
  {
    id: 30,
    title: "Highest order total",
    difficulty: "Medium",
    sql: "SELECT MAX(total) FROM orders;"
  },

  // --- JOINS (31-40) ---
  {
    id: 31,
    title: "Customers with department name",
    difficulty: "Medium",
    sql: "SELECT c.name, d.name\nFROM customers c\nJOIN departments d ON c.department_id = d.id;"
  },
  {
    id: 32,
    title: "Orders with customer name",
    difficulty: "Medium",
    sql: "SELECT o.id, c.name, o.total\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;"
  },
  {
    id: 33,
    title: "Orders with customer email",
    difficulty: "Medium",
    sql: "SELECT o.id, c.email\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;"
  },
  {
    id: 34,
    title: "Customers without orders",
    difficulty: "Medium",
    sql: "SELECT c.*\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE o.id IS NULL;"
  },
  {
    id: 35,
    title: "Orders without customers (data issue)",
    difficulty: "Medium",
    sql: "SELECT *\nFROM orders o\nLEFT JOIN customers c ON o.customer_id = c.id\nWHERE c.id IS NULL;"
  },
  {
    id: 36,
    title: "Customer name, department, order total",
    difficulty: "Medium",
    sql: "SELECT c.name, d.name, o.total\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN departments d ON c.department_id = d.id;"
  },
  {
    id: 37,
    title: "Total revenue per department",
    difficulty: "Medium",
    sql: "SELECT d.name, SUM(o.total)\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nJOIN departments d ON c.department_id = d.id\nGROUP BY d.name;"
  },
  {
    id: 38,
    title: "Orders count per department",
    difficulty: "Medium",
    sql: "SELECT d.name, COUNT(o.id)\nFROM departments d\nJOIN customers c ON d.id = c.department_id\nJOIN orders o ON c.id = o.customer_id\nGROUP BY d.name;"
  },
  {
    id: 39,
    title: "Customers and their total spend",
    difficulty: "Medium",
    sql: "SELECT c.name, SUM(o.total)\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.name;"
  },
  {
    id: 40,
    title: "Customers who spent more than 5000",
    difficulty: "Medium",
    sql: "SELECT c.name\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.name\nHAVING SUM(o.total) > 5000;"
  },

  // --- SUBQUERIES (41-50) ---
  {
    id: 41,
    title: "Customers who placed orders",
    difficulty: "Hard",
    sql: "SELECT * FROM customers\nWHERE id IN (SELECT customer_id FROM orders);"
  },
  {
    id: 42,
    title: "Customers who never ordered",
    difficulty: "Hard",
    sql: "SELECT * FROM customers\nWHERE id NOT IN (SELECT customer_id FROM orders);"
  },
  {
    id: 43,
    title: "Products priced above average",
    difficulty: "Hard",
    sql: "SELECT * FROM products\nWHERE price > (SELECT AVG(price) FROM products);"
  },
  {
    id: 44,
    title: "Orders above average order value",
    difficulty: "Hard",
    sql: "SELECT * FROM orders\nWHERE total > (SELECT AVG(total) FROM orders);"
  },
  {
    id: 45,
    title: "Departments with customers",
    difficulty: "Hard",
    sql: "SELECT * FROM departments\nWHERE id IN (SELECT department_id FROM customers);"
  },
  {
    id: 46,
    title: "Highest order per customer",
    difficulty: "Hard",
    sql: "SELECT customer_id, MAX(total)\nFROM orders\nGROUP BY customer_id;"
  },
  {
    id: 47,
    title: "Customers with highest single order",
    difficulty: "Hard",
    sql: "SELECT * FROM customers\nWHERE id IN (\n  SELECT customer_id FROM orders\n  WHERE total = (SELECT MAX(total) FROM orders)\n);"
  },
  {
    id: 48,
    title: "Orders from customers in Sales department",
    difficulty: "Hard",
    sql: "SELECT * FROM orders\nWHERE customer_id IN (\n  SELECT id FROM customers\n  WHERE department_id = 1\n);"
  },
  {
    id: 49,
    title: "Products with lowest stock",
    difficulty: "Hard",
    sql: "SELECT * FROM products\nWHERE stock = (SELECT MIN(stock) FROM products);"
  },
  {
    id: 50,
    title: "Department with max customers",
    difficulty: "Hard",
    sql: "SELECT department_id\nFROM customers\nGROUP BY department_id\nORDER BY COUNT(*) DESC\nLIMIT 1;"
  },

  // --- ADVANCED (61-70) ---
  {
    id: 61,
    title: "Orders in last 7 days",
    difficulty: "Hard",
    sql: "SELECT * FROM orders\nWHERE created_at >= NOW() - INTERVAL 7 DAY;"
  },
  {
    id: 62,
    title: "Orders per day",
    difficulty: "Hard",
    sql: "SELECT DATE(created_at), COUNT(*)\nFROM orders\nGROUP BY DATE(created_at);"
  },
  {
    id: 63,
    title: "Monthly revenue",
    difficulty: "Hard",
    sql: "SELECT MONTH(created_at), SUM(total)\nFROM orders\nGROUP BY MONTH(created_at);"
  },
  {
    id: 64,
    title: "Pending orders count",
    difficulty: "Hard",
    sql: "SELECT COUNT(*) FROM orders WHERE status = 'pending';"
  },
  {
    id: 65,
    title: "Cancelled orders revenue",
    difficulty: "Hard",
    sql: "SELECT SUM(total) FROM orders WHERE status = 'cancelled';"
  },
  {
    id: 66,
    title: "Orders with status label",
    difficulty: "Hard",
    sql: "SELECT id,\nCASE \n  WHEN status = 'completed' THEN 'Done'\n  ELSE 'Not Done'\nEND AS status_label\nFROM orders;"
  },
  {
    id: 67,
    title: "Products out of stock",
    difficulty: "Hard",
    sql: "SELECT * FROM products WHERE stock = 0;"
  },
  {
    id: 68,
    title: "Customers ordered by total spend",
    difficulty: "Hard",
    sql: "SELECT c.name, SUM(o.total) AS spend\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.name\nORDER BY spend DESC;"
  },
  {
    id: 69,
    title: "Top 3 customers by spend",
    difficulty: "Hard",
    sql: "SELECT c.name, SUM(o.total)\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.name\nORDER BY SUM(o.total) DESC\nLIMIT 3;"
  },
  {
    id: 70,
    title: "Customers with no department",
    difficulty: "Hard",
    sql: "SELECT * FROM customers WHERE department_id IS NULL;"
  }
];
