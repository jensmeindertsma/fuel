import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["server/main.ts"],
  outfile: "build/server/main.js",
  format: "esm",
  target: "esnext",
  platform: "node",
  logLevel: "info",
});
