import { requireAdminPage } from "@/components/AdminGuard";
import { AdminSettingsPage } from "@/components/AdminSettingsPage";

export default async function SettingsAdminPage() {
  await requireAdminPage();

  return <AdminSettingsPage />;
}
