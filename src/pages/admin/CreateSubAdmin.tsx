import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";

const createSubAdminSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  assigned_countries: z.array(z.string()).min(1, "Select at least one country"),
});

type CreateSubAdminData = z.infer<typeof createSubAdminSchema>;

// Common countries list
const COUNTRIES = [
  "Brazil",
  "Russia",
  "India",
  "China",
  "South Africa",
  "USA",
  "UK",
  "Germany",
  "France",
  "Japan",
  "Canada",
  "Australia",
  "Mexico",
  "Argentina",
  "Chile",
  "Peru",
  "Colombia",
  "Venezuela",
  "Egypt",
  "Nigeria",
  "Kenya",
  "Saudi Arabia",
  "UAE",
  "Turkey",
  "Indonesia",
  "Thailand",
  "Vietnam",
  "Philippines",
  "Malaysia",
  "Singapore",
];

const CreateSubAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSubAdminData>({
    full_name: "",
    username: "",
    email: "",
    password: "",
    assigned_countries: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateSubAdminData, string>>>({});

  useEffect(() => {
    // Check if user is admin
    const session = localStorage.getItem("admin_session");
    if (!session) {
      navigate("/admin");
      return;
    }

    const sessionData = JSON.parse(session);
    if (sessionData.role !== "admin") {
      toast.error("Only admins can create Sub-Admins");
      navigate("/admin/dashboard");
      return;
    }
  }, [navigate]);

  // Hash password using Web Crypto API
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCountryToggle = (country: string) => {
    setFormData((prev) => {
      const countries = prev.assigned_countries.includes(country)
        ? prev.assigned_countries.filter((c) => c !== country)
        : [...prev.assigned_countries, country];
      return { ...prev, assigned_countries: countries };
    });
    if (errors.assigned_countries) {
      setErrors((prev) => ({ ...prev, assigned_countries: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form
      const validation = createSubAdminSchema.safeParse(formData);
      if (!validation.success) {
        const fieldErrors: Partial<Record<keyof CreateSubAdminData, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof CreateSubAdminData] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the form errors");
        return;
      }

      // Get admin session
      const session = localStorage.getItem("admin_session");
      if (!session) {
        toast.error("Session expired. Please login again.");
        navigate("/admin");
        return;
      }

      const sessionData = JSON.parse(session);
      if (sessionData.role !== "admin") {
        toast.error("Only admins can create Sub-Admins");
        return;
      }

      // Hash password
      const passwordHash = await hashPassword(formData.password);

      // Create Sub-Admin
      const { data, error } = await supabase
        .from("sub_admin_users")
        .insert({
          username: formData.username.trim(),
          password_hash: passwordHash,
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          created_by: sessionData.id,
          assigned_countries: formData.assigned_countries,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          toast.error("Username already exists");
          setErrors({ username: "Username already exists" });
        } else {
          console.error("Error creating Sub-Admin:", error);
          toast.error(`Failed to create Sub-Admin: ${error.message}`);
        }
        return;
      }

      toast.success("Sub-Admin created successfully!");
      navigate("/admin/sub-admins");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to create Sub-Admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link to="/admin/sub-admins">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2">Create Sub-Admin</h1>
              <p className="text-slate-400">Add a new Sub-Admin with country permissions</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-slate-300">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }));
                  if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: undefined }));
                }}
                placeholder="Enter full name"
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
              {errors.full_name && <p className="text-sm text-red-400">{errors.full_name}</p>}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Username <span className="text-red-400">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, username: e.target.value }));
                  if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                placeholder="Enter username (unique)"
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
              {errors.username && <p className="text-sm text-red-400">{errors.username}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Enter email address"
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password <span className="text-red-400">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Enter password (min 6 characters)"
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
              <p className="text-xs text-slate-400">Minimum 6 characters recommended</p>
            </div>

            {/* Assigned Countries */}
            <div className="space-y-2">
              <Label className="text-slate-300">
                Assigned Countries <span className="text-red-400">*</span>
              </Label>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COUNTRIES.map((country) => (
                    <label
                      key={country}
                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assigned_countries.includes(country)}
                        onChange={() => handleCountryToggle(country)}
                        className="w-4 h-4 text-gold bg-slate-800 border-slate-700 rounded focus:ring-gold"
                      />
                      <span className="text-sm text-slate-300">{country}</span>
                    </label>
                  ))}
                </div>
              </div>
              {errors.assigned_countries && (
                <p className="text-sm text-red-400">{errors.assigned_countries}</p>
              )}
              {formData.assigned_countries.length > 0 && (
                <p className="text-xs text-slate-400">
                  Selected: {formData.assigned_countries.join(", ")}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="gold"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Sub-Admin
                  </>
                )}
              </Button>
              <Link to="/admin/sub-admins">
                <Button type="button" variant="outline" className="border-slate-700">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default CreateSubAdmin;





