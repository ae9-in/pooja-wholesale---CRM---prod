import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/app-layout";
import { DashboardPage } from "../pages/dashboard-page";
import { CustomersPage } from "../pages/customers-page";
import { CustomerDetailPage } from "../pages/customer-detail-page";
import { CustomerFormPage } from "../pages/customer-form-page";
import { DeliveriesPage } from "../pages/deliveries-page";
import { DeliveryDetailPage } from "../pages/delivery-detail-page";
import { DeliveryFormPage } from "../pages/delivery-form-page";
import { RemindersPage } from "../pages/reminders-page";
import { ReportsPage } from "../pages/reports-page";

export const router = createBrowserRouter([
  { path: "/login", element: <Navigate to="/" replace /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "customers/new", element: <CustomerFormPage mode="create" /> },
      { path: "customers/:id", element: <CustomerDetailPage /> },
      { path: "customers/:id/edit", element: <CustomerFormPage mode="edit" /> },
      { path: "deliveries", element: <DeliveriesPage /> },
      { path: "deliveries/new", element: <DeliveryFormPage mode="create" /> },
      { path: "deliveries/:id", element: <DeliveryDetailPage /> },
      { path: "deliveries/:id/edit", element: <DeliveryFormPage mode="edit" /> },
      { path: "reminders", element: <RemindersPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },
]);
