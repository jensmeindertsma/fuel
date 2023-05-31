import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import chokidar from "chokidar";
import closeWithGrace from "close-with-grace";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import path from "node:path";

const MODE = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;

const BUILD_PATH = path.join(process.cwd(), "build/app/index.js");
const build = await import(BUILD_PATH);
let devBuild = build;

const app = express();

app.use(compression());
app.use(morgan("tiny"));

app.disable("x-powered-by");

app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

app.use(express.static("public"));

app.all(
  "*",
  MODE === "development"
    ? (request, response, next) => {
        // Using a closure here allows the devBuild to be the latest changed version,
        // it may be changed by `reloadBuild()`
        const handleRequest = createRequestHandler({ build: devBuild });
        handleRequest(request, response, next);
      }
    : createRequestHandler({ build })
);

const server = app.listen(PORT, async () => {
  console.log(`[SERVER] listening on http://localhost:${PORT}`);

  if (MODE === "development") {
    broadcastDevReady(build);
  }
});

closeWithGrace(async ({ err }) => {
  if (err) {
    console.log("Shutting down server because of error: ", err);
  }

  await new Promise((resolve, reject) => {
    server.close((e) => (e ? reject(e) : resolve("ok")));
  });
});

if (process.env.NODE_ENV === "development") {
  async function reloadBuild() {
    devBuild = await import(`${BUILD_PATH}?update=${Date.now()}`);
    broadcastDevReady(devBuild);
  }

  const watchPath = BUILD_PATH.replace(/\\/g, "/");
  const watcher = chokidar.watch(watchPath, { ignoreInitial: true });
  watcher.on("all", reloadBuild);
}
