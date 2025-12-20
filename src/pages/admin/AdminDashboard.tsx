import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Users, Package, BarChart3, Shield } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const session = localStorage.getItem("admin_session");
    if (!session) {
      navigate("/admin");
      return;
    }

    const sessionData = JSON.parse(session);
    if (sessionData.role !== "admin") {
      navigate("/admin");
      return;
    }
  }, [navigate]);

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome to the Admin Panel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <Users className="w-8 h-8 text-gold mb-4" />
            <h3 className="text-xl font-semibold mb-2">Users</h3>
            <p className="text-slate-400 text-sm">Coming soon</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <Package className="w-8 h-8 text-gold mb-4" />
            <h3 className="text-xl font-semibold mb-2">Products</h3>
            <p className="text-slate-400 text-sm">Coming soon</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <BarChart3 className="w-8 h-8 text-gold mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-slate-400 text-sm">Coming soon</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <Shield className="w-8 h-8 text-gold mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sub-Admins</h3>
            <p className="text-slate-400 text-sm">Coming soon</p>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminDashboard;

