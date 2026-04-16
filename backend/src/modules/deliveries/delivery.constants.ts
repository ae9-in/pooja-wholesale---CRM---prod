type ProductGroupValue = "DHOOP" | "RAW_AGARBATTI" | "CAMPHOR" | "COTTON_WICKS" | "HARSHNA_KUNKUM" | "OIL";
type ProductTypeValue = "ROSE" | "SANDALWOOD" | "LAVENDER" | "THREE_IN_ONE" | "STANDARD";

const ProductGroup = {
  DHOOP: "DHOOP",
  RAW_AGARBATTI: "RAW_AGARBATTI",
  CAMPHOR: "CAMPHOR",
  COTTON_WICKS: "COTTON_WICKS",
  HARSHNA_KUNKUM: "HARSHNA_KUNKUM",
  OIL: "OIL",
} as const satisfies Record<string, ProductGroupValue>;

const ProductType = {
  ROSE: "ROSE",
  SANDALWOOD: "SANDALWOOD",
  LAVENDER: "LAVENDER",
  THREE_IN_ONE: "THREE_IN_ONE",
  STANDARD: "STANDARD",
} as const satisfies Record<string, ProductTypeValue>;

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
