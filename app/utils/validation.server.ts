import type { z } from "zod";

type FormErrors<O> = {
  [K in keyof O]: { value: string; error?: string };
};

function formatErrors<O>(
  formError: z.ZodError<O>,
  values: {
    [k: string]: FormDataEntryValue;
  }
): FormErrors<O> {
  return Object.entries(
    formError.format() as Record<string, z.ZodFormattedError<O>>
  ).reduce(function (result, [key, field]) {
    if (key === "_errors") {
      return result;
    }

    // TODO: consider file uploads
    result[key as keyof O] = {
      value: values[key] as string,
      error: field._errors[0],
    };
    return result;
  }, {} as FormErrors<O>);
}

export async function parseFormData<O>(
  request: Request,
  schema: z.Schema<O>
): Promise<{ data: O; errors: null } | { data: null; errors: FormErrors<O> }> {
  const values = Object.fromEntries(await request.formData());
  const result = schema.safeParse(values);

  if (result.success) {
    return { data: result.data, errors: null };
  }

  return { data: null, errors: formatErrors(result.error, values) };
}
