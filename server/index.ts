import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";

import { createServer } from "http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

// --- Custom Types ---
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

// --- App Setup ---
const app = express();
const httpServer = createServer(app);

// --- Middleware ---
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// --- Logger ---
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// --- Request Logger Middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      log(logLine);
    }
  });

  next();
});

// --- Async Wrapper for Routes ---
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}



// --- Error Handler ---
app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${message}`, "error");
  res.status(status).json({ message });
});

// --- Main Async Bootstrap ---
// --- Main Async Bootstrap ---
(async () => {
  try {
    const PORT = process.env.PORT || 10000;
    httpServer.listen(Number(PORT), "0.0.0.0", () => {
      log(`Server is running on port ${PORT}`);
    });

    await registerRoutes(httpServer, app);

    // ❌ NÃO servir frontend no backend em produção
    if (process.env.NODE_ENV !== "production") {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }
  } catch (error) {
    log(`Failed to start server: ${error}`, "error");
    process.exit(1);
  }
})();


