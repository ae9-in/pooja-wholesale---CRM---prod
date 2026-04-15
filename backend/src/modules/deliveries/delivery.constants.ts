import { ProductType, ProductGroup } from "@prisma/client";

export const productPackagingPresets = {
  [ProductGroup.DHOOP]: {
    products: [],
    packaging: ["100gm"],
  },
  [ProductGroup.RAW_AGARBATTI]: {
    products: [
      ProductType.ROSE,
      ProductType.SANDALWOOD,
      ProductType.LAVENDER,
      ProductType.THREE_IN_ONE,
      ProductType.STANDARD,
    ],
    packaging: ["1kg", "1/2kg", "250gm", "100gm"],
  },
  [ProductGroup.CAMPHOR]: {
    products: [],
    packaging: ["1kg", "1/2kg", "250gm", "100gm", "50gm", "20rs", "10rs"],
  },
  [ProductGroup.COTTON_WICKS]: {
    products: [],
    packaging: ["10rs"],
  },
  [ProductGroup.HARSHNA_KUNKUM]: {
    products: [],
    packaging: ["10rs"],
  },
  [ProductGroup.OIL]: {
    products: [],
    packaging: ["1lt", "500ml"],
  },
} as const;
