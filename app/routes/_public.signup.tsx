import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { MetaResult } from "~/types/remix.ts";
import { generateCode } from "~/utils/authentication.server.ts";
import { database } from "~/utils/database.server.ts";
import { sendAuthenticationCode, sendEmail } from "~/utils/email.server.ts";
import { encrypt } from "~/utils/encryption.server.ts";
import { badRequest } from "~/utils/http.server.ts";
import { formatTitle } from "~/utils/meta.ts";
import { redirectUser } from "~/utils/session.server.ts";
import { hasFeedback, parseFormData } from "~/utils/validation.server.ts";
import { z } from "zod";

enum Intent {
  SignUp = "sign-up",
  Authenticate = "authenticate",
}

enum Status {
  SigningUp = "signing-up",
  Authenticating = "authenticating",
}

export async function action({ request }: ActionArgs) {
  const session = await redirectUser(request, "/overview");
  const formData = await request.formData();

  const intent = formData.get("intent");
  switch (intent) {
    case Intent.SignUp: {
      const schema = z.object({
        name: z.string(),
        email: z.string().email("Please provide a valid email address"),
      });
      const { values, feedback } = parseFormData(formData, schema);

      if (feedback && Object.values(feedback).some(Boolean)) {
        return badRequest({
          status: Status.SigningUp as const,
          values,
          feedback,
        });
      }

      if (await database.user.findUnique({ where: { email: values.email } })) {
        return badRequest({
          status: Status.SigningUp as const,
          values,
          feedback: {
            ...feedback,
            email: "This email address is already in use!",
          },
        });
      }

      const code = generateCode();
      const error = await sendEmail({
        to: values.email,
        subject: "Your authentication code for Fuel",
        text: `Use the following code to log in to Fuel: ${code}`,
        html: `
          <!DOCTYPE html>
            <html>
            <body>
              <h1>Use ${code} to log into Fuel</h1>
            </body>
          </html>
        `,
      });

      if (typeof error === "string") {
        return badRequest({
          status: Status.SigningUp as const,
          values,
          feedback: {
            ...feedback,
            formError:
              "Failed to send you an authentication code by email. Please try again and contact `fuel@jensmeindertsma.com` for assistance if the problem persists.",
          },
        });
      }

      return json({
        status: Status.Authenticating as const,
        values: {
          ...values,
          code: "",
          encryptedCode: encrypt(code),
        },
        feedback: null,
      });
    }

    case Intent.Authenticate: {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
        encryptedCode: z.string(),
        code: z.string(),
      });

      const result = parseFormData(formData, schema);

      if (typeof result.feedback === "undefined") {
        throw new Error("Foo");
      }

      if (
        result.feedback?.name ||
        result.feedback?.email ||
        result.feedback?.encryptedCode
      ) {
        throw badRequest({
          error:
            "Did not receive back the name or email or encrypted code from verification form!",
        });
      }

      if (result.feedback?.code || result.feedback?.formError) {
        return badRequest({
          status: Status.Authenticating as const,
          values: result.values,
          feedback: result.feedback,
        });
      }

      const user = await database.user.create({
        data: {
          name: result.values.name,
          email: values.email,
        },
        select: { id: true },
      });

      session.set("id", user.id);
      return redirect("/overview", {
        headers: {
          "Set-Cookie": await session.commit(),
        },
      });
    }

    default: {
      throw badRequest({
        error:
          "Form submission to `/signup` did not include a valid form intent!",
        receivedIntent: intent?.toString() || null,
      });
    }
  }
}

export function meta(): MetaResult {
  return [{ title: formatTitle("Sign up") }];
}

export default function SignUp() {
  const submission = useActionData<typeof action>();
  const navigation = useNavigation();

  if (submission?.status === Status.Authenticating) {
    return (
      <Form method="post">
        <h2>Sign Up</h2>
        <fieldset disabled={navigation.state === "submitting"}>
          <input type="hidden" name="intent" value={Intent.Authenticate} />
          <input type="hidden" name="name" value={submission.values.name} />
          <input type="hidden" name="email" value={submission.values.email} />

          <label htmlFor="code">Code</label>
          <input
            type="text"
            inputMode="numeric"
            id="code"
            name="code"
            required
            defaultValue={submission?.values.code}
          />
          {submission?.feedback?.code && (
            <p style={{ color: "red" }}>{submission?.feedback.code}</p>
          )}

          <button type="submit">
            {navigation.state === "submitting"
              ? "Authenticating ..."
              : "Authenticate"}
          </button>
          {submission?.feedback?.formError && (
            <p style={{ color: "red" }}>{submission?.feedback.formError}</p>
          )}
        </fieldset>
      </Form>
    );
  }

  return (
    <Form method="post">
      <h2>Sign Up</h2>
      <fieldset disabled={navigation.state === "submitting"}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={submission?.values.name}
        />
        {submission?.feedback?.name && (
          <p style={{ color: "red" }}>{submission?.feedback.name}</p>
        )}

        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue={submission?.values.email}
        />
        {submission?.feedback?.email && (
          <p style={{ color: "red" }}>{submission?.feedback.email}</p>
        )}

        <button type="submit">
          {navigation.state === "submitting" ? "Signing up..." : "Sign up"}
        </button>
        {submission?.feedback?.formError && (
          <p style={{ color: "red" }}>{submission?.feedback.formError}</p>
        )}
      </fieldset>
    </Form>
  );
}
