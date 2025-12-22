import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Package, Upload, X, Camera, Plus, AlertCircle, ShoppingCart } from "lucide-react";
import { z } from "zod";
import imageCompression from "browser-image-compression";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  country_origin: z.string().min(1, "Country of origin is required"),
});

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

const PostProduct = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sell" | "request">("sell"); // Toggle state
  const [loading, setLoading] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userApprovalStatus, setUserApprovalStatus] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  
  // Image upload state (only for sell mode)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Sell form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    quantity: "",
    unit: "units",
    price: "",
    currency: "USD",
    country_origin: "",
  });

  // Request form data
  const [requestData, setRequestData] = useState({
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

  // Check user authentication and approval status
  useEffect(() => {
    const checkUserAccess = async () => {
      setCheckingApproval(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Please sign in to post products");
        navigate("/auth");
        return;
      }
      
      setUserId(session.user.id);
      
      // Check user profile and approval status
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("approval_status, user_type")
        .eq("user_id", session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to verify user access");
        navigate("/");
        return;
      }
      
      // No user_type restriction - anyone can post!
      setUserApprovalStatus(profile.approval_status);
      
      if (profile.approval_status === "pending") {
        toast.error("Your account is pending approval. Please wait for admin approval before posting products.");
      } else if (profile.approval_status === "rejected") {
        toast.error("Your account has been rejected. Please contact support.");
      }
      
      setCheckingApproval(false);
    };

    checkUserAccess();
  }, [navigate]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
        return;
      }
      
      setCategories(data || []);
    };

    loadCategories();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequestChange = (field: string, value: string) => {
    setRequestData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle image selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Limit to 5 images
    if (imageFiles.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    // Create previews
    const newPreviews: string[] = [];
    for (const file of validFiles) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setImageFiles([...imageFiles, ...validFiles]);
  };

  // Remove image
  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Compress and upload images
  const uploadImages = async (productId: string): Promise<boolean> => {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one product image");
      return false;
    }

    try {
      setUploadingImages(true);

      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        
        // Compress image
        const compressedFile = await imageCompression(file, compressionOptions);
        
        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${productId}/${Date.now()}_${i}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        // Save image reference to database
        const { error: dbError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            image_url: publicUrl,
            is_primary: i === 0, // First image is primary
            display_order: i,
          });

        if (dbError) {
          console.error("Database error:", dbError);
          throw new Error("Failed to save image reference");
        }
      }

      return true;
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload images");
      return false;
    } finally {
      setUploadingImages(false);
    }
  };

  // Add new category
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
          is_approved: true, // Auto-approve for MVP
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") { // Unique constraint violation
          toast.error("This category already exists");
        } else {
          throw error;
        }
        return;
      }

      setCategories([...categories, data]);
      // Update the appropriate form based on current mode
      if (mode === "sell") {
        setFormData({ ...formData, category: data.name });
      } else {
        setRequestData({ ...requestData, category: data.name });
      }
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

    // Check approval status
    if (userApprovalStatus !== "approved") {
      toast.error("Your account must be approved before posting products");
      return;
    }

    // Check images
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    setLoading(true);

    try {
      // Validate form data
      const validatedData = productSchema.parse({
        ...formData,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
      });

      // Insert product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          exporter_id: userId,
          name: validatedData.name,
          description: validatedData.description,
          category: validatedData.category,
          quantity: validatedData.quantity,
          unit: validatedData.unit,
          price: validatedData.price,
          currency: validatedData.currency,
          country_origin: validatedData.country_origin,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Upload images
      const imagesUploaded = await uploadImages(product.id);

      if (!imagesUploaded) {
        // Rollback: delete the product
        await supabase.from("products").delete().eq("id", product.id);
        throw new Error("Failed to upload images. Product was not created.");
      }

      toast.success("Product posted successfully!");
      navigate("/products");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to post product");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;

    if (userApprovalStatus !== "approved") {
      toast.error("Your account must be approved before posting requests");
      return;
    }

    setLoading(true);

    try {
      const validatedData = requestSchema.parse({
        ...requestData,
        quantity: requestData.quantity ? parseInt(requestData.quantity) : undefined,
        budget_min: requestData.budget_min ? parseFloat(requestData.budget_min) : undefined,
        budget_max: requestData.budget_max ? parseFloat(requestData.budget_max) : undefined,
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
      navigate("/products"); // TODO: Change to /requests when that page is created
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

  // Show loading screen while checking approval
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
        <Footer />
      </div>
    );
  }

  // Show warning if not approved
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
                  {userApprovalStatus === "pending" 
                    ? "Your account is currently pending approval. You'll be able to post products once an administrator approves your account."
                    : "Your account approval was rejected. Please contact support for more information."}
                </p>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            {mode === "sell" ? "Post a Product" : "Post a Buying Requirement"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "sell" 
              ? "List your product on the BRICS marketplace"
              : "Describe what you need and let sellers come to you"}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex items-center justify-center gap-3 mb-6 bg-card p-2 rounded-lg border border-border">
          <Button
            type="button"
            variant={mode === "sell" ? "default" : "outline"}
            size="lg"
            onClick={() => setMode("sell")}
            className={`min-w-[180px] ${mode === "sell" ? "bg-gold hover:bg-gold/90" : ""}`}
          >
            <Package className="w-4 h-4 mr-2" />
            Sell Product
          </Button>
          <Button
            type="button"
            variant={mode === "request" ? "default" : "outline"}
            size="lg"
            onClick={() => setMode("request")}
            className={`min-w-[180px] ${mode === "request" ? "bg-gold hover:bg-gold/90" : ""}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Request Product
          </Button>
        </div>

        {/* Sell Product Form */}
        {mode === "sell" && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter product name"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your product in detail..."
              rows={4}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="h-12 flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.is_approved).map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 flex-shrink-0"
                  onClick={() => setShowAddCategoryDialog(true)}
                  title="Add new category"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Country of Origin *</Label>
              <Select
                value={formData.country_origin}
                onValueChange={(value) => handleChange("country_origin", value)}
              >
                <SelectTrigger className="h-12">
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
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                placeholder="100"
                min="1"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleChange("unit", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger className="w-24 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Product Images * (Max 5)</Label>
            
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {imagePreviews.length === 0 ? (
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload product images from your device or take a photo
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById("image-upload") as HTMLInputElement;
                        if (input) {
                          input.setAttribute("capture", "environment");
                          input.click();
                        }
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-gold text-white text-xs rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {imagePreviews.length < 5 && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add More
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Upload up to 5 images. Images will be automatically compressed for optimal performance.
            </p>
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={loading || uploadingImages || imageFiles.length === 0}
          >
            {loading || uploadingImages ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {uploadingImages ? "Uploading images..." : "Posting..."}
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Post Product
              </>
            )}
          </Button>
        </form>
        )}

        {/* Request Product Form */}
        {mode === "request" && (
          <form onSubmit={handleRequestSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border">
            <div className="space-y-2">
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                value={requestData.title}
                onChange={(e) => handleRequestChange("title", e.target.value)}
                placeholder="e.g., Looking for 10 tons of organic wheat"
                required
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Be specific and clear</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request-description">Detailed Description *</Label>
              <Textarea
                id="request-description"
                value={requestData.description}
                onChange={(e) => handleRequestChange("description", e.target.value)}
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
                  <Select value={requestData.category} onValueChange={(value) => handleRequestChange("category", value)}>
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
                <Select value={requestData.urgency} onValueChange={(value) => handleRequestChange("urgency", value)}>
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
                <Label htmlFor="request-quantity">Quantity (Optional)</Label>
                <Input
                  id="request-quantity"
                  type="number"
                  value={requestData.quantity}
                  onChange={(e) => handleRequestChange("quantity", e.target.value)}
                  placeholder="100"
                  min="1"
                  className="h-12"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Unit</Label>
                <Select value={requestData.unit} onValueChange={(value) => handleRequestChange("unit", value)}>
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
                <Select value={requestData.currency} onValueChange={(value) => handleRequestChange("currency", value)}>
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
                  value={requestData.budget_min}
                  onChange={(e) => handleRequestChange("budget_min", e.target.value)}
                  step="0.01"
                  min="0"
                  className="h-12"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={requestData.budget_max}
                  onChange={(e) => handleRequestChange("budget_max", e.target.value)}
                  step="0.01"
                  min="0"
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Country (Optional)</Label>
              <Select value={requestData.target_country || "any"} onValueChange={(value) => handleRequestChange("target_country", value === "any" ? "" : value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Any country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any country</SelectItem>
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
        )}
      </main>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category. It will be available immediately for both products and requests.
            </DialogDescription>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddCategoryDialog(false);
                setNewCategoryName("");
              }}
              disabled={addingCategory}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="gold"
              onClick={handleAddCategory}
              disabled={addingCategory || !newCategoryName.trim()}
            >
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
      <Footer />
    </div>
  );
};

export default PostProduct;
