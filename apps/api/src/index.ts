import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import visa from "./routes/visa";
import cities from "./routes/cities";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://wanderbase.in",
      "https://www.wanderbase.in",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.route("/visa", visa);
app.route("/cities", cities);

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, data: null, error: "Route not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json(
    { success: false, data: null, error: "Internal server error" },
    500
  );
});

const PORT = parseInt(process.env.PORT || "3001");

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`🚀 Wanderbase API running at http://localhost:${info.port}`);
  }
);

export default app;
