import type { ActionArgs } from "@remix-run/node";
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

export function loader() {
  return redirect("/app");
}
