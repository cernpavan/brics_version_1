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
import { Search, Trash2, CheckCircle2, Loader2, Package, MapPin } from "lucide-react";
import { format } from "date-fns";
import { getAllCountryVariants } from "@/utils/countryMapping";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string | null;
  quantity: number;
  category: string | null;
  country_origin: string | null;
  status: string;
  created_at: string;
}

const SubAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
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
      const sessionData = JSON.parse(session);
      setAssignedCountries(sessionData.assigned_countries || []);
    }
    
    fetchCategories();
    fetchProducts();
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      // CRITICAL: Filter by assigned countries only
      if (assignedCountries.length > 0) {
        // Get all country variants (both names and codes) for filtering
        const countryVariants = getAllCountryVariants(assignedCountries);
        console.log("Filtering products by countries:", assignedCountries, "Variants:", countryVariants);
        query = query.in("country_origin", countryVariants);
      } else {
        // If no countries assigned, show nothing
        setProducts([]);
        setLoading(false);
        return;
      }

      // Filter by status
      if (selectedStatus === "active") {
        query = query.eq("status", "active");
      } else if (selectedStatus === "done") {
        query = query.eq("status", "done");
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, countryOrigin: string | null) => {
    // Verify country permission - Sub-Admin can only delete from assigned countries
    if (countryOrigin) {
      const countryVariants = getAllCountryVariants(assignedCountries);
      if (!countryVariants.includes(countryOrigin)) {
        toast.error("You can only delete products from your assigned countries");
        return;
      }
    }

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({ status: "deleted" })
        .eq("id", productId);

      if (error) throw error;
      toast.success("Product deleted");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleMarkDone = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ status: "done" })
        .eq("id", productId);

      if (error) throw error;
      toast.success("Product marked as Done Deal");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    }
  };

  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== "all" && product.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  return (
    <AdminRoute requiredRole="sub-admin">
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-slate-400">
            Managing products from: {assignedCountries.join(", ") || "No countries assigned"}
          </p>
        </div>

        {/* Assigned Countries Info */}
        {assignedCountries.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-300">
                You can only view products from your assigned countries
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
                  placeholder="Search by name or description..."
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

        {/* Products List - Same table structure as AdminProducts but simpler */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Country</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-900/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-sm text-slate-400 line-clamp-1">
                            {product.description || "No description"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {product.currency || "USD"} {Number(product.price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{product.category || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{product.country_origin || "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {format(new Date(product.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {product.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkDone(product.id)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Done
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.country_origin)}
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
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-300">No products found</h3>
            <p className="text-slate-400">
              {assignedCountries.length === 0 
                ? "No countries assigned. Contact admin."
                : "No products match your filters"}
            </p>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
};

export default SubAdminProducts;

