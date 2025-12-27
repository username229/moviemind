import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";

/* ===========================
   TYPES
=========================== */
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

/* ===========================
   APP SETUP
=========================== */
const app = express();
const httpServer = createServer(app);

/* ===========================
   MIDDLEWARES
=========================== */
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

/* ===========================
   LOGGER
=========================== */
export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${time} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`);
    }
  });

  next();
});

/* ===========================
   BOOTSTRAP
=========================== */
(async () => {
  try {
    const PORT = Number(process.env.PORT) || 10000;

    // ✅ REGISTRA ROTAS API
    await registerRoutes(httpServer, app);

    // ❌ NÃO SERVE FRONTEND NO BACKEND
    if (process.env.NODE_ENV !== "production") {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // ✅ 404 (APÓS ROTAS)
    app.use((_req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    // ✅ ERROR HANDLER (ÚLTIMO)
    app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message}`, "error");
      res.status(status).json({ message });
    });

    httpServer.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    log(`Failed to start server: ${err}`, "error");
    process.exit(1);
  }
})();
