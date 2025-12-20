import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Loader2, Users, MapPin } from "lucide-react";
import { format } from "date-fns";
import { getAllCountryVariants } from "@/utils/countryMapping";

interface User {
  user_id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  country: string | null;
  approval_status: string;
  created_at: string;
}

const SubAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedCountries, setAssignedCountries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Get Sub-Admin assigned countries on mount
  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const countries = sessionData.assigned_countries || [];
        console.log("Sub-Admin assigned countries:", countries);
        setAssignedCountries(countries);
      } catch (error) {
        console.error("Error parsing session:", error);
      }
    } else {
      console.warn("No admin session found");
    }
  }, []); // Only run once on mount

  // Fetch users when assigned countries are set
  useEffect(() => {
    if (assignedCountries.length > 0) {
      fetchUsers();
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [assignedCountries]); // Re-fetch when countries change

  const fetchUsers = async () => {
    if (assignedCountries.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get all country variants (both names and codes) for filtering
      const countryVariants = getAllCountryVariants(assignedCountries);
      console.log("Fetching users for countries:", assignedCountries, "Variants:", countryVariants);
      
      // CRITICAL: Filter by assigned countries AND approved status
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("approval_status", "approved") // Only show approved users
        .in("country", countryVariants) // Filter by all country variants (both names and codes)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} approved users from assigned countries`);
      console.log("Sample users:", data?.slice(0, 3).map(u => ({ name: u.full_name, country: u.country })));
      setUsers((data || []) as User[]);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.company_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <AdminRoute requiredRole="sub-admin">
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p className="text-slate-400">
            View approved users from: {assignedCountries.join(", ") || "No countries assigned"}
          </p>
        </div>

        {/* Assigned Countries Info */}
        {assignedCountries.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-300">
                You can only view users from your assigned countries
              </span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <Label className="text-slate-300 mb-2 block">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Organization</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Country</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-slate-900/50">
                      <td className="px-6 py-4 text-sm text-white">{user.full_name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{user.email || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{user.company_name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{user.country || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-300">No users found</h3>
            <p className="text-slate-400">
              {assignedCountries.length === 0 
                ? "No countries assigned. Contact admin."
                : "No approved users in your assigned countries"}
            </p>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
};

export default SubAdminUsers;

