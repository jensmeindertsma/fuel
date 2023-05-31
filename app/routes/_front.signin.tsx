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
  const email = formData.get("email");

  if (typeof email !== "string") {
    throw new Error("TODO HANDLE FORM VALIDATION");
  }

  const user = await database.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return json("No user with this email", 400);
  }

  session.set("id", user.id);

  return redirect("/log", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export function meta(): MetaResult {
  return [{ title: "Sign in" }];
}

export function links(): LinksResult {
  return [{ rel: "stylesheet", href: styles }];
}

export default function SignIn() {
  const error = useActionData<typeof action>();
  return (
    <>
      <div>
        <h2>Sign in</h2>
        <Form method="post">
          <label htmlFor="email">Email Address</label>
          <input type="email" required id="email" name="email" />
          <button type="submit">Sign up</button>
          <p style={{ color: "red" }}>{error}</p>
        </Form>
      </div>
    </>
  );
}
