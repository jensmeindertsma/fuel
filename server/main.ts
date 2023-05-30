import { createRequestHandler } from "@remix-run/express";
import closeWithGrace from "close-with-grace";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import path from "path";

const MODE = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;

const build = await import(path.join(process.cwd(), "build/index.js"));

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

closeWithGrace(async ({ err }) => {
  if (err) {
    console.log("Shutting down server because of error: ", err);
  }

  await new Promise((resolve, reject) => {
    server.close((e) => (e ? reject(e) : resolve("ok")));
  });
});
