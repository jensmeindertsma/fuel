import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { MetaResult } from "~/types/remix.ts";
import { formatTitle } from "~/utils/meta.ts";
import { redirectUser } from "~/utils/session.server.ts";
import { parseFormData } from "~/utils/validation.server.ts";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please provide a valid email address."),
});

export async function action({ request }: ActionArgs) {
  const session = await redirectUser(request, "/overview");

  const { data, issues } = await parseFormData(request, schema);

  if (issues) {
    return json(issues, 400);
  }

  console.warn(
    "TODO: send email, show form for 6 digit code, then get user id and set session",
    data.email
  );

  return redirect("/", {
    headers: {
      "Set-Cookie": await session.commit(),
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
      <h2>Sign In</h2>
      <fieldset disabled={navigation.state === "submitting"}>
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
