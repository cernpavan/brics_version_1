import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import { Loader2, Package, Trash2, Edit, Plus, FileText, CheckCircle2, Search } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Profile {
  full_name: string | null;
  company_name: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  user_type: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string | null;
  quantity: number;
  unit: string | null;
  category: string | null;
  status: string;
  created_at: string;
}

interface ProductRequest {
  id: string;
  title: string;
  description: string;
  category: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  status: string;
  created_at: string;
  requester_id: string;
}

const countries = ["Brazil", "Russia", "India", "China", "South Africa"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  
  // My Listings filters
  const [listingType, setListingType] = useState<"all" | "sell" | "request">("all");
  const [listingStatus, setListingStatus] = useState<"all" | "active" | "done" | "deleted">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchData(session.user.id);
    });
  }, [navigate]);

  const fetchData = async (userId: string) => {
    try {
      const [profileResult, productsResult, requestsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("products").select("*").eq("exporter_id", userId).order("created_at", { ascending: false }),
        supabase.from("product_requests").select("*").eq("requester_id", userId).order("created_at", { ascending: false }),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
        setEditedProfile(profileResult.data);
      }
      if (productsResult.data) {
        setProducts(productsResult.data);
      }
      if (requestsResult.data) {
        setRequests(requestsResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update(editedProfile)
        .eq("user_id", user.id);

      if (error) throw error;
      setProfile({ ...profile, ...editedProfile } as Profile);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    // Verify ownership - user can only delete their own products
    const product = products.find(p => p.id === productId);
    if (!product || product.exporter_id !== userId) {
      toast.error("You can only delete your own products");
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .update({ status: "deleted" })
        .eq("id", productId)
        .eq("exporter_id", userId); // Double-check ownership in query

      if (error) throw error;
      setProducts(products.map(p => p.id === productId ? { ...p, status: "deleted" } : p));
      toast.success("Product deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleMarkProductDone = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ status: "done" })
        .eq("id", productId);
      if (error) throw error;
      setProducts(products.map(p => p.id === productId ? { ...p, status: "done" } : p));
      toast.success("Product marked as Done Deal");
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    
    // Verify ownership - user can only delete their own requests
    const request = requests.find(r => r.id === requestId);
    if (!request || request.requester_id !== userId) {
      toast.error("You can only delete your own requests");
      return;
    }

    try {
      const { error } = await supabase
        .from("product_requests")
        .update({ status: "deleted" })
        .eq("id", requestId)
        .eq("requester_id", userId); // Double-check ownership in query

      if (error) throw error;
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: "deleted" } : r));
      toast.success("Request deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete request");
    }
  };

  const handleMarkRequestDone = async (requestId: string) => {
    // Verify ownership - user can only mark their own requests as done
    const request = requests.find(r => r.id === requestId);
    if (!request || request.requester_id !== userId) {
      toast.error("You can only mark your own requests as done");
      return;
    }

    try {
      const { error } = await supabase
        .from("product_requests")
        .update({ status: "done" })
        .eq("id", requestId)
        .eq("requester_id", userId); // Double-check ownership

      if (error) throw error;
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: "done" } : r));
      toast.success("Request marked as Done Deal");
    } catch (error: any) {
      toast.error(error.message || "Failed to update request");
    }
  };

  // Filter listings
  const filteredListings = () => {
    let items: Array<{ type: "sell" | "request"; data: Product | ProductRequest }> = [];

    // Add products
    if (listingType === "all" || listingType === "sell") {
      products.forEach(p => {
        if (listingStatus === "all" || p.status === listingStatus) {
          if (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            items.push({ type: "sell", data: p });
          }
        }
      });
    }

    // Add requests
    if (listingType === "all" || listingType === "request") {
      requests.forEach(r => {
        if (listingStatus === "all" || r.status === listingStatus) {
          if (!searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            items.push({ type: "request", data: r });
          }
        }
      });
    }

    return items.sort((a, b) => {
      const dateA = new Date(a.data.created_at).getTime();
      const dateB = new Date(b.data.created_at).getTime();
      return dateB - dateA;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </div>
    );
  }

  const isExporter = profile?.user_type === "exporter";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-8">
          Dashboard
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                Profile
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={editedProfile.full_name || ""}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, full_name: e.target.value })
                    }
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={editedProfile.company_name || ""}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, company_name: e.target.value })
                    }
                    placeholder="Company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select
                    value={editedProfile.country || ""}
                    onValueChange={(value) =>
                      setEditedProfile({ ...editedProfile, country: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editedProfile.phone || ""}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, phone: e.target.value })
                    }
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <Button
                  variant="gold"
                  className="w-full mt-4"
                  onClick={handleProfileUpdate}
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Profile
                </Button>
              </div>
            </div>
          </div>

          {/* My Listings Section */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  My Listings
                </h2>
                <div className="flex gap-2">
                  <Link to="/post-product">
                    <Button variant="gold" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Product
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label className="mb-2 block">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Type</Label>
                    <Select value={listingType} onValueChange={(v: any) => setListingType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="sell">Sell Products</SelectItem>
                        <SelectItem value="request">Request Products</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block">Status</Label>
                    <Select value={listingStatus} onValueChange={(v: any) => setListingStatus(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="done">Done Deal</SelectItem>
                        <SelectItem value="deleted">Deleted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Listings */}
              {filteredListings().length > 0 ? (
                <div className="space-y-4">
                  {filteredListings().map((item) => (
                    <div
                      key={`${item.type}-${item.data.id}`}
                      className="flex items-center justify-between p-4 bg-muted rounded-xl"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === "sell" ? (
                            <Package className="w-4 h-4 text-gold" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="text-xs px-2 py-0.5 rounded bg-muted-foreground/20 text-muted-foreground">
                            {item.type === "sell" ? "Sell" : "Request"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              item.data.status === "active"
                                ? "bg-green-500/20 text-green-600"
                                : item.data.status === "done"
                                ? "bg-blue-500/20 text-blue-600"
                                : "bg-red-500/20 text-red-600"
                            }`}
                          >
                            {item.data.status}
                          </span>
                        </div>
                        <h3 className="font-medium text-foreground">
                          {item.type === "sell" 
                            ? (item.data as Product).name 
                            : (item.data as ProductRequest).title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.type === "sell" 
                            ? `${(item.data as Product).currency || "USD"} ${Number((item.data as Product).price).toLocaleString()} • ${(item.data as Product).quantity} ${(item.data as Product).unit || "units"}`
                            : (item.data as ProductRequest).description?.substring(0, 60) + "..."}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {item.data.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (item.type === "sell") {
                                handleMarkProductDone((item.data as Product).id);
                              } else {
                                handleMarkRequestDone((item.data as ProductRequest).id);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Done
                          </Button>
                        )}
                        {item.type === "sell" && (
                          <Link to={`/product/${(item.data as Product).id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (item.type === "sell") {
                              handleDeleteProduct((item.data as Product).id);
                            } else {
                              handleDeleteRequest((item.data as ProductRequest).id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    {products.length === 0 && requests.length === 0
                      ? "You haven't posted any listings yet"
                      : "No listings match your filters"}
                  </p>
                  <Link to="/post-product">
                    <Button variant="outline">Post Your First Listing</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
