import { describe, expect, it } from "vitest";
import { isAllowedBillMimeType } from "../src/modules/uploads/upload.service.js";

describe("bill upload validation", () => {
  it("allows pdf and image mime types", () => {
    expect(isAllowedBillMimeType("application/pdf")).toBe(true);
    expect(isAllowedBillMimeType("image/png")).toBe(true);
  });

  it("rejects dangerous mime types", () => {
    expect(isAllowedBillMimeType("application/x-msdownload")).toBe(false);
  });
});
