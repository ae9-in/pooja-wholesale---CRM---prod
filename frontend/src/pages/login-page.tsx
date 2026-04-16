import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#d7e6de,_#f8fafc_55%)] p-6">
      <Card className="w-full max-w-md space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Internal Operations</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Authentication Removed</h1>
          <p className="mt-2 text-sm text-slate-500">
            This build now opens directly into the operations dashboard without JWT login.
          </p>
        </div>
        <Button className="w-full" onClick={() => navigate("/")}>
          Open Dashboard
        </Button>
      </Card>
    </div>
  );
}
