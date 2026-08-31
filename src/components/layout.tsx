import { Outlet, useLocation, Link } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useBreadcrumb } from "../context/BreadcrumbContext";
import { ModeToggle } from "./mode-toggle";
import { Separator } from "@/components/ui/separator";
import { ProgressAside } from "./progress-aside";
import { NavUser } from "@/components/nav-user";
import { GlobeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Spinner } from "./ui/spinner";
import api from "@/lib/api";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/stores": "Stores",
  "/designs": "Designs",
  "/trash": "Trash",
  "/goals": "Goals",
  "/settings": "Settings",
};

export default function Layout() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const { items: dynamicItems } = useBreadcrumb();
  const isDashboard = location.pathname === "/";

  if (!user) return null;

  const breadcrumbItems = dynamicItems ?? [
    { label: PAGE_TITLES[location.pathname] ?? <Spinner /> },
  ];

  async function handleToggleOnline(checked: boolean) {
    await api.put("/auth/status", { isOnline: checked });
    await refreshUser();
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 w-full shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 border-b">
          <div className="flex items-center px-4 w-full justify-between">
            <div className="flex items-center">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, i) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink render={<Link to={item.href} />}>
                            {item.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {i < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2">
              <NavUser />
              <Separator orientation="vertical" />
              <ModeToggle />
              <Separator orientation="vertical" />
              <div className="flex items-center justify-between px-1.5 py-1.5 text-sm">
                <Switch
                  id="online-toggle"
                  checked={user.isOnline}
                  onCheckedChange={handleToggleOnline}
                />
              </div>
            </div>

          </div>

        </header>
        <div className="flex flex-1 flex-row pt-0">
          <main className="flex-1 min-w-0 p-4">
            <Outlet />
          </main>
          {!isDashboard &&
            <aside className="hidden w-1/4 shrink-0 border-l pl-4 lg:block">
              <ProgressAside />
            </aside>
          }
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}