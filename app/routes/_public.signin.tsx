import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { MetaResult } from "~/types/remix.ts";
import { generateCode } from "~/utils/authentication.server.ts";
import { database } from "~/utils/database.server.ts";
import { sendEmail } from "~/utils/email.server.ts";
import { decrypt, encrypt } from "~/utils/encryption.server.ts";
import { badRequest } from "~/utils/http.server.ts";
import { formatTitle } from "~/utils/meta.ts";
import { redirectUser } from "~/utils/session.server.ts";
import { parseFormData } from "~/utils/validation.server.ts";
import { Fragment } from "react";
import { z } from "zod";

enum Intent {
  SignIn = "sign-in",
  Authenticate = "authenticate",
}

enum Status {
  SigningIn = "signing-in",
  Authenticating = "authenticating",
}

export async function action({ request }: ActionArgs) {
  const session = await redirectUser(request, "/overview");
  const formData = await request.formData();

  const intent = formData.get("intent");
  switch (intent) {
    case Intent.SignIn: {
      const schema = z.object({
        email: z.string().email("Please provide a valid email address"),
      });
      const { success, values, issues } = parseFormData(formData, schema);

      if (!success) {
        return badRequest({
          status: Status.SigningIn as const,
          values,
          issues,
        });
      }

      const code = generateCode();

      if (process.env.NODE_ENV === "production") {
        const error = await sendEmail({
          to: values.email,
          subject: "Your authentication code for Fuel",
          text: `Use the following code to get started with Fuel: ${code}`,
          html: `
            <!DOCTYPE html>
              <html>
              <body>
                <h1>Use ${code} to start using Fuel</h1>
              </body>
            </html>
          `,
        });

        if (error) {
          return badRequest({
            status: Status.SigningIn as const,
            values,
            issues: {
              ...issues,
              formError:
                "Failed to send you an authentication code by email. Please try again and contact `fuel@jensmeindertsma.com` for assistance if the problem persists.",
            },
          });
        }
      } else {
        console.log("AUTH CODE: " + code);
      }

      // Progress to next stage, show form for entering the code.
      return json({
        status: Status.Authenticating as const,
        issues: null,
        values: {
          email: values.email,
          code: "",
          encryptedCode: encrypt(code),
        },
      });
    }

    case Intent.Authenticate: {
      const schema = z.object({
        email: z.string(),
        encryptedCode: z.string(),
        code: z.string(),
      });

      const { success, values, issues } = parseFormData(formData, schema);

      if (!success) {
        if (issues?.email || issues?.encryptedCode) {
          throw badRequest({
            error:
              "Did not receive back the encrypted code from verification form!",
          });
        }

        return badRequest({
          status: Status.Authenticating as const,
          values,
          issues,
        });
      }

      if (decrypt(values.encryptedCode) !== values.code) {
        return badRequest({
          status: Status.Authenticating as const,
          values,
          issues,
        });
      }

      const user = await database.user.findUnique({
        where: {
          email: values.email,
        },
        select: { id: true },
      });

      if (!user) {
        return badRequest({
          status: Status.Authenticating as const,
          values,
          issues: {
            ...issues,
            formError: "You don't have an account for this email yet! Sign up!",
          },
        });
      }

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
          "Form submission to `/SignIn` did not include a valid form intent!",
        receivedIntent: intent?.toString() || null,
      });
    }
  }
}

export function meta(): MetaResult {
  return [{ title: formatTitle("Sign up") }];
}

export default function SignIn() {
  const submission = useActionData<typeof action>();
  const navigation = useNavigation();

  let form;
  if (submission?.status === Status.Authenticating) {
    form = (
      <Fragment key={Intent.Authenticate}>
        <input type="hidden" name="intent" value={Intent.Authenticate} />
        <input type="hidden" name="email" value={submission.values.email} />
        <input
          type="hidden"
          name="encryptedCode"
          value={submission.values.encryptedCode}
        />

        <label htmlFor="code">Code</label>
        <input
          type="text"
          inputMode="numeric"
          id="code"
          name="code"
          required
          defaultValue={submission?.values.code}
        />
        {submission?.issues?.code && (
          <p style={{ color: "red" }}>{submission?.issues.code}</p>
        )}

        <button type="submit">
          {navigation.state === "submitting"
            ? "Authenticating ..."
            : "Authenticate"}
        </button>
        {submission?.issues?.formError && (
          <p style={{ color: "red" }}>{submission?.issues.formError}</p>
        )}
      </Fragment>
    );
  } else {
    form = (
      <Fragment key={Intent.SignIn}>
        <input type="hidden" name="intent" value={Intent.SignIn} />

        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue={submission?.values.email}
        />
        {submission?.issues?.email && (
          <p style={{ color: "red" }}>{submission?.issues.email}</p>
        )}

        <button type="submit">
          {navigation.state === "submitting" ? "Signing in..." : "Sign in"}
        </button>
        {submission?.issues?.formError && (
          <p style={{ color: "red" }}>{submission?.issues.formError}</p>
        )}
      </Fragment>
    );
  }

  return (
    <Form method="post">
      <h2>Sign In</h2>
      <fieldset disabled={navigation.state === "submitting"}>{form}</fieldset>
    </Form>
  );
}
