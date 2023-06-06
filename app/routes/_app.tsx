import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireId } from "~/utils/session.server.ts";

export async function loader({ request }: LoaderArgs) {
  await requireId(request, { redirectTo: "/signin" });

  return json(null);
}

export default function App() {
  return (
    <>
      <h2>Fuel App</h2>
      <Outlet />
    </>
  );
}
