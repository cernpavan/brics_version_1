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
import { Search, Trash2, CheckCircle2, Loader2, FileText, MapPin } from "lucide-react";
import { format } from "date-fns";
import { getAllCountryVariants } from "@/utils/countryMapping";

interface ProductRequest {
  id: string;
  title: string;
  description: string;
  category: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  target_country: string | null;
  status: string;
  created_at: string;
}

const SubAdminRequests = () => {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [assignedCountries, setAssignedCountries] = useState<string[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");

  useEffect(() => {
    // Get Sub-Admin assigned countries
    const session = localStorage.getItem("admin_session");
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const countries = sessionData.assigned_countries || [];
        console.log("Sub-Admin assigned countries (Requests):", countries);
        setAssignedCountries(countries);
      } catch (error) {
        console.error("Error parsing session:", error);
      }
    } else {
      console.warn("No admin session found");
    }
    
    fetchCategories();
  }, []);

  // Fetch requests when assigned countries or status change
  useEffect(() => {
    if (assignedCountries.length > 0) {
      fetchRequests();
    } else {
      setRequests([]);
      setLoading(false);
    }
  }, [selectedStatus, assignedCountries]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("name")
      .eq("is_approved", true);
    
    if (data) {
      setCategories(data.map(c => c.name));
    }
  };

  const fetchRequests = async () => {
    if (assignedCountries.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get all country variants (both names and codes) for filtering
      const countryVariants = getAllCountryVariants(assignedCountries);
      console.log("Fetching requests for countries:", assignedCountries, "Variants:", countryVariants, "Status:", selectedStatus);
      
      let query = supabase
        .from("product_requests")
        .select("*")
        .in("target_country", countryVariants) // CRITICAL: Filter by all country variants
        .order("created_at", { ascending: false });

      // Filter by status
      if (selectedStatus === "active") {
        query = query.eq("status", "active");
      } else if (selectedStatus === "done") {
        query = query.eq("status", "done");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Fetch error:", error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} requests from assigned countries with status: ${selectedStatus}`);
      setRequests((data || []) as ProductRequest[]);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast.error(error.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestId: string, targetCountry: string | null) => {
    // Verify country permission
    if (targetCountry) {
      const countryVariants = getAllCountryVariants(assignedCountries);
      if (!countryVariants.includes(targetCountry)) {
        toast.error("You can only delete requests from your assigned countries");
        return;
      }
    }

    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      const { error } = await supabase
        .from("product_requests")
        .update({ status: "deleted" })
        .eq("id", requestId);

      if (error) throw error;
      toast.success("Request deleted");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete request");
    }
  };

  const handleMarkDone = async (requestId: string, targetCountry: string | null) => {
    // Verify country permission
    if (targetCountry) {
      const countryVariants = getAllCountryVariants(assignedCountries);
      if (!countryVariants.includes(targetCountry)) {
        toast.error("You can only mark requests from your assigned countries as done");
        return;
      }
    }

    try {
      const { error } = await supabase
        .from("product_requests")
        .update({ status: "done" })
        .eq("id", requestId);

      if (error) throw error;
      toast.success("Request marked as Done Deal");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to update request");
    }
  };

  const filteredRequests = requests.filter((request) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        request.title.toLowerCase().includes(query) ||
        request.description?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== "all" && request.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  return (
    <AdminRoute requiredRole="sub-admin">
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Requests</h1>
          <p className="text-slate-400">
            Managing requests from: {assignedCountries.join(", ") || "No countries assigned"}
          </p>
        </div>

        {/* Assigned Countries Info */}
        {assignedCountries.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-300">
                You can only view and manage requests from your assigned countries
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label className="text-slate-300 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="done">Done Deal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Budget</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Target Country</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-900/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{request.title}</div>
                          <div className="text-sm text-slate-400 line-clamp-1">
                            {request.description || "No description"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {request.budget_min && request.budget_max
                          ? `${request.currency || "USD"} ${request.budget_min.toLocaleString()} - ${request.budget_max.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{request.category || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{request.target_country || "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {request.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkDone(request.id, request.target_country)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Done
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(request.id, request.target_country)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-300">No requests found</h3>
            <p className="text-slate-400">
              {assignedCountries.length === 0 
                ? "No countries assigned. Contact admin."
                : "No requests match your filters"}
            </p>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
};

export default SubAdminRequests;

