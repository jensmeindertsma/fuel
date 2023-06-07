import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server.ts";

export async function action({ request }: ActionArgs) {
  const session = await getSession(request);

  return redirect("/", {
    headers: {
      "Set-Cookie": await session.destroy(),
    },
  });
}

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  return redirect(session.has("id") ? "/app" : "/");
}
