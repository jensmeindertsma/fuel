import express from "express";
import compression from "compression";
import morgan from "morgan";
import closeWithGrace from "close-with-grace";
import { createRequestHandler } from "@remix-run/express";
import { type ServerBuild } from "@remix-run/node";

import * as serverBuild from "../build/index.js";
let build = serverBuild as unknown as ServerBuild;

const MODE = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(compression());
app.use(morgan("tiny"));

app.disable("x-powered-by");

app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

app.use(express.static("public"));

app.all("*", createRequestHandler({ build, mode: MODE }));

const server = app.listen(PORT, async () => {
  console.log(`[SERVER] listening on http://localhost:${PORT}`);

  if (MODE === "development") {
    const { broadcastDevReady } = await import("@remix-run/node");
    broadcastDevReady(build);
  }
});

closeWithGrace(async () => {
  await new Promise((resolve, reject) => {
    server.close((e) => (e ? reject(e) : resolve("ok")));
  });
});
