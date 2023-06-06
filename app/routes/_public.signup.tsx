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
      const { success, values, issues } = parseFormData(formData, schema);

      if (!success) {
        return badRequest({
          status: Status.SigningUp as const,
          values,
          issues,
        });
      }

      // Make sure email is available.
      if (await database.user.findUnique({ where: { email: values.email } })) {
        return badRequest({
          status: Status.SigningUp as const,
          values,
          issues: {
            ...issues,
            email: "This email address is already in use!",
          },
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
            status: Status.SigningUp as const,
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
          ...values,
          code: "",
          encryptedCode: encrypt(code),
        },
      });
    }

    case Intent.Authenticate: {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
        encryptedCode: z.string(),
        code: z.string(),
      });

      const { success, values, issues } = parseFormData(formData, schema);

      if (!success) {
        if (issues?.name || issues?.email || issues?.encryptedCode) {
          throw badRequest({
            error:
              "Did not receive back the name or email or encrypted code from verification form!",
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

      const user = await database.user.create({
        data: {
          name: values.name,
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

  let form;
  if (submission?.status === Status.Authenticating) {
    form = (
      <Fragment key={Intent.Authenticate}>
        <input type="hidden" name="intent" value={Intent.Authenticate} />
        <input type="hidden" name="name" value={submission.values.name} />
        <input type="hidden" name="email" value={submission.values.email} />
        <input
          type="hidden"
          name="encryptedCode"
          value={submission.values.encryptedCode}
        />

        <label htmlFor="code">Code</label>
        <input
          type="text"
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
      <Fragment key={Intent.SignUp}>
        <input type="hidden" name="intent" value={Intent.SignUp} />

        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={submission?.values.name}
        />
        {submission?.issues?.name && (
          <p style={{ color: "red" }}>{submission?.issues.name}</p>
        )}

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
          {navigation.state === "submitting" ? "Signing up..." : "Sign up"}
        </button>
        {submission?.issues?.formError && (
          <p style={{ color: "red" }}>{submission?.issues.formError}</p>
        )}
      </Fragment>
    );
  }

  return (
    <Form method="post">
      <h2>Sign Up</h2>
      <fieldset disabled={navigation.state === "submitting"}>{form}</fieldset>
    </Form>
  );
}
