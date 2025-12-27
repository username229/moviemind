import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
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
   CORS (PRIMEIRO DE TUDO)
=========================== */
const allowedOrigins = [
  "https://moviemind-g2uj.onrender.com",       // possível variação
  "http://localhost:5173",                  // dev local
  "http://localhost:10000",                  // dev local backend
];

app.use(
  cors({
    origin: function(origin, callback) {
      // Permitir requests sem origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Preflight requests
app.options('*', cors());

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

  // Log da origem do request
  log(`${req.method} ${path} from ${req.headers.origin || 'no-origin'}`);

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

    // ❌ NÃO servir frontend no backend em produção
    if (process.env.NODE_ENV !== "production") {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // Health check endpoint
    app.get("/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // ✅ 404 (DEPOIS DAS ROTAS)
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
      log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      log(` Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (err) {
    log(`Failed to start server: ${err}`, "error");
    process.exit(1);
  }
})();