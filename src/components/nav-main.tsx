import { useLocation, Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  label,
}: {
  items: { title: string; url: string; icon: LucideIcon }[];
  label: string | null ;
}) {
  const location = useLocation();

  return (
    <SidebarGroup>
      {label !== null && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={location.pathname === item.url}
              render={<Link to={item.url} />}
            >
              <item.icon className="text-muted-foreground group-data-[collapsible=icon]:text-foreground"/>
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}