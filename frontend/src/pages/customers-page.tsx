import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, unwrap } from "../services/api";
import type { Customer, User } from "../types";
import { Button } from "../components/ui/button";
import { DataTable } from "../components/data-table";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, SlidersHorizontal, Store } from "lucide-react";
import { cityAreaMap } from "../constants/domain";

export function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [assignedStaffId, setAssignedStaffId] = useState("ALL");
  const [filterZone, setFilterZone] = useState("ALL");
  const [filterArea, setFilterArea] = useState("ALL");
  const [sortMode, setSortMode] = useState("NEWEST");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      unwrap(api.get<{ data: Customer[] }>("/customers", { params: { search } })),
      unwrap(api.get<{ data: User[] }>("/users")),
    ])
      .then(([customerResponse, userResponse]) => {
        setRows(customerResponse.data);
        setStaff(userResponse.data);
        setError("");
      })
      .catch(() => {
        setError("Live backend sync issue: Failed to fetch");
      });
  }, [search]);

  const filteredRows = useMemo(() => {
    const zoneAreas = filterZone !== "ALL" ? (cityAreaMap[filterZone] ?? []) : [];

    const nextRows = rows
      .filter((row) => (status === "ALL" ? true : row.status === status))
      .filter((row) => (assignedStaffId === "ALL" ? true : row.assignedStaff?.id === assignedStaffId))
      .filter((row) => (filterZone === "ALL" ? true : row.city === filterZone))
      .filter((row) => {
        if (filterArea === "ALL") return true;
        return row.area === filterArea;
      });

    if (sortMode === "OLDEST") {
      return [...nextRows].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    if (sortMode === "A_TO_Z") {
      return [...nextRows].sort((a, b) => a.businessName.localeCompare(b.businessName));
    }

    return [...nextRows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [assignedStaffId, filterArea, filterZone, rows, sortMode, status]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 rounded-[2rem] bg-[linear-gradient(135deg,#edf6f1,#f5f7f7)] p-8 shadow-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-700">Main Tracking View</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-ink">Shops and relationship pipeline</h2>
            <p className="mt-3 max-w-3xl text-lg text-slate-500">
              Search, filter, sort, and take quick actions on business and shop accounts from one command center.
            </p>
          </div>
          <Link to="/customers/new">
            <Button className="rounded-2xl px-6 py-4 text-base">Add new shop</Button>
          </Link>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-panel">
          <div className="grid gap-4 xl:grid-cols-[1.5fr,0.8fr,0.8fr,0.7fr,0.7fr,0.7fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input
                className="h-16 rounded-2xl border-slate-200 pl-14 text-lg"
                placeholder="Search shops, phones, areas, products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-500">Status</label>
              <Select className="h-16 rounded-2xl text-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ALL">All statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUOTED">Quoted</option>
                <option value="DELIVERED">Delivered</option>
                <option value="REVISIT_REQUIRED">Revisit required</option>
                <option value="FOLLOW_UP_REQUIRED">Follow-up required</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-500">Zone</label>
              <Select
                className="h-16 rounded-2xl text-lg"
                value={filterZone}
                onChange={(e) => {
                  setFilterZone(e.target.value);
                  setFilterArea("ALL");
                }}
              >
                <option value="ALL">All zones</option>
                {Object.keys(cityAreaMap).map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-500">
                Place
                {filterZone !== "ALL" && cityAreaMap[filterZone] && (
                  <span className="ml-1 font-normal text-slate-400">({cityAreaMap[filterZone].length})</span>
                )}
              </label>
              <Select
                className="h-16 rounded-2xl text-lg"
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                disabled={filterZone === "ALL"}
              >
                <option value="ALL">
                  {filterZone === "ALL" ? "— Pick zone first —" : "All places"}
                </option>
                {filterZone !== "ALL" && cityAreaMap[filterZone]
                  ? cityAreaMap[filterZone].map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))
                  : null}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-500">Assigned staff</label>
              <Select
                className="h-16 rounded-2xl text-lg"
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
              >
                <option value="ALL">All staff</option>
                {staff.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-500">Sort by</label>
              <Select className="h-16 rounded-2xl text-lg" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                <option value="NEWEST">Newest</option>
                <option value="OLDEST">Oldest</option>
                <option value="A_TO_Z">A to Z</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[2rem] border border-amber-300 bg-amber-50 px-6 py-5 text-lg text-amber-700">
          {error}
        </div>
      ) : null}

      <Card className="border border-dashed border-slate-200 p-0">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <Store className="text-brand-700" size={20} />
            <div>
              <h3 className="text-xl font-semibold text-ink">Shop account pipeline</h3>
              <p className="text-sm text-slate-500">Quick-scan cards for relationship stage, location, and direct actions.</p>
            </div>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-b-[2rem] border-t border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <div className="mb-5 rounded-3xl bg-slate-100 p-5 text-slate-500">
              <SlidersHorizontal size={34} />
            </div>
            <h4 className="text-3xl font-semibold text-ink">No shops match these filters</h4>
            <p className="mt-3 max-w-xl text-lg text-slate-500">
              Try widening the search or reset one of the filter controls to bring shops back into view.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-6 md:grid-cols-2 2xl:grid-cols-3">
            {filteredRows.map((row) => (
              <div key={row.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-panel">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-ink">{row.businessName}</p>
                    <p className="mt-1 text-sm text-slate-500">{row.ownerName}</p>
                  </div>
                  <Badge value={row.status} />
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>{row.phoneNumber1}</p>
                  <p>{row.area}, {row.city}</p>
                  <p>{row.businessType}</p>
                  <p>Assigned: {row.assignedStaff?.fullName ?? "Unassigned"}</p>
                </div>
                <div className="mt-5 flex gap-3">
                  <Link to={`/customers/${row.id}`}>
                    <Button>View details</Button>
                  </Link>
                  <Link to={`/customers/${row.id}/edit`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-ink">Full shop register</h3>
            <p className="text-sm text-slate-500">Detailed list view with direct access to every business and shop record.</p>
          </div>
        </div>
        <DataTable
          rows={filteredRows}
          columns={[
            { key: "businessName", label: "Business / Shop" },
            { key: "ownerName", label: "Owner" },
            { key: "city", label: "City" },
            { key: "status", label: "Status" },
            {
              key: "assignedStaff",
              label: "Assigned Staff",
              render: (row) => row.assignedStaff?.fullName ?? "Unassigned",
            },
            {
              key: "id",
              label: "Open",
              render: (row) => (
                <Link className="font-medium text-brand-700" to={`/customers/${row.id}`}>
                  View details
                </Link>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
