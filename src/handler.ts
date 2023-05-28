import type express from "express";

export function handleRequest(_: express.Request, response: express.Response) {
  response.send("Hello, World! Welcome to Fuel!");
}
