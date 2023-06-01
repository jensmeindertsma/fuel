import type { LinksResult, MetaResult } from "./types/remix.ts";
import { isRouteErrorResponse, Outlet, useRouteError } from "@remix-run/react";
import { Document } from "~/components/Document.tsx";
import globalStyles from "~/styles/global.css";

export function meta(): MetaResult {
  return [{ title: "Fuel" }];
}

export function links(): LinksResult {
  return [
    { href: "/favicon.png", rel: "icon", type: "image/png" },
    { rel: "stylesheet", href: globalStyles },
  ];
}

export default function Root() {
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
