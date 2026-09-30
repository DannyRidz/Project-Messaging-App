import express from "express";
import { pool } from "./db.js";
import { AppError } from "./utils/AppError.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sessionMiddleware } from "./middleware/session.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { conversationsRouter } from "./routes/conversations.js";
import { attachmentsRouter } from "./routes/attachments.js";
import { friendsRouter } from "./routes/friends.js";
import { presenceRouter } from "./routes/presence.js";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3000);

const clientDist = fileURLToPath(
  new URL("../../client/dist/", import.meta.url),
);

const clientIndex = fileURLToPath(
  new URL("../../client/dist/index.html", import.meta.url),
);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json({ limit: "100kb" }));
app.use(sessionMiddleware);

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

app.use("/api/friends", friendsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/attachments", attachmentsRouter);
app.use("/api/presence", presenceRouter);

app.use("/api", (req, res, next) => {
  next(new AppError(404, "Route not found"));
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDist));

  app.get("/{*splat}", (req, res) => {
    res.sendFile(clientIndex);
  });
}

app.use((req, res, next) => {
  next(new AppError(404, "Route not found"));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
