"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconBook,
  IconUsers,
  IconFileText,
  IconVideo,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Courses",
      url: "/course",
      icon: IconBook,
    },
    {
      title: "Modules",
      url: "/module",
      icon: IconBook,
    },
    {
      title: "Lectures",
      url: "/lecture",
      icon: IconVideo,
    },
    {
      title: "Posts",
      url: "/posts",
      icon: IconFileText,
    },
    {
      title: "Users",
      url: "/user",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props} className="shadow-sm">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconBook className="!size-5" />
                <span className="text-base font-semibold">LMS Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
