import { PrismaClient } from "@prisma/client";
import express from "express";

const database = new PrismaClient();

const app = express();

app.use((request, _, next) => {
  console.log(`[REQ] ${request.url} - ${request.ip}`);
  next();
});

app.get("/", async (_, response) => {
  return response.json(await database.user.findMany());
});

app.get("/new", async (request, response) => {
  const name = request.query["name"];

  if (typeof name !== "string") {
    response.status(400).send("Missing name");
    return;
  }

  console.log(`Creating new user with name '${name}'`);
  const user = await database.user.create({
    data: {
      name,
    },
  });

  response.json(user);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Now listening on http://localhost:${PORT}`);
});
