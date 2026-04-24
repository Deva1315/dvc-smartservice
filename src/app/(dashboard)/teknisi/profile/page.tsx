import { redirect } from "next/navigation";
import TeknisiProfilePage from "@/components/UI/dashboard/teknisi/profile/TeknisiProfilePage";
import { getAuthSession } from "@/lib/auth/get-auth-session";
import { mapSessionUserToDashboardUser } from "@/lib/auth/get-dashboard-user";

export default async function Page() {
  const session = await getAuthSession();
  const user = mapSessionUserToDashboardUser(session);

  if (!user || user.roleKey !== "teknisi") {
    redirect("/login");
  }

  return <TeknisiProfilePage user={user} />;
}