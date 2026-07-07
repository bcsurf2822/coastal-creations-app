import { describe, expect, it } from "vitest";
import {
  formatUsPhone,
  isValidUsPhone,
} from "@/components/checkout/ContactForm";

describe("formatUsPhone", () => {
  it("formats a plain 10-digit number", () => {
    expect(formatUsPhone("5093207586")).toBe("(509) 320-7586");
  });

  it("drops the E.164 +1 country code from autofilled numbers", () => {
    expect(formatUsPhone("+15093207586")).toBe("(509) 320-7586");
    expect(formatUsPhone("+1 (509) 320-7586")).toBe("(509) 320-7586");
    expect(formatUsPhone("1-509-320-7586")).toBe("(509) 320-7586");
  });

  it("formats partial input as the user types", () => {
    expect(formatUsPhone("")).toBe("");
    expect(formatUsPhone("509")).toBe("(509");
    expect(formatUsPhone("509320")).toBe("(509) 320");
    expect(formatUsPhone("5093207")).toBe("(509) 320-7");
  });

  it("caps input at 10 digits", () => {
    expect(formatUsPhone("50932075869999")).toBe("(509) 320-7586");
  });
});

describe("isValidUsPhone", () => {
  it("accepts a formatted 10-digit number", () => {
    expect(isValidUsPhone("(509) 320-7586")).toBe(true);
  });

  it("accepts an E.164 +1 number", () => {
    expect(isValidUsPhone("+15093207586")).toBe(true);
  });

  it("rejects too-short and too-long numbers", () => {
    expect(isValidUsPhone("509320758")).toBe(false);
    expect(isValidUsPhone("+2509320758611")).toBe(false);
  });
});
