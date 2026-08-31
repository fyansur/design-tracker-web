import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {/* placeholder statis dulu — nanti diganti dinamis per halaman */}
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 gap-4 p-4">
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
          <aside className="hidden w-72 shrink-0 border-l pl-4 lg:block">
            <p className="text-sm text-muted-foreground">Progress aside (coming soon)</p>
          </aside>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}