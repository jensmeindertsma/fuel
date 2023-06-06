import { Prisma } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { MetaResult } from "~/types/remix.ts";
import { sendAuthenticationMail } from "~/utils/authentication.server.ts";
import { database } from "~/utils/database.server.ts";
import { formatTitle } from "~/utils/meta.ts";
import { redirectUser } from "~/utils/session.server.ts";
import { parseFormData } from "~/utils/validation.server.ts";
import { z } from "zod";

export async function action({ request }: ActionArgs) {
  const session = await redirectUser(request, "/overview");
  const formData = await request.formData();

  const intent = formData.get("intent");
  switch (intent) {
    case "signup": {
      const schema = z.object({
        name: z.string(),
        email: z.string().email("Please provide a valid email address."),
      });

      const feedback = await parseFormData(formData, schema);

      if (Object.keys(feedback.issues).some((field) => Boolean(field))) {
        return json({ status: "error", feedback }, 400);
      }

      const { code, error } = await sendAuthenticationMail(
        feedback.values.email
      );

      if (error) {
        feedback.issues.email =
          "Failed to send you an authentication code by email. Please try again!";
        return json({ status: "error", feedback });
      }

      return json({ status: "auth", code, feedback });
    }

    case "confirm": {
      const schema = z.object({
        desired: z.string(),
        name: z.string(),
        email: z.string(),
        code: z.string(),
      });

      const feedback = await parseFormData(formData, schema);

      if (Object.keys(feedback.issues).some((field) => Boolean(field))) {
        return json({ status: "error", feedback }, 400);
      }

      // TODO: how do we check the email is in use before sending a code, but not create the user until after? what if it get's acquired in between?
      try {
        const user = await database.user.create({
          data: feedback.values,
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          if (e.code === "P2002") {
            feedback.issues.email = "Email in use";
            return json({
              status: "error",
              feedback,
            });
          }
        }
        throw e;
      }
    }

    default: {
      throw new Error(`Received submission with invalid intent: "${intent}"`);
    }
  }
}

export function meta(): MetaResult {
  return [{ title: formatTitle("Sign up") }];
}

export default function SignUp() {
  const submission = useActionData<typeof action>();
  const navigation = useNavigation();

  let form;
  if (submission?.status === "confirm") {
    form = (
      <>
        <label htmlFor="code">Code</label>
        <input
          type="text"
          inputMode="numeric"
          id="code"
          name="code"
          required
          defaultValue={submission?.feedback?.values.code}
        />
        {submission?.feedback?.issues?.code && (
          <p style={{ color: "red" }}>{submission?.feedback.issues.code}</p>
        )}
      </>
    );
  } else {
    form = (
      <>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={submission?.feedback?.values.name}
        />
        {submission?.feedback?.issues.name && (
          <p style={{ color: "red" }}>{submission?.feedback.issues.name}</p>
        )}

        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue={submission?.feedback?.values.email}
        />
        {submission?.feedback?.issues?.email && (
          <p style={{ color: "red" }}>{submission?.feedback.issues.email}</p>
        )}
      </>
    );
  }

  return (
    <Form method="post">
      <h2>Sign Up</h2>
      <fieldset disabled={navigation.state === "submitting"}>
        {form}

        <button type="submit">
          {navigation.state === "submitting" ? "Signing up..." : "Sign up"}
        </button>
      </fieldset>
    </Form>
  );
}
