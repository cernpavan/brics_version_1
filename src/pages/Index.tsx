import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Mail, Shield, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "google-details">("signup");

  // Check for Google OAuth callback and incomplete profile
  useEffect(() => {
    const checkGoogleAuthAndProfile = async () => {
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
            setAuthMode("google-details");
            setAuthModalOpen(true);
          }
        }
      }
    };

    checkGoogleAuthAndProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
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
            setAuthMode("google-details");
            setAuthModalOpen(true);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openSignUpModal = (mode: "signin" | "signup" = "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 pt-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground mb-8 animate-fade-in">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Connecting BRICS Economies</span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Trade Across
              <span className="block text-gradient-gold">BRICS Nations</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              The premier B2B marketplace connecting exporters and buyers across Brazil, Russia, India, China, and South Africa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button variant="gold" size="xl" className="w-full sm:w-auto" onClick={() => openSignUpModal("signup")}>
                Start Trading
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/products">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Browse Products
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {[
                { value: "9", label: "BRICS+ Countries" },
                { value: "1000+", label: "Products" },
                { value: "500+", label: "Traders" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Why Choose BRICSTrade?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simplifying international trade between the world's fastest-growing economies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Traders",
                description: "All users go through our verification process to ensure quality and reliability.",
              },
              {
                icon: Zap,
                title: "Direct Connection",
                description: "Connect directly with other traders without intermediaries. Save time and costs.",
              },
              {
                icon: Users,
                title: "BRICS Focus",
                description: "Specialized marketplace for the BRICS economic bloc with tailored features.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-card rounded-2xl border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-6">
              Ready to Expand Your Business?
            </h2>
            <p className="text-muted-foreground mb-10">
              Join thousands of traders already buying and selling on BRICSTrade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" onClick={() => openSignUpModal("signup")}>
                Join Now
              </Button>
              <Button variant="outline" size="lg" onClick={() => openSignUpModal("signin")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-gold" />
                <span className="font-serif text-lg font-semibold">
                  BRICS<span className="text-gold">Trade</span>
                </span>
              </div>
              <a
                href="mailto:bricstrade@gmail.com"
                className="text-primary-foreground/80 hover:text-gold transition-colors text-sm flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                bricstrade@gmail.com
              </a>
              <div className="flex items-center gap-4 mt-2">
                <a
                  href="mailto:bricstrade@gmail.com"
                  className="text-primary-foreground/80 hover:opacity-70 transition-opacity"
                  aria-label="Gmail"
                >
                  <img src="/gmail-icon.svg" alt="Gmail" className="w-6 h-6" />
                </a>
                <a
                  href="https://instagram.com/bricstrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:opacity-70 transition-opacity"
                  aria-label="Instagram"
                >
                  <img src="/instagram-icon.svg" alt="Instagram" className="w-6 h-6" />
                </a>
                <a
                  href="https://linkedin.com/company/bricstrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:opacity-70 transition-opacity"
                  aria-label="LinkedIn"
                >
                  <img src="/linkedin-icon.svg" alt="LinkedIn" className="w-6 h-6" />
                </a>
              </div>
            </div>
            <p className="text-primary-foreground/60 text-sm">
              © 2025 BRICSTrade. Connecting global markets.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
