import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex container mx-auto">
      <Sidebar />
      <div className="flex-grow p-10">
        {children}
      </div>
    </div>
  );
}
