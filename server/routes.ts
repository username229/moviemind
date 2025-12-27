import express from "express";
import http from "http";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🔥 REGISTRA TODAS AS ROTAS /api 🔥
await registerRoutes(server, app);

// 🔥 SERVE O FRONTEND BUILDADO 🔥
const publicPath = path.resolve("dist/public");
app.use(express.static(publicPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
