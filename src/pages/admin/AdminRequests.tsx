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
import { Search, Trash2, CheckCircle2, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";

interface ProductRequest {
  id: string;
  title: string;
  description: string;
  category: string | null;
  quantity: number | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  target_country: string | null;
  status: string;
  created_at: string;
  requester_id: string;
  requester?: {
    email: string;
    company_name: string;
  };
}

const COUNTRIES = [
  "Brazil", "Russia", "India", "China", "South Africa",
  "USA", "UK", "Germany", "France", "Japan", "Canada", "Australia"
];

const AdminRequests = () => {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    fetchCategories();
    fetchRequests();
  }, [selectedStatus]);

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
    setLoading(true);
    try {
      let query = supabase
        .from("product_requests")
        .select(`
          *,
          profiles!product_requests_requester_id_fkey(email, company_name)
        `)
        .order("created_at", { ascending: false });

      // Filter by status
      if (selectedStatus === "active") {
        query = query.eq("status", "active");
      } else if (selectedStatus === "done") {
        query = query.eq("status", "done");
      } else if (selectedStatus === "deleted") {
        query = query.eq("status", "deleted");
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestId: string) => {
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

  const handleMarkDone = async (requestId: string) => {
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
        request.description?.toLowerCase().includes(query) ||
        request.requester?.email?.toLowerCase().includes(query) ||
        request.requester?.company_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Country filter
    if (selectedCountries.length > 0) {
      if (!request.target_country || !selectedCountries.includes(request.target_country)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== "all" && request.category !== selectedCategory) {
      return false;
    }

    // Date filter
    if (dateFrom) {
      const requestDate = new Date(request.created_at);
      const fromDate = new Date(dateFrom);
      if (requestDate < fromDate) return false;
    }
    if (dateTo) {
      const requestDate = new Date(request.created_at);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);
      if (requestDate > toDate) return false;
    }

    return true;
  });

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Requests</h1>
          <p className="text-slate-400">Manage all buying requirements</p>
        </div>

        {/* Filters - Same as AdminProducts */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Label className="text-slate-300 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by title, description, email, organization..."
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
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-slate-300 mb-2 block">Target Countries</Label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((country) => (
                  <button
                    key={country}
                    onClick={() => {
                      setSelectedCountries((prev) =>
                        prev.includes(country)
                          ? prev.filter((c) => c !== country)
                          : [...prev, country]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCountries.includes(country)
                        ? "bg-gold text-slate-900"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Requester</th>
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
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {request.requester?.company_name || request.requester?.email || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : request.status === "done"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-red-500/20 text-red-400"
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
                              onClick={() => handleMarkDone(request.id)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Done
                            </Button>
                          )}
                          {request.status !== "deleted" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(request.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
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
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-300">No requests found</h3>
            <p className="text-slate-400">Try adjusting your filters</p>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-400">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminRequests;
