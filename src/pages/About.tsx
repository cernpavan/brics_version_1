import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Globe, Target, Users, Award, TrendingUp, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  const stats = [
    { value: "9", label: t("about.stats.countries"), icon: Globe },
    { value: "3.2B+", label: t("about.stats.population"), icon: Users },
    { value: "$28T+", label: t("about.stats.gdp"), icon: TrendingUp },
    { value: "1000+", label: t("about.stats.traders"), icon: Award },
  ];


  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/10 via-gold/5 to-navy/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/20 text-gold mb-6 animate-scale-in">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-semibold">{t("about.badge")}</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {t("about.title")}
              <span className="block text-gradient-gold mt-2">{t("about.titleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
              {t("about.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-8 bg-card rounded-2xl border border-border hover:border-gold/50 transition-all duration-300 hover-lift text-center animate-scale-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <stat.icon className="w-10 h-10 text-gold mx-auto mb-4" />
                <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="animate-slide-in-left">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
                  {t("about.mission.title")}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {t("about.mission.description1")}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {t("about.mission.description2")}
                </p>
                <Link to="/products">
                  <Button variant="gold" size="lg" className="hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-glow-gold">
                    {t("about.mission.cta")}
                  </Button>
                </Link>
              </div>
              <div className="relative animate-slide-in-right">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-gold/20 via-navy/20 to-gold/20 p-8">
                  <div className="w-full h-full rounded-2xl bg-card border border-border flex items-center justify-center">
                    <Globe className="w-32 h-32 text-gold animate-float" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("about.values.title")} <span className="text-gradient-gold">{t("about.values.titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("about.values.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: t("about.values.trust.title"),
                description: t("about.values.trust.description"),
              },
              {
                icon: Globe,
                title: t("about.values.connectivity.title"),
                description: t("about.values.connectivity.description"),
              },
              {
                icon: Zap,
                title: t("about.values.efficiency.title"),
                description: t("about.values.efficiency.description"),
              },
              {
                icon: Target,
                title: t("about.values.focus.title"),
                description: t("about.values.focus.description"),
              },
            ].map((value, i) => (
              <div
                key={i}
                className="p-8 bg-card rounded-2xl border border-border hover:border-gold/50 transition-all duration-300 hover-lift animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-all duration-300">
                  <value.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Philosophy Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("about.philosophy.title")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("about.philosophy.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: t("about.philosophy.innovation.name"),
                role: t("about.philosophy.innovation.role"),
                description: t("about.philosophy.innovation.description"),
              },
              {
                name: t("about.philosophy.collaboration.name"),
                role: t("about.philosophy.collaboration.role"),
                description: t("about.philosophy.collaboration.description"),
              },
              {
                name: t("about.philosophy.excellence.name"),
                role: t("about.philosophy.excellence.role"),
                description: t("about.philosophy.excellence.description"),
              },
            ].map((member, i) => (
              <div
                key={i}
                className="p-8 bg-gradient-to-br from-card to-muted/30 rounded-2xl border border-border hover:border-gold/50 transition-all duration-300 hover-lift text-center animate-scale-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <h3 className="font-serif text-2xl font-bold text-gold mb-2">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground font-semibold mb-4">
                  {member.role}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-navy via-navy-light to-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gold rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              {t("about.cta.title")}
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              {t("about.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button
                  variant="gold"
                  size="lg"
                  className="hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-glow-gold"
                >
                  {t("about.cta.getStarted")}
                </Button>
              </Link>
              <Link to="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  {t("about.cta.browseProducts")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;


