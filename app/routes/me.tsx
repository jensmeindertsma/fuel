import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { database } from "~/utils/database.server.ts";
import { requireId } from "~/utils/session.server.ts";

export async function loader({ request }: LoaderArgs) {
  const { id, session } = await requireId(request, { redirectTo: "/signin" });

  const user = await database.user.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
    },
  });

  if (!user) {
    console.error("User session has invalid ID");
    return redirect("/signin", {
      headers: {
        "Set-Cookie": await session.destroy(),
      },
    });
  }

  return json({ name: user.name });
}

export default function Home() {
  const { name } = useLoaderData<typeof loader>();

  return <h2>Welcome {name}!</h2>;
}
