import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Loader2, Users, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface User {
  user_id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  country: string | null;
  phone: string | null;
  approval_status: string;
  created_at: string;
}

const COUNTRIES = [
  "Brazil", "Russia", "India", "China", "South Africa",
  "USA", "UK", "Germany", "France", "Japan", "Canada", "Australia"
];

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("approved");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, [selectedStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // IMPORTANT: Users page should only show approved users by default
      // But allow filtering to see all statuses
      if (selectedStatus === "all") {
        // Show all statuses for admin view
      } else {
        query = query.eq("approval_status", selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers((data || []) as User[]);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: "approved" })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("User approved");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve user");
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Are you sure you want to reject this user?")) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: "rejected" })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("User rejected");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject user");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will immediately block them from logging in and hide their listings.`)) {
      return;
    }

    try {
      // Soft delete: Set approval_status to 'deleted' and hide listings
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ approval_status: "deleted" })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Soft delete all user's products
      const { error: productsError } = await supabase
        .from("products")
        .update({ status: "deleted" })
        .eq("exporter_id", userId);

      if (productsError) {
        console.warn("Error deleting user products:", productsError);
      }

      // Soft delete all user's requests
      const { error: requestsError } = await supabase
        .from("product_requests")
        .update({ status: "deleted" })
        .eq("requester_id", userId);

      if (requestsError) {
        console.warn("Error deleting user requests:", requestsError);
      }

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.company_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Country filter
    if (selectedCountry !== "all" && user.country !== selectedCountry) {
      return false;
    }

    // Date filter
    if (dateFrom) {
      const userDate = new Date(user.created_at);
      const fromDate = new Date(dateFrom);
      if (userDate < fromDate) return false;
    }
    if (dateTo) {
      const userDate = new Date(user.created_at);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);
      if (userDate > toDate) return false;
    }

    return true;
  });

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p className="text-slate-400">Manage all registered users</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
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

            <div>
              <Label className="text-slate-300 mb-2 block">Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Registered</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-slate-900/50">
                      <td className="px-6 py-4 text-sm text-white">{user.full_name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{user.email || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{user.company_name || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{user.country || "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.approval_status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : user.approval_status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {user.approval_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {user.approval_status !== "approved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(user.user_id)}
                              className="text-green-400 hover:text-green-300"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {user.approval_status !== "rejected" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(user.user_id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          )}
                        </div>
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
            <p className="text-slate-400">Try adjusting your filters</p>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminUsers;
