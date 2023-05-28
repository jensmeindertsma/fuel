import express from "express";
import { handleRequest } from "./handler";

const app = express();

app.get("/", handleRequest);

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
  console.log(`Now listening on http://localhost:${PORT}`);
});
