import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Unexpected database connection error:", error.message);
});
