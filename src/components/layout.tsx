import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ProgressAside } from "./progress-aside";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/stores": "Stores",
  "/designs": "Designs",
  "/trash": "Trash",
  "/goals": "Goals"
};

export default function Layout() {
  const location = useLocation();
  const pageTitle = location.pathname.startsWith("/stores/")
    ? "Store Detail"
    : PAGE_TITLES[location.pathname] ?? "Design Tracker";
  const isDashboard = location.pathname === "/";
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
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 gap-4 p-4">
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
          <aside className="hidden w-72 shrink-0 border-l pl-4 lg:block">
            {!isDashboard && <ProgressAside />}
          </aside>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}