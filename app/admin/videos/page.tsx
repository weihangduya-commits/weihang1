import { requireAdminPage } from "@/components/AdminGuard";
import { AdminVideosPage } from "@/components/AdminVideosPage";

export default async function VideosAdminPage() {
  await requireAdminPage();

  return <AdminVideosPage />;
}
