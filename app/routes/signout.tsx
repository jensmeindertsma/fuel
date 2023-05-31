import { redirect } from "@remix-run/node";
import type { ActionArguments } from "~/types/remix.ts";
import { destroySession, getSession } from "~/utils/session.server.ts";

export async function action({ request }: ActionArguments) {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
