import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet } from "@remix-run/react";
import { requireId } from "~/utils/session.server.ts";

export async function loader({ request }: LoaderArgs) {
  await requireId(request, { redirectTo: "/signin" });
  return json(null);
}

export default function App() {
  return (
    <>
      <header style={{ display: "flex", flexDirection: "row" }}>
        <h2>Fuel</h2>
        TODO NAME
        <nav>
          <ul
            style={{ display: "flex", flexDirection: "row", listStyle: "none" }}
          >
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            <li>
              <Form method="post" action="/signout">
                <button type="submit">Sign out</button>
              </Form>
            </li>
          </ul>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
