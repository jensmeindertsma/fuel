import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/node";

export type ActionArguments = Parameters<ActionFunction>[0];

export type LinksResult = ReturnType<LinksFunction>;

export type LoaderArguments = Parameters<LoaderFunction>[0];

export type MetaArguments = Parameters<V2_MetaFunction>[0];
export type MetaResult = ReturnType<V2_MetaFunction>;
