import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Shield, Users, Package, MapPin } from "lucide-react";

const SubAdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if sub-admin is logged in
    const session = localStorage.getItem("admin_session");
    if (!session) {
      navigate("/admin");
      return;
    }

    const sessionData = JSON.parse(session);
    if (sessionData.role !== "sub-admin") {
      navigate("/admin");
      return;
    }
  }, [navigate]);

  const session = localStorage.getItem("admin_session");
  const sessionData = session ? JSON.parse(session) : null;

  return (
    <AdminRoute requiredRole="sub-admin">
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, Sub-Admin</h1>
          <p className="text-slate-400">This is a placeholder dashboard. Content will be added in future phases.</p>
        </div>

        {/* Assigned Countries Info */}
        {sessionData?.assigned_countries && sessionData.assigned_countries.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Assigned Countries</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {sessionData.assigned_countries.map((country: string) => (
                <span
                  key={country}
                  className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Users</h3>
            <p className="text-slate-400 text-sm">Coming soon</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <Package className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Products</h3>
            <p className="text-slate-400 text-sm">Coming soon</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <Shield className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Requests</h3>
            <p className="text-slate-400 text-sm">Coming soon</p>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default SubAdminDashboard;
