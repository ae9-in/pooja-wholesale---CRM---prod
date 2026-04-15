import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, unwrap } from "../services/api";
import type { Delivery } from "../types";
import { Button } from "../components/ui/button";
import { DataTable } from "../components/data-table";

export function DeliveriesPage() {
  const [rows, setRows] = useState<Delivery[]>([]);

  useEffect(() => {
    unwrap(api.get<{ data: Delivery[] }>("/deliveries")).then((result) => setRows(result.data));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/deliveries/new"><Button>Add Delivery</Button></Link>
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: "id", label: "Delivery ID" },
          { key: "deliveryStatus", label: "Status" },
          { key: "totalQuotedValue", label: "Value" },
          { key: "quotedDeliveryDate", label: "Quoted Delivery Date", render: (row) => new Date(row.quotedDeliveryDate).toLocaleDateString() },
          { key: "open", label: "Open", render: (row) => <Link className="text-brand-700" to={`/deliveries/${row.id}`}>View</Link> },
        ]}
      />
    </div>
  );
}
