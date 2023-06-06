import { requireEnvironmentVariable } from "./environment.server.ts";
import { randomInt } from "node:crypto";

export async function sendAuthenticationMail(
  destination: string
): Promise<{ code: string; error: null } | { code: null; error: string }> {
  const code = generateCode();

  const auth = `${Buffer.from(
    `api:${requireEnvironmentVariable("MAILGUN_SENDING_KEY")}`
  ).toString("base64")}`;

  const body = new URLSearchParams({
    from: "fuel@jensmeindertsma.com",
    to: destination,
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

  if (!result.ok) {
    return { code: null, error: result.statusText };
  }

  return { code, error: null };
}

export function generateCode() {
  return randomInt(10 ** 6)
    .toString()
    .padStart(6, "0");
}
