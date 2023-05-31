import { Prisma } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import styles from "~/styles/index.css";
import type {
  ActionArguments,
  LinksResult,
  MetaResult,
} from "~/types/remix.ts";
import { database } from "~/utils/database.server.ts";
import { commitSession, getSession } from "~/utils/session.server.ts";

export async function action({ request }: ActionArguments) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");

  if (typeof name !== "string" || typeof email !== "string") {
    throw new Error("TODO HANDLE FORM VALIDATION");
  }

  try {
    const { id } = await database.user.create({
      data: {
        name,
        email,
      },
      select: {
        id: true,
      },
    });

    session.set("id", id);

    return redirect("/log", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        return json("A user with this email already exists", 400);
      }
    }

    throw error;
  }
}

export function meta(): MetaResult {
  return [
    { title: "Fuel" },
    { name: "description", content: "Welcome to Fuel!" },
  ];
}

export function links(): LinksResult {
  return [{ rel: "stylesheet", href: styles }];
}

export default function Home() {
  const error = useActionData<typeof action>();

  return (
    <>
      <div>
        <h2>Sign up</h2>
        <Form method="post">
          <label htmlFor="name">Name</label>
          <input type="text" required id="name" name="name" />
          <label htmlFor="email">Email Address</label>
          <input type="email" required id="email" name="email" />
          <button type="submit">Sign up</button>
          <p style={{ color: "red" }}>{error}</p>
        </Form>
      </div>
    </>
  );
}
