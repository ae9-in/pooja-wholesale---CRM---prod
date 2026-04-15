import { Badge } from "./ui/badge";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
}: {
  columns: Column<T>[];
  rows: T[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-100">
                {columns.map((column) => {
                  const rawValue = row[column.key as keyof T];
                  return (
                    <td key={String(column.key)} className="px-4 py-3 align-top text-slate-700">
                      {column.render
                        ? column.render(row)
                        : typeof rawValue === "string" &&
                            (rawValue.includes("PENDING") ||
                              rawValue.includes("OVERDUE") ||
                              rawValue.includes("DONE") ||
                              rawValue.includes("QUOTED"))
                          ? <Badge value={rawValue} />
                          : String(rawValue ?? "-")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
