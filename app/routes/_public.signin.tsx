import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { MetaResult } from "~/types/remix.ts";
import { formatTitle } from "~/utils/meta.ts";
import { commitSession, getSession } from "~/utils/session.server.ts";
import { parseFormData } from "~/utils/validation.server.ts";
import { z } from "zod";

const schema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address.")
    .max(5, "go home"),
});

export async function action({ request }: ActionArgs) {
  const { data, errors } = await parseFormData(request, schema);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (errors) {
    return json(errors, 400);
  }

  console.log(data.email);

  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export function meta(): MetaResult {
  return [{ title: formatTitle("Sign in") }];
}

export default function SignIn() {
  const feedback = useActionData<typeof action>();
  const navigation = useNavigation();

  console.log(feedback);

  return (
    <Form method="post">
      <fieldset disabled={navigation.state === "submitting"}>
        <h2>Sign In</h2>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue={feedback?.email.value}
        />
        {feedback?.email?.error && (
          <p style={{ color: "red" }}>{feedback.email.error}</p>
        )}
        <button type="submit">
          {navigation.state === "submitting" ? "Signing in..." : "Sign in"}
        </button>
      </fieldset>
    </Form>
  );
}
