import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const openSignInModal = () => {
    setAuthMode("signin");
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openSignUpModal = () => {
    setAuthMode("signup");
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === "/";

  const navItems = [
    { path: "/", label: t("header.home") },
    { path: "/about", label: t("header.about") },
    { path: "/products", label: t("header.products") },
    { path: "/blog", label: t("header.blog") },
  ];

  return (
    <>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isHomePage
        ? scrolled 
          ? "bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg" 
          : "bg-white/90 backdrop-blur-md border-b border-transparent"
        : scrolled 
          ? "bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-lg" 
          : "bg-background/70 backdrop-blur-md border-b border-transparent"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Globe className="w-9 h-9 text-gold transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-serif text-2xl font-bold text-foreground">
              BRICS<span className="text-gradient-gold">Z</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative text-sm font-medium transition-colors duration-300 py-2",
                  isActive(item.path)
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-slide-in-left" />
                )}
              </Link>
            ))}
              {user && (
                <Link
                  to="/post-product"
                  className={cn(
                    "relative text-sm font-medium transition-colors duration-300 py-2",
                    isActive("/post-product")
                      ? "text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("header.postProduct")}
                  {isActive("/post-product") && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-slide-in-left" />
                  )}
                </Link>
              )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSelector />
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="hover:bg-gold/10 hover:text-gold transition-all duration-300">
                    <User className="w-4 h-4 mr-2" />
                    {t("header.dashboard")}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="hover:border-gold hover:text-gold transition-all duration-300">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("header.logout")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={openSignInModal} className="hover:bg-gold/10 hover:text-gold transition-all duration-300">
                  {t("header.signIn")}
                </Button>
                <Button variant="gold" size="sm" onClick={openSignUpModal} className="hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-glow-gold">
                  {t("header.getStarted")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-border animate-slide-up">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-3 rounded-lg transition-all duration-300",
                    isActive(item.path)
                      ? "bg-gold/10 text-gold font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/post-product"
                  className={cn(
                    "px-4 py-3 rounded-lg transition-all duration-300",
                    isActive("/post-product")
                      ? "bg-gold/10 text-gold font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Post Product
                </Link>
              )}
              <div className="flex flex-col gap-3 px-4 pt-4 mt-4 border-t border-border">
                <div className="px-4">
                  <LanguageSelector />
                </div>
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        {t("header.dashboard")}
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("header.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" onClick={openSignInModal}>
                      {t("header.signIn")}
                    </Button>
                    <Button variant="gold" className="w-full" onClick={openSignUpModal}>
                      {t("header.getStarted")}
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  );
};
