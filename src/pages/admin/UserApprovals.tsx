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
import { Search, CheckCircle2, XCircle, Loader2, UserCheck, Users } from "lucide-react";
import { format } from "date-fns";

interface PendingUser {
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

const AdminUserApprovals = () => {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
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

      // Filter by status
      if (selectedStatus !== "all") {
        query = query.eq("approval_status", selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map data - profiles table already has email field
      setUsers((data || []) as PendingUser[]);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from("profiles")
        .update({ approval_status: "approved" })
        .eq("user_id", userId)
        .select()
        .single();

      // If RLS blocks it, try using the function
      if (error && (error.code === "42501" || error.message?.includes("policy"))) {
        console.log("RLS blocked, trying function approach...");
        const { data: funcData, error: funcError } = await supabase.rpc(
          "update_user_approval_status",
          {
            target_user_id: userId,
            new_status: "approved"
          }
        );

        if (funcError) throw funcError;
        
        // Fetch updated profile
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single();
        
        data = updatedProfile;
        error = null;
      }

      if (error) {
        console.error("Approval error:", error);
        throw error;
      }

      // Verify the update
      if (data && data.approval_status === "approved") {
        toast.success("User approved successfully!");
        // Immediately update local state to remove from pending list
        setUsers(users.filter(u => u.user_id !== userId));
        // Refresh the list to ensure consistency
        await fetchUsers();
      } else {
        throw new Error("Approval update failed - status not changed");
      }
    } catch (error: any) {
      console.error("Error approving user:", error);
      toast.error(error.message || "Failed to approve user. Please check RLS policies.");
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Are you sure you want to reject this user?")) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ approval_status: "rejected" })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Rejection error:", error);
        throw error;
      }

      // Verify the update
      if (data && data.approval_status === "rejected") {
        toast.success("User rejected");
        // Immediately update local state
        setUsers(users.filter(u => u.user_id !== userId));
        // Refresh the list
        await fetchUsers();
      } else {
        throw new Error("Rejection update failed - status not changed");
      }
    } catch (error: any) {
      console.error("Error rejecting user:", error);
      toast.error(error.message || "Failed to reject user. Please check RLS policies.");
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

  const pendingCount = users.filter(u => u.approval_status === "pending").length;
  const approvedCount = users.filter(u => u.approval_status === "approved").length;
  const rejectedCount = users.filter(u => u.approval_status === "rejected").length;

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">User Approvals</h1>
          <p className="text-slate-400">Approve or reject user registration requests</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{pendingCount}</div>
                <div className="text-sm text-slate-400">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{approvedCount}</div>
                <div className="text-sm text-slate-400">Approved</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold text-white">{rejectedCount}</div>
                <div className="text-sm text-slate-400">Rejected</div>
              </div>
            </div>
          </div>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Signup Date</th>
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
                          {user.approval_status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(user.user_id)}
                                className="text-green-400 hover:text-green-300"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(user.user_id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {user.approval_status === "rejected" && (
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

export default AdminUserApprovals;
