import { Bell, ChartColumn, LayoutDashboard, Truck, Users } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Businesses / Shops", icon: Users },
  { to: "/deliveries", label: "Deliveries", icon: Truck },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/reports", label: "Reports", icon: ChartColumn },
];

export function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[270px,1fr]">
        <aside className="border-r border-slate-200 bg-brand-900 px-5 py-6 text-white">
          <Link to="/" className="block text-2xl font-bold">
            Wholesale CRM
          </Link>
          <p className="mt-2 text-sm text-brand-100">Internal delivery, quote, and revisit operations</p>
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isActive ? "bg-white/10" : "text-brand-50 hover:bg-white/5"}`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <main className="px-4 py-5 md:px-8">
          <header className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-sand p-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-700">Operations Hub</p>
              <h1 className="mt-1 text-2xl font-bold text-ink">Wholesale business management</h1>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-panel">
              <p className="text-xs text-slate-500">Logged in as</p>
              <p className="font-semibold">{user?.fullName ?? "Operator"}</p>
              <p className="text-sm text-slate-500">{user?.role ?? "STAFF"}</p>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
