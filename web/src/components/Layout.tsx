import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LogOut, FileText, Users } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { Chatbot } from './Chatbot';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  SidebarTrigger,
} from './ui/sidebar';

export function Layout() {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="w-6 h-6 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">AI Invoice</span>
              </h1>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={location.pathname === '/'}>
                      <Link to="/" className="flex items-center gap-2 w-full">
                        <FileText className="w-5 h-5" />
                        <span>Invoices</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={location.pathname === '/clients'}>
                      <Link to="/clients" className="flex items-center gap-2 w-full">
                        <Users className="w-5 h-5" />
                        <span>Clients</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t gap-2 flex flex-col">
            <div className="flex items-center justify-between px-2 w-full group-data-[collapsible=icon]:justify-center">
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Theme</span>
              <ModeToggle />
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <div className="h-14 border-b flex items-center px-4 gap-4 shrink-0">
            <SidebarTrigger />
            <h2 className="font-semibold text-lg">AI Invoice Generator</h2>
          </div>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Chatbot />
    </SidebarProvider>
  );
}
