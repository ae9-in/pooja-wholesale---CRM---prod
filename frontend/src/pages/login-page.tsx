import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { authStore } from "../store/auth-store";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "superadmin@wholesale.local",
      password: "Password123!",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await api.post("/auth/login", values);
    authStore.getState().setAuth(response.data.token, response.data.user);
    navigate("/");
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#d7e6de,_#f8fafc_55%)] p-6">
      <Card className="w-full max-w-md space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Internal Operations</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Wholesale CRM Login</h1>
          <p className="mt-2 text-sm text-slate-500">Secure access for admins and staff teams.</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input {...register("email")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <Input type="password" {...register("password")} />
          </div>
          <Button className="w-full">Sign In</Button>
        </form>
      </Card>
    </div>
  );
}
