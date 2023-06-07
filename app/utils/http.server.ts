import { json } from "@remix-run/node";

type Init = Omit<ResponseInit, "status">;

export function badRequest<D>(data: D, init?: Init) {
  return json(data, { ...init, status: 400 });
}

export function notFound<D>(data: D, init?: Init) {
  return json(data, { ...init, status: 404 });
}
