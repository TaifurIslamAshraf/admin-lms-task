import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React from "react";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <SidebarProvider style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
          
        } as React.CSSProperties
      }>
        <AppSidebar variant="inset" />
        <main>
          {children}
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Layout;
