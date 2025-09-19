import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
