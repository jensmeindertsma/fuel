import { json, redirect } from "@remix-run/node";
import { Form, Outlet } from "@remix-run/react";
import styles from "~/styles/app.css";
import type { LinksResult, LoaderArguments } from "~/types/remix.ts";
import { getSession } from "~/utils/session.server.ts";
import { Link } from "react-router-dom";

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("id")) {
    return redirect("/signin");
  }

  return json(null);
}

export function links(): LinksResult {
  return [{ rel: "stylesheet", href: styles }];
}

export default function AppLayout() {
  return (
    <>
      <header className="header">
        <h1>App</h1>

        <nav>
          <ul>
            <li>
              <Link to="/log">Log</Link>
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
