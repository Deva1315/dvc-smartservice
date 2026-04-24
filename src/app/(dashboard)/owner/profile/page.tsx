import { redirect } from "next/navigation";
import OwnerProfilePage from "@/components/UI/dashboard/owner/profile/OwnerProfilePage";
import { getAuthSession } from "@/lib/auth/get-auth-session";
import { mapSessionUserToDashboardUser } from "@/lib/auth/get-dashboard-user";

export default async function Page() {
  const session = await getAuthSession();
  const user = mapSessionUserToDashboardUser(session);

  if (!user || user.roleKey !== "owner") {
    redirect("/login");
  }

  return <OwnerProfilePage user={user} />;
}