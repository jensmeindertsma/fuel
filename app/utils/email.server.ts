import { requireEnvironmentVariable } from "./environment.server.ts";

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const auth = `${Buffer.from(
    `api:${requireEnvironmentVariable("MAILGUN_SENDING_KEY")}`
  ).toString("base64")}`;

  const body = new URLSearchParams({
    from: "fuel@jensmeindertsma.com",
    to,
    subject,
    text,
    html,
  });

  const result = await fetch(
    `https://api.eu.mailgun.net/v3/${requireEnvironmentVariable(
      "MAILGUN_DOMAIN"
    )}/messages`,
    {
      method: "POST",
      body,
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return result.ok ? null : result.statusText;
}
