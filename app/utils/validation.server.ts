import type { z } from "zod";

type IncompleteFeedback<O> = {
  [K in keyof O]: { value: string; error?: string };
};

type Feedback<O> = {
  values: { [K in keyof O]: O[K] };
  issues: { [K in keyof O]: string | undefined };
};

function generateFeedback<O>(
  error: z.ZodError<O>,
  values: {
    [k: string]: string;
  }
): Feedback<O> {
  const flattenedError = error.flatten();

  let incompleteFeedback = Object.entries(flattenedError.fieldErrors).reduce(
    function (result, entry) {
      // Why can't `Object.entries` just do it's job :(
      let [fieldName, fieldErrors] = entry as [string, string[]];

      // TODO: consider file uploads
      result[fieldName as keyof IncompleteFeedback<O>] = {
        value: values[fieldName],
        error: fieldErrors[0],
      };
      return result;
    },
    {} as IncompleteFeedback<O>
  );

  let completeFeedback = incompleteFeedback as Feedback<O>;
  completeFeedback.formError = flattenedError.formErrors[0];

  return completeFeedback;
}

export async function parseFormData<O>(
  formData: FormData,
  schema: z.Schema<O>
): Promise<Feedback<O>> {
  const values = Object.fromEntries(formData);
  const result = schema.safeParse(values);

  if (result.success) {
    return { data: result.data, issues: null };
  }

  if (contains_files(values)) {
    throw new Error("");
  }

  return { data: null, issues: generateFeedback(result.error, values) };
}

function contains_files(data: {
  [k: string]: FormDataEntryValue;
}): data is { [k: string]: string | File } {
  return Object.values(data).some((value) => value instanceof File);
}
