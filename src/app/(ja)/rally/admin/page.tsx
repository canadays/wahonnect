import type { Metadata } from "next";
import { AdminScreen } from "@/rally/AdminScreen";
import { adminLook, adminWords, defaultMissions, rally } from "@/rally/config";

export const metadata: Metadata = { title: "Photo Rally 管理 | WAHONNECT", robots: { index: false, follow: false } };

export default function RallyAdminPage() {
  return <AdminScreen endpoint={rally.adminEndpoint} defaults={defaultMissions} look={adminLook} words={adminWords} />;
}
