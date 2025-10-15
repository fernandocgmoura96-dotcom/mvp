import { describe, expect, it, beforeEach } from "vitest";
import { act } from "react-dom/test-utils";
import { useDesignStore } from "./store";

describe("useDesignStore", () => {
  beforeEach(() => {
    useDesignStore.getState().actions.reset();
  });

  it("atualiza passo e produto", () => {
    const { actions } = useDesignStore.getState();
    act(() => actions.setStep(3));
    expect(useDesignStore.getState().step).toBe(3);
    act(() => actions.setProduct("longline", "#000000"));
    expect(useDesignStore.getState().shirtType).toBe("longline");
    expect(useDesignStore.getState().colorHex).toBe("#000000");
  });

  it("limita variações entre 1 e 4", () => {
    const { actions } = useDesignStore.getState();
    act(() => actions.setVariations(10));
    expect(useDesignStore.getState().variations).toBe(4);
    act(() => actions.setVariations(0));
    expect(useDesignStore.getState().variations).toBe(1);
  });
});
