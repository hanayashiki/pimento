import { ClientLayout } from "./ClientLayout";
import { requireUser } from "@/app/_actions";
import { MeProvider } from "@/lib/client/MeProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireUser();

  return (
    <MeProvider value={{ me }}>
      <ClientLayout>{children}</ClientLayout>
    </MeProvider>
  );
}

export const runtime = "edge";

export const preferredRegion = ["sin1"];
