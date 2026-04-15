import { Card } from "../components/ui/card";

export function SettingsPage() {
  return (
    <Card>
      <h2 className="text-xl font-semibold">Settings</h2>
      <p className="mt-2 text-sm text-slate-500">
        Configure environment settings, role policies, upload storage migration, and future notification channels here.
      </p>
    </Card>
  );
}
