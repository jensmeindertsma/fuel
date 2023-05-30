import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { database } from "~/utils/database.server.ts";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Fuel" },
    { name: "description", content: "Welcome to Fuel!" },
  ];
};

export async function loader() {
  return json(await database.user.findMany());
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Fuel 2.0</h1>
      <ul>
        {data.map((user) => (
          <li key={user.id}>Name: {user.name}</li>
        ))}
      </ul>
    </>
  );
}
