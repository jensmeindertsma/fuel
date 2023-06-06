import { randomInt } from "node:crypto";

export function generateCode() {
  return randomInt(10 ** 6)
    .toString()
    .padStart(6, "0");
}
