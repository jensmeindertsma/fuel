import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
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
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Email is invalid"),
});

export async function action({ request }: ActionArguments) {
  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 });
  }

  try {
    const { id } = await database.user.create({
      data: {
        name: submission.value.name,
        email: submission.value.email,
      },
      select: {
        id: true,
      },
    });

    const session = await getSession(request.headers.get("Cookie"));
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
        return json(
          {
            ...submission,
            /**
             * By specifying the error path as '' (root), the message will be
             * treated as a form-level error and populated
             * on the client side as `form.error`
             */
            error: {
              email: "This email address is already in use!",
            },
          },
          400
        );
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
  const lastSubmission = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastSubmission,
    onValidate({ formData }) {
      return parse(formData, { schema });
    },
  });

  return (
    <>
      <div className="box">
        <h2>Sign up</h2>
        <Form method="post" {...form.props}>
          <label htmlFor="name">Name</label>
          <input
            {...conform.input(fields.name)}
            id="name"
            type="text"
            required
          />
          <div style={{ color: "red" }}>{fields.name.error}</div>

          <label htmlFor="email">Email Address</label>
          <input
            {...conform.input(fields.email)}
            id="email"
            type="email"
            required
          />
          <div style={{ color: "red" }}>{fields.email.error}</div>

          <button type="submit">Sign up</button>
          <div style={{ color: "red" }}>{form.error}</div>
        </Form>
      </div>
    </>
  );
}
