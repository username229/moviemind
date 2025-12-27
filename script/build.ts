import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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

// Para ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===========================
   CORS
=========================== */
const allowedOrigins = [
  "https://moviemind-g2uj.onrender.com",
  "http://localhost:5173",
  "http://localhost:5000",
];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

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

    // ✅ REGISTRA ROTAS API (ANTES dos arquivos estáticos)
    await registerRoutes(httpServer, app);

    // Health check
    app.get("/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // ✅ SERVIR ARQUIVOS ESTÁTICOS EM PRODUÇÃO
    if (process.env.NODE_ENV === "production") {
      const publicPath = path.join(__dirname, "public");
      log(`📁 Serving static files from: ${publicPath}`);
      
      app.use(express.static(publicPath));
      
      // SPA fallback - todas as rotas não-API retornam index.html
      app.get("*", (_req, res) => {
        res.sendFile(path.join(publicPath, "index.html"));
      });
    } else {
      // ✅ DEV: Usar Vite
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

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
      log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (err) {
    log(`Failed to start server: ${err}`, "error");
    process.exit(1);
  }
})();