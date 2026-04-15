export type Role = "SUPER_ADMIN" | "ADMIN" | "STAFF";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  phone?: string | null;
  isActive?: boolean;
};

export type Customer = {
  id: string;
  businessName: string;
  ownerName: string;
  phoneNumber1: string;
  phoneNumber2?: string | null;
  email?: string | null;
  area: string;
  city: string;
  state: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string | null;
  businessType: string;
  status: string;
  priority: string;
  description?: string | null;
  source?: string | null;
  assignedStaff?: { id: string; fullName: string } | null;
  createdAt: string;
};

export type DeliveryItem = {
  id?: string;
  productGroup: "POOJA";
  productType?: "SANDALWOOD" | "ROSE" | "LAVENDER" | "THREE_IN_ONE" | null;
  quantity: number;
  packingSize: string;
  packingQuantity: number;
  quotedPrice: number;
  subtotal?: number;
  notes?: string;
};

export type Delivery = {
  id: string;
  customerId: string;
  quoteDate: string;
  quotedDeliveryDate: string;
  deliveryStatus: string;
  notes?: string | null;
  totalQuotedValue: number;
  billFileUrl?: string | null;
  customer?: Customer;
  items: DeliveryItem[];
  reminders?: Reminder[];
};

export type Reminder = {
  id: string;
  customerId: string;
  deliveryId?: string | null;
  reminderType: string;
  reminderDate: string;
  status: string;
  title: string;
  description?: string | null;
  completionNote?: string | null;
  assignedStaff?: { id: string; fullName: string } | null;
  customer?: Customer;
};

export type DashboardSummary = {
  metrics: Record<string, number>;
  recentCustomers: Customer[];
  recentDeliveryActivity: {
    id: string;
    message: string;
    createdAt: string;
  }[];
  statusBreakdown: Array<{ status: string; _count: { status: number } }>;
  monthlyTrend: Array<{ month: string; deliveries: number; revisitsDone: number }>;
};
