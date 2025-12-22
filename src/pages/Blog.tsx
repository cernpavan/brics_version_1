import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Blog = () => {
  const { t } = useTranslation();
  const featuredPost = {
    id: 1,
    title: "The Future of BRICS+ Trade: Opportunities in 2025",
    excerpt: "Exploring the emerging trade opportunities and digital transformation within BRICS+ nations as we move into a new era of economic cooperation.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
    category: "Trade Insights",
    date: "December 20, 2024",
    readTime: "8 min read",
    author: "BRICSZ Team",
  };

  const blogPosts = [
    {
      id: 2,
      title: "How to Successfully Export Products to BRICS Countries",
      excerpt: "A comprehensive guide on navigating export regulations, documentation, and best practices for trading with BRICS nations.",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600",
      category: "Export Guide",
      date: "December 18, 2024",
      readTime: "6 min read",
      author: "Trade Expert",
    },
    {
      id: 3,
      title: "Understanding Trade Finance in Emerging Markets",
      excerpt: "Key insights into financing options, payment terms, and risk management for international trade in BRICS+ countries.",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600",
      category: "Finance",
      date: "December 15, 2024",
      readTime: "5 min read",
      author: "Finance Advisor",
    },
    {
      id: 4,
      title: "Digital Transformation in B2B Marketplaces",
      excerpt: "How technology is revolutionizing cross-border trade and what it means for businesses in BRICS nations.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
      category: "Technology",
      date: "December 12, 2024",
      readTime: "7 min read",
      author: "Tech Analyst",
    },
    {
      id: 5,
      title: "Success Stories: Brazilian Exporters in Asian Markets",
      excerpt: "Real case studies of Brazilian businesses successfully expanding into China and India through BRICSZ.",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600",
      category: "Success Stories",
      date: "December 10, 2024",
      readTime: "4 min read",
      author: "Case Study Team",
    },
    {
      id: 6,
      title: "Sustainable Trade Practices in BRICS Nations",
      excerpt: "Exploring eco-friendly trade initiatives and sustainable business practices across BRICS+ countries.",
      image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600",
      category: "Sustainability",
      date: "December 8, 2024",
      readTime: "6 min read",
      author: "Sustainability Expert",
    },
    {
      id: 7,
      title: "Navigating Cultural Differences in International Trade",
      excerpt: "Essential tips for building strong business relationships across diverse BRICS cultures and markets.",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600",
      category: "Business Culture",
      date: "December 5, 2024",
      readTime: "5 min read",
      author: "Cultural Advisor",
    },
  ];

  const categories = [
    t("blog.categories.all"),
    t("blog.categories.trade"),
    t("blog.categories.export"),
    t("blog.categories.finance"),
    t("blog.categories.tech"),
    t("blog.categories.stories"),
    t("blog.categories.sustainability"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/10 via-gold/5 to-navy/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/20 text-gold mb-6 animate-scale-in">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{t("blog.badge")}</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {t("blog.title")}
              <span className="block text-gradient-gold mt-2">{t("blog.titleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
              {t("blog.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Link to={`/blog/${featuredPost.id}`} className="group">
              <div className="grid md:grid-cols-2 gap-8 p-8 bg-card rounded-3xl border border-border hover:border-gold/50 transition-all duration-300 hover-lift overflow-hidden">
                <div className="relative overflow-hidden rounded-2xl aspect-video md:aspect-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-gold text-navy text-xs font-bold rounded-full">
                      {t("blog.featured")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-semibold">
                      {featuredPost.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredPost.date}
                    </div>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-gold transition-colors duration-300">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </div>
                    <div className="flex items-center gap-2 text-gold font-semibold group-hover:gap-4 transition-all duration-300">
                      {t("blog.readMore")}
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category, i) => (
                <button
                  key={i}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    i === 0
                      ? "bg-gold text-navy shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-gold/10 hover:text-gold"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, i) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="bg-card rounded-2xl border border-border hover:border-gold/50 transition-all duration-300 hover-lift overflow-hidden">
                    <div className="relative overflow-hidden aspect-video">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="px-3 py-1 bg-gold/10 text-gold rounded-full font-semibold">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </div>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-foreground mb-3 group-hover:text-gold transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                        <div className="flex items-center gap-2 text-gold text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                          Read
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-gradient-to-br from-navy via-navy-light to-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gold rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              {t("blog.newsletter.title")}
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              {t("blog.newsletter.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <input
                type="email"
                placeholder={t("blog.newsletter.placeholder")}
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold transition-colors"
              />
              <Button
                variant="gold"
                size="lg"
                className="hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-glow-gold"
              >
                {t("blog.newsletter.subscribe")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;


