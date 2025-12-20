import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Shield, MapPin, Trash2, Loader2 } from "lucide-react";

interface SubAdmin {
  id: string;
  username: string;
  email: string;
  full_name: string;
  assigned_countries: string[];
  is_active: boolean;
  created_at: string;
  created_by: string;
}

const SubAdmins = () => {
  const navigate = useNavigate();
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    const session = localStorage.getItem("admin_session");
    if (!session) {
      navigate("/admin");
      return;
    }

    const sessionData = JSON.parse(session);
    if (sessionData.role !== "admin") {
      toast.error("Only admins can view Sub-Admins");
      navigate("/admin/dashboard");
      return;
    }

    fetchSubAdmins();
  }, [navigate]);

  const fetchSubAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("sub_admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching Sub-Admins:", error);
        toast.error("Failed to load Sub-Admins");
        return;
      }

      setSubAdmins(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load Sub-Admins");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubAdmin = async (subAdminId: string, subAdminName: string) => {
    if (!confirm(`Are you sure you want to delete Sub-Admin "${subAdminName}"? This will immediately block them from logging in.`)) {
      return;
    }

    try {
      // Soft delete: Set is_active to false
      const { error } = await supabase
        .from("sub_admin_users")
        .update({ is_active: false })
        .eq("id", subAdminId);

      if (error) throw error;

      toast.success("Sub-Admin deleted successfully");
      fetchSubAdmins();
    } catch (error: any) {
      console.error("Error deleting Sub-Admin:", error);
      toast.error(error.message || "Failed to delete Sub-Admin");
    }
  };

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sub-Admins</h1>
            <p className="text-slate-400">Manage Sub-Admin accounts and permissions</p>
          </div>
          <Link to="/admin/sub-admins/create">
            <Button variant="gold">
              <Plus className="w-4 h-4 mr-2" />
              Create Sub-Admin
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : subAdmins.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-300">No Sub-Admins</h3>
            <p className="text-slate-400 mb-6">Create your first Sub-Admin to get started</p>
            <Link to="/admin/sub-admins/create">
              <Button variant="gold">
                <Plus className="w-4 h-4 mr-2" />
                Create Sub-Admin
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Countries</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {subAdmins.map((subAdmin) => (
                    <tr key={subAdmin.id} className="hover:bg-slate-900/50">
                      <td className="px-6 py-4 text-sm text-white">{subAdmin.full_name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{subAdmin.username}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{subAdmin.email || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {subAdmin.assigned_countries && subAdmin.assigned_countries.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <span>{subAdmin.assigned_countries.length} countries</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">No countries</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subAdmin.is_active
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {subAdmin.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(subAdmin.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {subAdmin.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubAdmin(subAdmin.id, subAdmin.full_name || subAdmin.username)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
};

export default SubAdmins;

