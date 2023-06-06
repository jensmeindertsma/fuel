import { generateCode } from "./authentication.server.ts";
import { describe, expect, it } from "vitest";

describe("generateCode", () => {
  it("always generates six digit code", () => {
    let codes = Array.from(Array(10000)).map(() => generateCode());

    expect(codes.every((code) => code.length === 6)).toBeTruthy();
  });
});
