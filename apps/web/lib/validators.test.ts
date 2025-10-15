import { describe, expect, it } from "vitest";
import { uploadSchema } from "./validators";

function fakeFile(name: string, type: string, size: number) {
  return { name, type, size } as unknown as File;
}

describe("uploadSchema", () => {
  it("aceita PNG < 10MB", () => {
    const file = fakeFile("arte.png", "image/png", 2 * 1024 * 1024);
    expect(() => uploadSchema.parse(file)).not.toThrow();
  });

  it("rejeita > 10MB", () => {
    const file = fakeFile("grande.png", "image/png", 12 * 1024 * 1024);
    expect(() => uploadSchema.parse(file)).toThrow();
  });

  it("rejeita tipo inválido", () => {
    const file = fakeFile("arte.jpg", "image/jpeg", 1024);
    expect(() => uploadSchema.parse(file)).toThrow();
  });
});
