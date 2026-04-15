import { useEffect, useState } from "react";
import { api, unwrap } from "../services/api";
import type { User } from "../types";
import { DataTable } from "../components/data-table";
import { Card } from "../components/ui/card";

export function UsersPage() {
  const [rows, setRows] = useState<User[]>([]);

  useEffect(() => {
    unwrap(api.get<{ data: User[] }>("/users")).then((result) => setRows(result.data));
  }, []);

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">User management</h2>
      <DataTable
        rows={rows}
        columns={[
          { key: "fullName", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "isActive", label: "Active" },
        ]}
      />
    </Card>
  );
}
