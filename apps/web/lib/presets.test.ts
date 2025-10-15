import { describe, expect, it } from "vitest";
import { listPresets, modelLabel } from "./presets";

describe("presets", () => {
  it("lista os modelos simulados", () => {
    const ids = listPresets().map((preset) => preset.id);
    expect(ids).toContain("gemini15flash_sim");
    expect(ids).toContain("sdxl_sim");
  });

  it("resolve labels amigáveis", () => {
    expect(modelLabel("gemini15flash_sim")).toContain("gemini");
  });
});
