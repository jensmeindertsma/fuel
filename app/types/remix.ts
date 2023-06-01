import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";

export type LinksResult = ReturnType<LinksFunction>;

export type MetaArguments = Parameters<V2_MetaFunction>[0];
export type MetaResult = ReturnType<V2_MetaFunction>;
