import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Home, Dumbbell, Wallet, Apple, BookOpen, Heart, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate({ to: "/login" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate({ to: "/login" }); return; }
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Outlet />
      <BottomNav />
    </div>
  );
}

const NAV = [
  { to: "/home", icon: Home, label: "Hoje" },
  { to: "/treinos", icon: Dumbbell, label: "Treino" },
  { to: "/nutricao", icon: Apple, label: "Dieta" },
  { to: "/financas", icon: Wallet, label: "Finanças" },
  { to: "/fe", icon: Heart, label: "Fé" },
  { to: "/leitura", icon: BookOpen, label: "Leitura" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl overflow-x-auto px-1 py-1.5">
        {NAV.map((it) => {
          const active = loc.pathname === it.to || loc.pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link key={it.to} to={it.to} className={`flex min-w-[3.5rem] flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] transition ${active ? "text-foreground" : "text-muted-foreground"}`}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.6} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
