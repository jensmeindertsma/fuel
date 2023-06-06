import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import { redirectUser } from "~/utils/session.server.ts";

export async function loader({ request }: LoaderArgs) {
  await redirectUser(request, "/overview");

  return json(null);
}

export default function Public() {
  return (
    <>
      <header>
        <h1>
          <Link to="/">Fuel</Link>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="/signin">Sign in</Link>
            </li>
            <li>
              <Link to="/signup">Sign up</Link>
            </li>
          </ul>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
