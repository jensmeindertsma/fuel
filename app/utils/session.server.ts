import { requireEnvironmentVariable } from "./environment.server.ts";
import { createCookie, createCookieSessionStorage } from "@remix-run/node";

const cookie = createCookie("fuel", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: [requireEnvironmentVariable("SESSION_SECRET")],
  secure: process.env.NODE_ENV === "production",
});

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<{ id: string }>({
    cookie,
  });
