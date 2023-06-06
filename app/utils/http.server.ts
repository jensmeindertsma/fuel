import { json } from "@remix-run/node";

export function badRequest<D>(data: D, init?: Omit<ResponseInit, "status">) {
  return json(data, { ...init, status: 400 });
}
