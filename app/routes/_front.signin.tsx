import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import type { ActionArguments, MetaResult } from "~/types/remix.ts";
import { database } from "~/utils/database.server.ts";
import { commitSession, getSession } from "~/utils/session.server.ts";
import { z } from "zod";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
});

export async function action({ request }: ActionArguments) {
  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 });
  }

  const user = await database.user.findUnique({
    where: {
      email: submission.value.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return json(
      {
        ...submission,
        /**
         * By specifying the error path as '' (root), the message will be
         * treated as a form-level error and populated
         * on the client side as `form.error`
         */
        error: {
          email: "This email address does not belong to any account!",
        },
      },
      400
    );
  }

  const session = await getSession(request.headers.get("Cookie"));
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

export default function SignIn() {
  const lastSubmission = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastSubmission,
    onValidate({ formData }) {
      return parse(formData, { schema });
    },
  });

  return (
    <>
      <div>
        <h2>Sign in</h2>
        <Form method="post" {...form.props}>
          <label htmlFor="email">Email Address</label>
          <input
            {...conform.input(fields.email)}
            id="email"
            type="email"
            required
          />
          <div style={{ color: "red" }}>{fields.email.error}</div>

          <button type="submit">Sign in</button>
          <div style={{ color: "red" }}>{form.error}</div>
        </Form>
      </div>
    </>
  );
}
