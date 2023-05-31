import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderArguments } from "~/types/remix.ts";
import { database } from "~/utils/database.server.ts";
import { getSession } from "~/utils/session.server.ts";

export async function loader({ request }: LoaderArguments) {
  const session = await getSession(request.headers.get("Cookie"));

  const id = session.get("id");

  if (!id) {
    return redirect("/signin");
  }

  const user = await database.user.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
    },
  });

  if (!user) {
    throw new Error("Encountered session with user ID not found in database");
  }

  return json(user.name);
}

export default function Log() {
  const name = useLoaderData<typeof loader>();

  return <h1 style={{ marginTop: "2em" }}>Let's get logging, {name}</h1>;
}
