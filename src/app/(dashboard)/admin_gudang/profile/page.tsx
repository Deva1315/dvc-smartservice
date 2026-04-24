import { redirect } from "next/navigation";
import AdminGudangProfilePage from "@/components/UI/dashboard/admin-gudang/profile/AdminGudangProfilePage";
import { getAuthSession } from "@/lib/auth/get-auth-session";
import { mapSessionUserToDashboardUser } from "@/lib/auth/get-dashboard-user";

export default async function Page() {
  const session = await getAuthSession();
  const user = mapSessionUserToDashboardUser(session);

  if (!user || user.roleKey !== "admin_gudang") {
    redirect("/login");
  }

  return <AdminGudangProfilePage user={user} />;
}