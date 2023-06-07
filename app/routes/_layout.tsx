import { notFound } from "~/utils/http.server.ts";

export function loader() {
  return notFound(null);
}

export default function NotFound() {
  return <h1>404 Not Found</h1>;
}
