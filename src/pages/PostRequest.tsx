import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Plus, AlertCircle } from "lucide-react";
import { z } from "zod";

const requestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").optional(),
  unit: z.string().min(1, "Unit is required").optional(),
  budget_min: z.number().min(0, "Budget must be positive").optional(),
  budget_max: z.number().min(0, "Budget must be positive").optional(),
  currency: z.string().min(1, "Currency is required"),
  target_country: z.string().optional(),
  urgency: z.string().min(1, "Urgency level is required"),
});

interface Category {
  id: string;
  name: string;
  is_approved: boolean;
}

const countries = ["Brazil", "Russia", "India", "China", "South Africa", "Egypt", "Ethiopia", "Iran", "UAE"];
const currencies = ["USD", "EUR", "CNY", "INR", "BRL", "RUB", "ZAR"];
const units = ["units", "kg", "tons", "liters", "pieces", "boxes", "containers"];
const urgencyLevels = [
  { value: "low", label: "Low Priority" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent" },
];

const PostRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userApprovalStatus, setUserApprovalStatus] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    unit: "units",
    budget_min: "",
    budget_max: "",
    currency: "USD",
    target_country: "",
    urgency: "normal",
  });

  useEffect(() => {
    const checkUserAccess = async () => {
      setCheckingApproval(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Please sign in to post a request");
        navigate("/auth");
        return;
      }
      
      setUserId(session.user.id);
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("approval_status")
        .eq("user_id", session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to verify user access");
        navigate("/");
        return;
      }
      
      setUserApprovalStatus(profile.approval_status);
      
      if (profile.approval_status !== "approved") {
        toast.error("Your account must be approved before posting requests");
      }
      
      setCheckingApproval(false);
    };

    checkUserAccess();
  }, [navigate]);

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (!error && data) {
        setCategories(data);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setAddingCategory(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: newCategoryName.trim(),
          created_by: userId,
          is_approved: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("This category already exists");
        } else {
          throw error;
        }
        return;
      }

      setCategories([...categories, data]);
      setFormData({ ...formData, category: data.name });
      toast.success("Category added successfully!");
      setShowAddCategoryDialog(false);
      setNewCategoryName("");
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;

    if (userApprovalStatus !== "approved") {
      toast.error("Your account must be approved before posting requests");
      return;
    }

    setLoading(true);

    try {
      const validatedData = requestSchema.parse({
        ...formData,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : undefined,
      });

      const { error } = await supabase
        .from("product_requests")
        .insert({
          requester_id: userId,
          title: validatedData.title,
          description: validatedData.description,
          category: validatedData.category,
          quantity: validatedData.quantity || null,
          unit: validatedData.unit || null,
          budget_min: validatedData.budget_min || null,
          budget_max: validatedData.budget_max || null,
          currency: validatedData.currency,
          target_country: validatedData.target_country || null,
          urgency: validatedData.urgency,
          status: "open",
        });

      if (error) throw error;

      toast.success("Request posted successfully!");
      navigate("/requests");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to post request");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingApproval) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-gold mb-4" />
            <p className="text-muted-foreground">Verifying access...</p>
          </div>
        </main>
      </div>
    );
  }

  if (userApprovalStatus !== "approved") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Account Approval Required
                </h2>
                <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                  Your account must be approved before posting requests.
                </p>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Post a Buying Requirement
          </h1>
          <p className="text-muted-foreground">
            Describe what you need and let sellers come to you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border">
          <div className="space-y-2">
            <Label htmlFor="title">Request Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Looking for 10 tons of organic wheat"
              required
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">Be specific and clear</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your requirements in detail..."
              rows={5}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Minimum 20 characters</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="flex gap-2">
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger className="h-12 flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.is_approved).map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" className="h-12 w-12" onClick={() => setShowAddCategoryDialog(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Urgency *</Label>
              <Select value={formData.urgency} onValueChange={(value) => handleChange("urgency", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Optional)</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                placeholder="100"
                min="1"
                className="h-12"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => handleChange("unit", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Budget Range (Optional)</Label>
            <div className="flex gap-2 items-center">
              <Select value={formData.currency} onValueChange={(value) => handleChange("currency", value)}>
                <SelectTrigger className="w-24 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Min"
                value={formData.budget_min}
                onChange={(e) => handleChange("budget_min", e.target.value)}
                step="0.01"
                min="0"
                className="h-12"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={formData.budget_max}
                onChange={(e) => handleChange("budget_max", e.target.value)}
                step="0.01"
                min="0"
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Country (Optional)</Label>
            <Select value={formData.target_country} onValueChange={(value) => handleChange("target_country", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Any country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any country</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Posting...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Post Request
              </>
            )}
          </Button>
        </form>
      </main>

      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category for your request.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-category">Category Name</Label>
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddCategoryDialog(false)} disabled={addingCategory}>
              Cancel
            </Button>
            <Button type="button" variant="gold" onClick={handleAddCategory} disabled={addingCategory || !newCategoryName.trim()}>
              {addingCategory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostRequest;








