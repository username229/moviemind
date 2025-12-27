import { build } from "esbuild";

await build({
  entryPoints: ["server/index.ts"],
  outfile: "dist/index.cjs",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
