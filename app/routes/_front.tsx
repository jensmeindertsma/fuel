import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import styles from "~/styles/front.css";
import type { LinksResult, LoaderArguments } from "~/types/remix.ts";
import { getSession } from "~/utils/session.server.ts";
import { Link } from "react-router-dom";

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("id")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/log");
  }

  return json(null);
}

export function links(): LinksResult {
  return [{ rel: "stylesheet", href: styles }];
}

export default function FrontLayout() {
  return (
    <>
      <header className="header">
        <h1>Fuel</h1>

        <nav>
          <ul>
            <li>
              <Link to="/">Sign up</Link>
            </li>
            <li>
              <Link to="/signin">Sign in</Link>
            </li>
          </ul>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
