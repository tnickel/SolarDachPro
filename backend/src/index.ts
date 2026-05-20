import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";
import routes from "./routes";

/**
 * Solar-as-a-Service – Backend API
 *
 * Express application with security middleware, structured routing,
 * and graceful shutdown handling.
 */
const app = express();

// ---- Security Middleware ----
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---- Body Parsing ----
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- Health Check ----
app.get("/health", async (_req, res) => {
  try {
    // Verify database connectivity
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
    });
  }
});

// ---- API Routes ----
app.use("/api/v1", routes);

// ---- 404 Handler ----
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: "Route not found" },
  });
});

// ---- Global Error Handler ----
app.use(errorHandler);

// ---- Server Startup ----
const server = app.listen(env.PORT, () => {
  console.log(`
  ⚡ Solar-as-a-Service API
  ─────────────────────────
  Environment: ${env.NODE_ENV}
  Port:        ${env.PORT}
  Health:      http://localhost:${env.PORT}/health
  API:         http://localhost:${env.PORT}/api/v1
  `);
});

// ---- Graceful Shutdown ----
async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Database disconnected. Goodbye! 👋");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
