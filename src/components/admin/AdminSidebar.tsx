import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  Package, 
  FileText, 
  Shield, 
  MessageSquare,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminMenuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/user-approvals", label: "User Approvals", icon: UserCheck },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/products", label: "Products", icon: Package },
  { path: "/admin/requests", label: "Requests", icon: FileText },
  { path: "/admin/sub-admins", label: "Sub-Admins", icon: Shield },
  { path: "/admin/messages", label: "Messages", icon: MessageSquare },
];

const subAdminMenuItems = [
  { path: "/sub-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sub-admin/user-approvals", label: "User Approvals", icon: UserCheck },
  { path: "/sub-admin/users", label: "Users", icon: Users },
  { path: "/sub-admin/products", label: "Products", icon: Package },
  { path: "/sub-admin/requests", label: "Requests", icon: FileText },
];

interface AdminSidebarProps {
  onLogout: () => void;
}

export const AdminSidebar = ({ onLogout }: AdminSidebarProps) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get user role from session
  const session = localStorage.getItem("admin_session");
  const sessionData = session ? JSON.parse(session) : null;
  const userRole = sessionData?.role || "admin";

  // Show appropriate menu items based on role
  const menuItems = userRole === "admin" ? adminMenuItems : subAdminMenuItems;

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    onLogout();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-slate-800 border-slate-700 text-white"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-slate-400">BRICSZ</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    "text-slate-300 hover:text-white hover:bg-slate-800",
                    isActive && "bg-gold/10 text-gold border-l-2 border-gold"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

