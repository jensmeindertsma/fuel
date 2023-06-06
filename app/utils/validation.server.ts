import type { z } from "zod";

export function parseFormData<O extends object>(
  formData: FormData,
  schema: z.ZodSchema<O>
): ParseResult<O> {
  const rawValues = Object.fromEntries(formData);
  const result = schema.safeParse(rawValues);

  if (result.success) {
    return {
      feedback: {},
    };
  }

  const values = Object.keys(rawValues).reduce((acc, key) => {
    acc[key] = typeof rawValues[key] === "string" ? rawValues[key] : "";
    return acc;
  }, {} as { [K in keyof O]: string });

  return {
    feedback: {},
  };
}

type ParseResult<O> =
  | {
      values: { [K in keyof O]: O[K] };
      feedback: undefined;
    }
  | {
      values: { [K in keyof O]?: O[K] };
      feedback: { [K in keyof O]?: string } & {
        formError?: string;
      };
    };

export function feedbackIsProblematic<O>(
  parseResult: ParseResult<O>
): parseResult is {
  values: { [K in keyof O]?: O[K] };
  feedback: { [K in keyof O]?: string } & {
    formError?: string;
  };
} {
  return Object.values(
    parseResult.feedback === null ? {} : parseResult.feedback
  ).some(Boolean);
}
