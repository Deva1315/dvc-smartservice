import { redirect } from "next/navigation";
import AdminPenjualanProfilePage from "@/components/UI/dashboard/admin-penjualan/profile/AdminPenjualanProfilePage";
import { getAuthSession } from "@/lib/auth/get-auth-session";
import { mapSessionUserToDashboardUser } from "@/lib/auth/get-dashboard-user";

export default async function Page() {
  const session = await getAuthSession();
  const user = mapSessionUserToDashboardUser(session);

  if (!user || user.roleKey !== "admin_penjualan") {
    redirect("/login");
  }

  return <AdminPenjualanProfilePage user={user} />;
}