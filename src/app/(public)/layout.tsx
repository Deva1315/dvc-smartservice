import type { ReactNode } from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <PublicNavbar />
      <main>{children}</main>
    </div>
  );
}