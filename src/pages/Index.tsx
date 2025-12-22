import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Shield, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/home_page_X-Design.jpg')`,
          }}
        />
        
        {/* Gradient Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/80" />
        
        {/* Subtle Animated Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 pt-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-morphism text-white mb-8 animate-scale-in hover:scale-105 transition-transform duration-300">
              <Globe className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold tracking-wide">{t("home.badge")}</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 animate-fade-in leading-tight" style={{ animationDelay: '0.1s' }}>
              {t("home.title")}
              <span className="block text-gradient-gold mt-2">{t("home.titleHighlight")}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
              {t("home.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                variant="gold" 
                size="xl" 
                className="w-full sm:w-auto hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-glow-gold" 
                onClick={() => openSignUpModal("signup")}
              >
                {t("home.ctaPrimary")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/products" className="w-full sm:w-auto">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full hover:scale-105 transition-transform duration-300"
                >
                  {t("home.ctaSecondary")}
                </Button>
              </Link>
            </div>

            {/* Stats - Simple Text */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {[
                { value: "9", label: t("home.stats.countries") },
                { value: "3.2B+", label: t("home.stats.population") },
                { value: "500+", label: t("home.stats.traders") },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="text-center"
                  style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                >
                  <div className="text-4xl md:text-6xl font-bold text-gold mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-white/90 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Globe,
                title: t("home.features.global.title"),
                description: t("home.features.global.description"),
                delay: "0s",
              },
              {
                icon: Shield,
                title: t("home.features.secure.title"),
                description: t("home.features.secure.description"),
                delay: "0.1s",
              },
              {
                icon: Zap,
                title: t("home.features.easy.title"),
                description: t("home.features.easy.description"),
                delay: "0.2s",
              },
              {
                icon: Users,
                title: t("home.features.support.title"),
                description: t("home.features.support.description"),
                delay: "0.3s",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-card rounded-2xl border border-border hover:border-gold/50 transition-all duration-300 hover-lift group animate-slide-up"
                style={{ animationDelay: feature.delay }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <feature.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-3 group-hover:text-gold transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("home.testimonials.title")} <span className="text-gradient-gold">{t("home.testimonials.titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("home.testimonials.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Rajesh Kumar",
                company: "Tech Solutions India",
                country: "India 🇮🇳",
                rating: 5,
                text: "BRICSZ has transformed how we do business internationally. The platform is intuitive, secure, and has connected us with reliable partners across Brazil and South Africa.",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
              },
              {
                name: "Maria Santos",
                company: "Brazilian Exports Co.",
                country: "Brazil 🇧🇷",
                rating: 5,
                text: "As an exporter, finding trustworthy buyers in emerging markets was always challenging. BRICSZ solved this problem and our sales have grown by 150% in just 6 months.",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
              },
              {
                name: "Zhang Wei",
                company: "Global Trade Solutions",
                country: "China 🇨🇳",
                rating: 5,
                text: "The verification process and direct communication features give us confidence in every transaction. BRICSZ is truly revolutionizing BRICS trade.",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-8 bg-card rounded-2xl border border-border hover:border-gold/50 transition-all duration-300 hover-lift animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-gold fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-border">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                    <div className="text-xs text-gold font-semibold mt-1">{testimonial.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gold rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              {t("home.cta.title")}
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              {t("home.cta.subtitle")} <span className="text-gold font-semibold">{t("home.cta.brand")}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="gold" 
                size="lg" 
                className="hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-glow-gold"
                onClick={() => openSignUpModal("signup")}
              >
                {t("home.cta.joinNow")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                onClick={() => openSignUpModal("signin")}
              >
                {t("home.cta.signIn")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
