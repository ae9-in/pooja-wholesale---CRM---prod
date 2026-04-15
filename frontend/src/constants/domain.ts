export const customerStatuses = [
  "NEW",
  "CONTACTED",
  "QUOTED",
  "DELIVERY_PENDING",
  "DELIVERED",
  "REVISIT_REQUIRED",
  "FOLLOW_UP_REQUIRED",
  "INACTIVE",
] as const;

export const deliveryStatuses = [
  "QUOTED",
  "CONFIRMED",
  "DISPATCHED",
  "DELIVERED",
  "NOT_DELIVERED",
  "CANCELLED",
  "REVISIT_DUE",
  "OVERDUE",
] as const;

export const reminderStatuses = ["PENDING", "UPCOMING", "DONE", "OVERDUE", "SNOOZED", "CANCELLED"] as const;

export const productGroups = ["DHOOP", "RAW_AGARBATTI", "CAMPHOR", "COTTON_WICKS", "HARSHNA_KUNKUM", "OIL"] as const;

export const productGroupLabels: Record<string, string> = {
  DHOOP: "Dhoop",
  RAW_AGARBATTI: "Raw Agarbatti",
  CAMPHOR: "Camphor",
  COTTON_WICKS: "Cotton Wicks",
  HARSHNA_KUNKUM: "Harshna & Kunkum",
  OIL: "Oil",
};

export const productTypes = ["ROSE", "SANDALWOOD", "LAVENDER", "THREE_IN_ONE", "STANDARD"] as const;

export const packagingPresets = {
  DHOOP: {
    packaging: ["100gm"],
    products: [],
  },
  RAW_AGARBATTI: {
    packaging: ["1kg", "1/2kg", "250gm", "100gm"],
    products: ["ROSE", "SANDALWOOD", "LAVENDER", "THREE_IN_ONE", "STANDARD"],
  },
  CAMPHOR: {
    packaging: ["1kg", "1/2kg", "250gm", "100gm", "50gm", "20rs", "10rs"],
    products: [],
  },
  COTTON_WICKS: {
    packaging: ["10rs"],
    products: [],
  },
  HARSHNA_KUNKUM: {
    packaging: ["10rs"],
    products: [],
  },
  OIL: {
    packaging: ["1lt", "500ml"],
    products: [],
  },
} as const;

// Zone → Places mapping (75 total places across 9 zones)
// Exact names as given by the user
export const cityAreaMap: Record<string, string[]> = {
  "Bangalore South": [
    "Banashankari",
    "Jayanagar",
    "Jp nagar",
    "BTM layout",
    "Uttarahalli,Padmanabanagar",
    "Bommanahalli",
    "Koramangala",
    "RR nagar",
    "Basavanagudi",
  ],
  "Bangalore North": [
    "Yelahanka",
    "Vidyaranyapura",
    "Sahakarnagar",
    "Hebbal",
    "RT Nagar",
    "Thanisandra",
    "Kodigehalli ,Jakkur",
    "Sanjaynagar &RMV extenstion",
    "Mathikere",
  ],
  "Bangalore Central": [
    "Ashoknagar",
    "Malleshwaram",
    "Church street, Mg road , Brigade road",
    "Sadashivnagar",
    "Ulsoor",
    "Bel Circle",
    "Shivajinagar, Commercial street",
    "Vasanth nagar & Guttahalli",
    "Rajajinagar+Sheshadripuram",
  ],
  "Bangalore East": [
    "Whitefield",
    "Marathahalli",
    "Indiranagar",
    "HSR layout",
    "KR Puram",
    "Cv Raman Nagar",
    "Mahadevpura",
    "Bellandur",
    "Sarjapur",
  ],
  "Bangalore West": [
    "Jalahalli",
    "Yashwanthpur",
    "Vijayanagar",
    "Kengeri",
    "Nagarbhavi",
    "Peenya",
    "Vijayanagar (West)",
    "Basaveshwaranagar",
    "Nayandahalli,Hanumanthnagar",
  ],
  "Bangalore Rural": [
    "Devanahalli",
    "Dodaballapura",
    "Hoskote",
    "Airport Road Bangalore",
    "Tumkur Road",
    "Vijayapura",
    "Nelamangala",
    "Magadi",
    "Hesarghatta",
  ],
  "Mysore Road": [
    "Bidadi",
    "Ramnagar",
    "Kanakpura",
    "Channapatna",
    "Maddur",
    "Mandya",
    "Srirangapatna",
    "Other side of Mysore",
  ],
  "Hosur": [
    "Bagalur Road",
    "Mathigiri",
    "Dankanikottai Road",
    "Anthivadi Hosur",
  ],
  "Mysore": [
    "Vijayanagar",
    "Gokulam",
    "Kuvempunagar",
    "Jayanagar",
    "Bannimantap,Palace road",
    "Yadavgiri",
    "Brindavan Extension",
    "Siddhartha Nagar",
    "Chamundipuram",
  ],
};
