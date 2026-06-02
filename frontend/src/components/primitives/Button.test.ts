import type { ButtonVariant, ButtonSize } from "./Button";
import { buttonSpring, buttonVariants } from "../../lib/motion";

describe("buttonSpring", () => {
  it("is a spring transition", () => {
    expect(buttonSpring.type).toBe("spring");
  });

  it("has stiffness and damping set", () => {
    expect(typeof buttonSpring.stiffness).toBe("number");
    expect((buttonSpring.stiffness as number) > 0).toBe(true);
    expect(typeof buttonSpring.damping).toBe("number");
    expect((buttonSpring.damping as number) > 0).toBe(true);
  });

  it("is snappier than cardSpring (higher stiffness)", async () => {
    const { cardSpring } = await import("../../lib/motion");
    expect(buttonSpring.stiffness as number).toBeGreaterThan(
      cardSpring.stiffness as number
    );
  });
});

describe("buttonVariants", () => {
  it("defines rest, hover, and tap states", () => {
    expect(buttonVariants.rest).toBeDefined();
    expect(buttonVariants.hover).toBeDefined();
    expect(buttonVariants.tap).toBeDefined();
  });

  it("tap scale is less than rest scale for tactile press feel", () => {
    const restScale = (buttonVariants.rest as { scale: number }).scale;
    const tapScale = (
      buttonVariants.tap as { scale: number; transition?: unknown }
    ).scale;
    expect(tapScale).toBeLessThan(restScale);
  });

  it("hover scale is greater than rest scale", () => {
    const restScale = (buttonVariants.rest as { scale: number }).scale;
    const hoverScale = (
      buttonVariants.hover as { scale: number; transition?: unknown }
    ).scale;
    expect(hoverScale).toBeGreaterThan(restScale);
  });
});

describe("ButtonVariant type coverage", () => {
  const validVariants: ButtonVariant[] = [
    "primary",
    "secondary",
    "ghost",
    "danger",
  ];

  it("includes all four variants", () => {
    expect(validVariants).toHaveLength(4);
  });

  it("includes the ghost variant", () => {
    expect(validVariants).toContain("ghost");
  });

  it("includes the danger variant", () => {
    expect(validVariants).toContain("danger");
  });
});

describe("ButtonSize type coverage", () => {
  const validSizes: ButtonSize[] = ["sm", "md", "lg"];

  it("includes all three sizes", () => {
    expect(validSizes).toHaveLength(3);
  });
});
