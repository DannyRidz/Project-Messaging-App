import express from "express";
import { pool } from "./db.js";
import { AppError } from "./utils/AppError.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database() AS database");

    res.json({
      status: "ok",
      database: result.rows[0].database,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    throw new AppError(503, "Database unavailable");
  }
});

app.use((req, res, next) => {
  next(new AppError(404, "Route not found"));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
