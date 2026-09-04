import type * as React from "react";
import { LayoutDashboard, Store, Palette, Trash2, Settings } from "lucide-react";
import { BarChart3 } from "lucide-react";
import AppLogo from "@/assets/logo.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
const DIR_ITEMS = [
  { title: "Trash", url: "/trash", icon: Trash2 },
  { title: "Settings", url: "/settings", icon: Settings },
];
const NAV_ITEMS = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Stores", url: "/stores", icon: Store },
  { title: "Designs", url: "/designs", icon: Palette },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="p-4 flex justify-between">
            <div className="items-center justify-center flex group-data-[collapsible=icon]:hidden hover:text-muted-foreground">
              <div className="items-center flex flex-1 text-left text-sm">
                <img src={AppLogo} alt="MerchFlow" className="h-6 w-6 mr-2" />
                <span className="truncate font-medium">MerchFlow</span>
              </div>
            </div>
              <SidebarTrigger className="duration-200 transition-all"/>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAV_ITEMS} label={null}/>
        <NavMain items={DIR_ITEMS} label="Directory" />
      </SidebarContent>
    </Sidebar>
  );
}