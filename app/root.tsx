import type { LinksResult, MetaResult } from "./types/remix.ts";
import { getSession } from "./utils/session.server.ts";
import type { LoaderArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import globalStyles from "~/styles/global.css";
import type { ReactNode } from "react";

export function meta(): MetaResult {
  return [{ title: "Fuel" }];
}

export function links(): LinksResult {
  return [
    { href: "/favicon.png", rel: "icon", type: "image/png" },
    { rel: "stylesheet", href: globalStyles },
  ];
}

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const isAuthenticated = session.has("id");
  return isAuthenticated;
}

export default function Root() {
  const isAuthenticated = useLoaderData<typeof loader>();

  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let body;

  if (isRouteErrorResponse(error)) {
    body = (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  } else {
    body = (
      <div>
        <h1>Uh oh ...</h1>
        <p>Something went wrong.</p>
      </div>
    );
  }

  return <Document>{body}</Document>;
}

const SCRIPTS = true;

function Document({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        {SCRIPTS && <Scripts />}
        <LiveReload />
      </body>
    </html>
  );
}
