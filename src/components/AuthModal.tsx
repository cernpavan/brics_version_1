import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { z } from "zod";

const BRICS_COUNTRIES = [
  { code: "BR", name: "Brazil" },
  { code: "RU", name: "Russia" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "ET", name: "Ethiopia" },
  { code: "IR", name: "Iran" },
  { code: "AE", name: "UAE" },
];

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationName: z.string().min(2, "Please enter your organization name"),
  country: z.string().min(1, "Please select a country"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  isAdmin: z.boolean().optional(),
});

const googleSignUpDetailsSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationName: z.string().min(2, "Please enter your organization name"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  country: z.string().min(1, "Please select a country"),
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup" | "google-details";
}

export const AuthModal = ({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) => {
  const [mode, setMode] = useState<"signin" | "signup" | "google-details">(initialMode);
  const [loading, setLoading] = useState(false);

  // Sign In State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign Up State
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Google Details State
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleFullName, setGoogleFullName] = useState("");
  const [googleUserId, setGoogleUserId] = useState("");
  const [googlePassword, setGooglePassword] = useState("");
  const [googlePhone, setGooglePhone] = useState("");

  // Check for Google OAuth callback and incomplete profile
  useEffect(() => {
    const checkGoogleAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const isGoogleAuth = session.user.app_metadata.provider === "google";
        
        if (isGoogleAuth) {
          // Check if profile is complete
          const { data: profile } = await supabase
            .from("profiles")
            .select("company_name, country")
            .eq("user_id", session.user.id)
            .single();

          // If profile incomplete, show Google details form
          if (!profile?.company_name || !profile?.country) {
            setGoogleEmail(session.user.email || "");
            setGoogleFullName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "");
            setGoogleUserId(session.user.id);
            setMode("google-details");
            
            // If modal is not open, we need to trigger it somehow
            // This will be handled by the parent component checking auth state
          }
        }
      }
    };

    if (isOpen) {
      checkGoogleAuthStatus();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setSignUpEmail("");
    setSignUpPassword("");
    setOrganizationName("");
    setCountry("");
    setPhone("");
    setIsAdmin(false);
    setGoogleEmail("");
    setGoogleFullName("");
    setGoogleUserId("");
    setGooglePassword("");
    setGooglePhone("");
  };

  const handleClose = () => {
    // Don't allow closing if in google-details mode (force completion)
    if (mode === "google-details") {
      toast.error("Please complete your profile to continue");
      return;
    }
    resetForm();
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationResult = signInSchema.safeParse({ email, password });
      if (!validationResult.success) {
        toast.error(validationResult.error.errors[0].message);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationResult = signUpSchema.safeParse({
        fullName,
        email: signUpEmail,
        password: signUpPassword,
        organizationName,
        country,
        phone,
        isAdmin,
      });

      if (!validationResult.success) {
        toast.error(validationResult.error.errors[0].message);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            full_name: fullName,
            user_type: "buyer", // Default user type - all users can buy and sell
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update profile with additional information
        // Set approval_status to 'pending' for new users
        // First, check if profile exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        let profileError;
        
        if (existingProfile) {
          // Profile exists, update it
          const { error } = await supabase
            .from("profiles")
            .update({
              full_name: fullName,
              company_name: organizationName,
              country: country,
              phone: phone,
              user_type: "buyer", // Default user type - all users can buy and sell
              is_admin: isAdmin,
              approval_status: "pending", // New users need approval
            })
            .eq("user_id", data.user.id);
          profileError = error;
        } else {
          // Profile doesn't exist, insert it
          const { error } = await supabase
            .from("profiles")
            .insert({
              user_id: data.user.id,
              full_name: fullName,
              company_name: organizationName,
              country: country,
              phone: phone,
              email: signUpEmail,
              user_type: "buyer",
              is_admin: isAdmin,
              approval_status: "pending", // New users need approval
            });
          profileError = error;
        }

        if (profileError) {
          console.error("Profile update error:", profileError);
          // Try using the upsert function as fallback
          try {
            const { error: funcError } = await supabase.rpc("upsert_user_profile", {
              p_user_id: data.user.id,
              p_full_name: fullName,
              p_company_name: organizationName,
              p_phone: phone,
              p_country: country,
              p_user_type: "buyer",
              p_is_admin: isAdmin,
              p_approval_status: "pending"
            });
            if (funcError) {
              console.error("Fallback upsert error:", funcError);
            }
          } catch (fallbackError: any) {
            console.error("Fallback upsert exception:", fallbackError);
          }
        }
      }

      toast.success("Account created successfully!");
      resetForm();
      onClose();
    } catch (error: any) {
      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      const validationResult = googleSignUpDetailsSchema.safeParse({
        password: googlePassword,
        organizationName,
        phone: googlePhone,
        country,
      });

      if (!validationResult.success) {
        toast.error(validationResult.error.errors[0].message);
        return;
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("No active session found");
      }

      // Try to set password for email/password login capability
      try {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: googlePassword,
        });
        
        if (passwordError) {
          console.warn("Password update warning:", passwordError);
          // Continue anyway - not critical
        }
      } catch (pwdError) {
        console.warn("Could not set password for OAuth user:", pwdError);
        // Continue - user can still use Google to sign in
      }

      // Update profile with additional information
      // Set approval_status to 'pending' for new users
      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      let profileError;
      
      if (existingProfile) {
        // Profile exists, update it
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: googleFullName || fullName,
            company_name: organizationName,
            phone: googlePhone,
            country: country,
            user_type: "buyer", // Default user type - all users can buy and sell
            is_admin: isAdmin,
            approval_status: "pending", // New users need approval
          })
          .eq("user_id", session.user.id);
        profileError = error;
      } else {
        // Profile doesn't exist, insert it
        const { error } = await supabase
          .from("profiles")
          .insert({
            user_id: session.user.id,
            full_name: googleFullName || fullName,
            company_name: organizationName,
            phone: googlePhone,
            country: country,
            email: session.user.email || "",
            user_type: "buyer",
            is_admin: isAdmin,
            approval_status: "pending", // New users need approval
          });
        profileError = error;
      }

      if (profileError) {
        console.error("Profile update error:", profileError);
        // Try using the upsert function as fallback
        try {
          const { error: funcError } = await supabase.rpc("upsert_user_profile", {
            p_user_id: session.user.id,
            p_full_name: googleFullName || fullName,
            p_company_name: organizationName,
            p_phone: googlePhone,
            p_country: country,
            p_user_type: "buyer",
            p_is_admin: isAdmin,
            p_approval_status: "pending"
          });
          if (funcError) throw funcError;
        } catch (fallbackError: any) {
          console.error("Fallback upsert error:", fallbackError);
          throw profileError; // Throw original error
        }
      }

      toast.success("Profile completed successfully! You can now sign in with Google or Email/Password.");
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
      // The page will redirect to Google, then back
      // On return, the useEffect will check if profile is complete
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            {mode === "signin" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {mode === "google-details" && "Complete Your Profile"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin" && "Sign in to access your account"}
            {mode === "signup" && "Join the BRICS trade network"}
            {mode === "google-details" && "Please provide additional details to complete your registration"}
          </DialogDescription>
        </DialogHeader>

        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email Address</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Sign In
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <Mail className="w-4 h-4 mr-2" />
              Google
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={switchMode}
                className="text-gold hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </form>
        ) : mode === "signup" ? (
          <form onSubmit={handleSignUp} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signup-fullname">Full Name *</Label>
              <Input
                id="signup-fullname"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email Address *</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password *</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                className="h-11"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`h-1 flex-1 rounded ${signUpPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`h-1 flex-1 rounded ${signUpPassword.length >= 8 && /[A-Z]/.test(signUpPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`h-1 flex-1 rounded ${signUpPassword.length >= 10 && /[A-Z]/.test(signUpPassword) && /[0-9]/.test(signUpPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {signUpPassword.length === 0 
                    ? "Password must be at least 6 characters" 
                    : signUpPassword.length < 6 
                    ? "Too short - add more characters"
                    : signUpPassword.length < 8
                    ? "Fair - add uppercase letters for better security"
                    : signUpPassword.length < 10 || !/[0-9]/.test(signUpPassword)
                    ? "Good - add numbers for strong security"
                    : "Strong password!"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-organization">Organization Name *</Label>
              <Input
                id="signup-organization"
                type="text"
                placeholder="Your Company Ltd."
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-country">Country *</Label>
              <Select value={country} onValueChange={setCountry} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {BRICS_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-phone">Phone Number *</Label>
              <Input
                id="signup-phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                International format recommended (e.g., +91 9876543210)
              </p>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Account
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <Mail className="w-4 h-4 mr-2" />
              Google
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={switchMode}
                className="text-gold hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          // Google Details Completion Form
          <form onSubmit={handleGoogleDetailsSubmit} className="space-y-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Google Authentication Successful!</p>
                <p>Please complete your profile with additional details to finish registration.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-fullname">Full Name *</Label>
              <Input
                id="google-fullname"
                type="text"
                placeholder="John Doe"
                value={googleFullName}
                onChange={(e) => setGoogleFullName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-email">Email Address *</Label>
              <Input
                id="google-email"
                type="email"
                value={googleEmail}
                readOnly
                disabled
                className="h-11 bg-muted"
              />
              <p className="text-xs text-muted-foreground">From your Google account (cannot be changed)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-password">Create Password *</Label>
              <Input
                id="google-password"
                type="password"
                placeholder="••••••••"
                value={googlePassword}
                onChange={(e) => setGooglePassword(e.target.value)}
                required
                className="h-11"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`h-1 flex-1 rounded ${googlePassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`h-1 flex-1 rounded ${googlePassword.length >= 8 && /[A-Z]/.test(googlePassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`h-1 flex-1 rounded ${googlePassword.length >= 10 && /[A-Z]/.test(googlePassword) && /[0-9]/.test(googlePassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {googlePassword.length === 0 
                    ? "Password must be at least 6 characters" 
                    : googlePassword.length < 6 
                    ? "Too short - add more characters"
                    : googlePassword.length < 8
                    ? "Fair - add uppercase letters for better security"
                    : googlePassword.length < 10 || !/[0-9]/.test(googlePassword)
                    ? "Good - add numbers for strong security"
                    : "Strong password!"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                This allows you to sign in with email/password in the future
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-organization">Organization Name *</Label>
              <Input
                id="google-organization"
                type="text"
                placeholder="Your Company Ltd."
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-phone">Phone Number *</Label>
              <Input
                id="google-phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={googlePhone}
                onChange={(e) => setGooglePhone(e.target.value)}
                required
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                International format recommended (e.g., +91 9876543210)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-country">Country *</Label>
              <Select value={country} onValueChange={setCountry} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {BRICS_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Complete Profile
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              You can later sign in using Google or your email and password
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
