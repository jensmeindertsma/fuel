import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["server/main.ts"],
  bundle: true,
  outfile: "build/server/main.js",
  format: "esm",
  target: "esnext",
  platform: "node",
  banner: {
    js: `
        import { fileURLToPath } from "url";
        import { createRequire as topLevelCreateRequire } from 'module';
        const require = topLevelCreateRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        `,
  },
  loader: {
    ".node": "file",
  },
});
