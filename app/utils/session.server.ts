import { requireEnvironmentVariable } from "./environment.server.ts";
import {
  createCookie,
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";

const cookie = createCookie("fuel", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: [requireEnvironmentVariable("SESSION_SECRET")],
  secure: process.env.NODE_ENV === "production",
});

type SessionData = { id: string };
type FlashData = Record<never, never>;

const sessionStorage = createCookieSessionStorage<SessionData, FlashData>({
  cookie,
});

export async function getSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  return {
    ...session,
    id: undefined,
    async commit() {
      return await sessionStorage.commitSession(session);
    },
    async destroy() {
      return await sessionStorage.destroySession(session);
    },
  };
}

export async function redirectUser(request: Request, redirectTo: string) {
  const session = await getSession(request);

  if (session.has("id")) {
    throw redirect(redirectTo);
  }

  return session;
}

export async function requireId(
  request: Request,
  options: { redirectTo: string }
) {
  const session = await getSession(request);
  const id = session.get("id");

  if (!id) {
    throw redirect(options.redirectTo);
  }

  return { id, session };
}
