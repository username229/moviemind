import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  try {
    // 1. Limpa a pasta dist
    console.log("Cleaning dist directory...");
    await rm("dist", { recursive: true, force: true });

    // 2. Cria as pastas necessárias
    console.log("Creating dist directories...");
    await mkdir("dist", { recursive: true });
    await mkdir("dist/public", { recursive: true });

    // 3. Build do client
    console.log("Building client...");
    await viteBuild({
      build: {
        outDir: "dist/public",
        emptyOutDir: false,
      }
    });

    // 4. Verifica se o build do client funcionou
    if (!existsSync("dist/public/index.html")) {
      throw new Error("Client build failed - index.html not found in dist/public");
    }
    console.log("Client built successfully");

    // 5. Build do server
    console.log("Building server...");
    const pkg = JSON.parse(await readFile("package.json", "utf-8"));
    const allDeps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ];
    const externals = allDeps.filter((dep) => !allowlist.includes(dep));

    await esbuild({
      entryPoints: ["server/index.ts"],
      platform: "node",
      bundle: true,
      format: "cjs",
      outfile: "dist/index.cjs",
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      minify: true,
      external: externals,
      logLevel: "info",
    });

    // 6. Verifica se o build do server funcionou
    if (!existsSync("dist/index.cjs")) {
      throw new Error("Server build failed - index.cjs not found in dist");
    }
    console.log("Server built successfully");
    
    // 7. Resumo final
    console.log("\nBuild completed successfully!");
    console.log("  dist/");
    console.log("    ├── public/        (frontend - static site)");
    console.log("    │   ├── index.html");
    console.log("    │   └── assets/");
    console.log("    └── index.cjs      (backend - web service)");
    console.log("");
    
  } catch (err) {
    console.error("Build failed:", err);
    throw err;
  }
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});