import type { z } from "zod";

// This implementation is hard to write in TypeScript. TypeScript should really
// really get better at `Object.keys`, `Object.entries`, `Object.values` and
// the like. Constructing and manipulating objects iteratively is a pain today.

export function parseFormData<O extends object>(
  formData: FormData,
  schema: z.ZodSchema<O>
): ParseResult<O> {
  const rawValues = Object.fromEntries(formData);
  const result = schema.safeParse(rawValues);

  if (result.success) {
    return {
      success: result.success,
      values: result.data,
      issues: {},
    };
  }

  const error = result.error.flatten();

  const issues = Object.entries(error.fieldErrors).reduce(
    (issues, [fieldName, fieldErrors]) => {
      issues[fieldName] = (fieldErrors as string[])[0];
      return issues;
    },
    {} as { [key: string]: string }
  );

  issues.formError = error.formErrors[0];

  result.error.errors;

  return {
    success: result.success,
    values: Object.entries(rawValues).reduce((values, [key, rawValue]) => {
      if (issues[key]) {
        // Parsing this field failed
        return values;
      }

      // This value was deemed correct by safeParse
      values[key] = rawValue.toString();

      return values;
    }, {} as { [key: string]: string }) as { [K in keyof O]?: O[K] },
    issues: issues as { [K in keyof O]?: string } & {
      formError?: string;
    },
  };
}

type ParseResult<O> =
  | {
      success: true;
      values: { [K in keyof O]: O[K] };
      issues: { [K in keyof O]?: undefined } & {
        formError?: undefined;
      };
    }
  | {
      success: false;
      values: { [K in keyof O]?: O[K] };
      issues: { [K in keyof O]?: string } & {
        formError?: string;
      };
    };
