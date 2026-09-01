import type * as React from "react";
import { LayoutDashboard, Store, Palette, Trash2, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
const DIR_ITEMS = [
  { title: "Settings", url: "/settings", icon: Settings },
];
const NAV_ITEMS = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Stores", url: "/stores", icon: Store },
  { title: "Designs", url: "/designs", icon: Palette },
  { title: "Trash", url: "/trash", icon: Trash2 },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="p-4 flex justify-between">
            <div className="items-center justify-center flex group-data-[collapsible=icon]:hidden hover:text-muted-foreground">
              <div className="grid flex-1 text-left text-sm">
                <span className="truncate font-medium">Design Tracker</span>
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