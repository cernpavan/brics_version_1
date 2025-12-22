import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, Lock } from "lucide-react";

type AdminRole = "admin" | "sub-admin";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<AdminRole>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Hash password using Web Crypto API (browser-compatible)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        toast.error("Please enter both username and password");
        setLoading(false);
        return;
      }

      const tableName = role === "admin" ? "admin_users" : "sub_admin_users";
      
      // Get user record
      const { data: userData, error: fetchError } = await supabase
        .from(tableName)
        .select("*")
        .eq("username", username.trim())
        .eq("is_active", true)
        .single();

      if (fetchError) {
        console.error("Database error:", fetchError);
        toast.error(`Database error: ${fetchError.message}`);
        setLoading(false);
        return;
      }

      if (!userData) {
        console.error("User not found:", username.trim());
        toast.error("Invalid credentials - User not found");
        setLoading(false);
        return;
      }

      // Hash the entered password and compare
      const enteredPasswordHash = await hashPassword(password);
      
      if (enteredPasswordHash !== userData.password_hash) {
        toast.error("Invalid credentials");
        setLoading(false);
        return;
      }

      // Store admin session FIRST (before any async operations)
      const sessionData = {
        id: userData.id,
        username: userData.username,
        role: role,
        ...(role === "sub-admin" && {
          created_by: userData.created_by,
          assigned_countries: userData.assigned_countries,
        }),
        loginTime: new Date().toISOString(),
      };
      
      localStorage.setItem("admin_session", JSON.stringify(sessionData));
      console.log("Session stored:", sessionData);

      // Update last login (don't wait for it - non-blocking)
      supabase
        .from(tableName)
        .update({ last_login: new Date().toISOString() })
        .eq("id", userData.id)
        .then(() => {
          console.log("Last login updated");
        })
        .catch((err) => {
          console.warn("Failed to update last login:", err);
        });

      toast.success("Login successful!");
      setLoading(false);
      
      // Redirect immediately - use window.location for more reliable navigation
      const targetPath = role === "admin" ? "/admin/dashboard" : "/sub-admin/dashboard";
      console.log("Navigating to:", targetPath);
      
      // Use window.location as fallback if navigate doesn't work
      navigate(targetPath, { replace: true });
      
      // Fallback: force navigation after short delay
      setTimeout(() => {
        if (window.location.pathname !== targetPath) {
          console.log("Fallback navigation triggered");
          window.location.href = targetPath;
        }
      }, 500);
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/20 mb-4">
            <Shield className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Secure administrator access</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Role Toggle */}
          <div className="mb-6">
            <Label className="text-slate-300 mb-3 block">Select Role</Label>
            <Tabs value={role} onValueChange={(value) => setRole(value as AdminRole)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-gold data-[state=active]:text-slate-900"
                >
                  Admin
                </TabsTrigger>
                <TabsTrigger 
                  value="sub-admin"
                  className="data-[state=active]:bg-gold data-[state=active]:text-slate-900"
                >
                  Sub-Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-gold"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-gold"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-slate-900/30 border border-slate-700 rounded-lg">
            <p className="text-xs text-slate-400 text-center">
              <Lock className="w-3 h-3 inline mr-1" />
              This is a secure admin area. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          BRICSZ Admin Portal
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

