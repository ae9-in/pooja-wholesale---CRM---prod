import { describe, expect, it } from "vitest";
import {
  calculateDeliveryTotal,
  calculateItemSubtotal,
} from "../src/modules/deliveries/deliveries.service.js";

describe("delivery calculations", () => {
  it("calculates item subtotal", () => {
    expect(
      calculateItemSubtotal({
        productGroup: "RAW_AGARBATTI",
        productType: "ROSE",
        quantity: 10,
        packingSize: "1kg",
        packingQuantity: 1,
        quotedPrice: 20,
      }),
    ).toBe(200);
  });

  it("sums the quoted value across multiple items", () => {
    expect(
      calculateDeliveryTotal([
        {
          productGroup: "RAW_AGARBATTI",
          productType: "ROSE",
          quantity: 10,
          packingSize: "1kg",
          packingQuantity: 1,
          quotedPrice: 20,
        },
        {
          productGroup: "RAW_AGARBATTI",
          productType: "SANDALWOOD",
          quantity: 5,
          packingSize: "100gm",
          packingQuantity: 1,
          quotedPrice: 15,
        },
      ]),
    ).toBe(275);
  });
});
