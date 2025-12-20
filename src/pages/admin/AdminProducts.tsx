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
import { format } from "date-fns";
import { CheckCircle2, Loader2, Package, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string | null;
    quantity: number;
    unit: string | null;
    category: string | null;
    country_origin: string | null;
    status: string;
    created_at: string;
    exporter_id: string;
    exporter?: {
        email: string;
        company_name: string;
    };
}

const COUNTRIES = [
    "Brazil", "Russia", "India", "China", "South Africa",
    "USA", "UK", "Germany", "France", "Japan", "Canada", "Australia"
];

const AdminProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
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
            let query: any = supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            // Filter by status (if status column exists)
            if (selectedStatus === "active") {
                query = query.eq("status", "active");
            } else if (selectedStatus === "done") {
                query = query.eq("status", "done");
            } else if (selectedStatus === "deleted") {
                query = query.eq("status", "deleted");
            }

            const { data: productsData, error } = await query;

            if (error) throw error;

            // Fetch exporter profiles separately
            const productsWithProfiles = await Promise.all(
                (productsData || []).map(async (product: any) => {
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("email, company_name")
                        .eq("user_id", product.exporter_id)
                        .maybeSingle();

                    return {
                        ...product,
                        status: product.status || 'active',
                        exporter: profileData ? { email: profileData.email, company_name: profileData.company_name } : undefined
                    } as Product;
                })
            );

            setProducts(productsWithProfiles);
        } catch (error: any) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const { error } = await supabase
                .from("products")
                .update({ status: "deleted" } as any)
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
                .update({ status: "done" } as any)
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
                product.description?.toLowerCase().includes(query) ||
                product.exporter?.email?.toLowerCase().includes(query) ||
                product.exporter?.company_name?.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }

        // Country filter
        if (selectedCountries.length > 0) {
            if (!product.country_origin || !selectedCountries.includes(product.country_origin)) {
                return false;
            }
        }

        // Category filter
        if (selectedCategory !== "all" && product.category !== selectedCategory) {
            return false;
        }

        // Date filter
        if (dateFrom) {
            const productDate = new Date(product.created_at);
            const fromDate = new Date(dateFrom);
            if (productDate < fromDate) return false;
        }
        if (dateTo) {
            const productDate = new Date(product.created_at);
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59);
            if (productDate > toDate) return false;
        }

        return true;
    });

    return (
        <AdminRoute requiredRole="admin">
            <AdminLayout>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Products</h1>
                    <p className="text-slate-400">Manage all product listings</p>
                </div>

                {/* Filters */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <Label className="text-slate-300 mb-2 block">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name, description, email, organization..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-slate-900 border-slate-700 text-white"
                                />
                            </div>
                        </div>

                        {/* Category */}
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

                        {/* Status */}
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

                        {/* Countries (Multi-select) */}
                        <div className="lg:col-span-2">
                            <Label className="text-slate-300 mb-2 block">Countries</Label>
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
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedCountries.includes(country)
                                                ? "bg-gold text-slate-900"
                                                : "bg-slate-900 text-slate-300 hover:bg-slate-700"
                                            }`}
                                    >
                                        {country}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date From */}
                        <div>
                            <Label className="text-slate-300 mb-2 block">Date From</Label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                        </div>

                        {/* Date To */}
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

                {/* Products List */}
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
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Organization</th>
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
                                            <td className="px-6 py-4 text-sm text-slate-300">
                                                {product.exporter?.company_name || product.exporter?.email || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === "active"
                                                            ? "bg-green-500/20 text-green-400"
                                                            : product.status === "done"
                                                                ? "bg-blue-500/20 text-blue-400"
                                                                : "bg-red-500/20 text-red-400"
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
                                                    {product.status !== "deleted" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(product.id)}
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
                        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-slate-300">No products found</h3>
                        <p className="text-slate-400">Try adjusting your filters</p>
                    </div>
                )}

                <div className="mt-4 text-sm text-slate-400">
                    Showing {filteredProducts.length} of {products.length} products
                </div>
            </AdminLayout>
        </AdminRoute>
    );
};

export default AdminProducts;
