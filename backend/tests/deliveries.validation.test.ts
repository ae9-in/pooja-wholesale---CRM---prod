import { describe, expect, it } from "vitest";
import { deliveryItemSchema } from "../src/modules/deliveries/deliveries.validation.js";

describe("delivery item validation", () => {
  it("accepts a raw agarbatti item with product type", () => {
    const result = deliveryItemSchema.safeParse({
      productGroup: "RAW_AGARBATTI",
      productType: "ROSE",
      quantity: 10,
      packingSize: "100gm",
      packingQuantity: 1,
      quotedPrice: 12,
    });

    expect(result.success).toBe(true);
  });

  it("accepts dhoop without product type", () => {
    const result = deliveryItemSchema.safeParse({
      productGroup: "DHOOP",
      quantity: 10,
      packingSize: "100gm",
      packingQuantity: 1,
      quotedPrice: 12,
    });

    expect(result.success).toBe(true);
  });

  it("accepts oil without product type", () => {
    const result = deliveryItemSchema.safeParse({
      productGroup: "OIL",
      quantity: 5,
      packingSize: "1lt",
      packingQuantity: 1,
      quotedPrice: 50,
    });

    expect(result.success).toBe(true);
  });

  it("accepts camphor without product type", () => {
    const result = deliveryItemSchema.safeParse({
      productGroup: "CAMPHOR",
      quantity: 20,
      packingSize: "50gm",
      packingQuantity: 1,
      quotedPrice: 15,
    });

    expect(result.success).toBe(true);
  });
});
