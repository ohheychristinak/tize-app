import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppProvider userId={user.id}>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
