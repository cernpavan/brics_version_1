import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Share2, ArrowLeft, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const BlogDetail = () => {
  const { id } = useParams();

  // In a real app, this would fetch from an API based on the id
  const post = {
    id: parseInt(id || "1"),
    title: "The Future of BRICS+ Trade: Opportunities in 2025",
    content: `
      <p>The BRICS+ alliance represents one of the most dynamic economic groups in the world today, encompassing Brazil, Russia, India, China, South Africa, and several new member nations. As we look toward 2025, the landscape of international trade within this bloc is evolving rapidly, presenting unprecedented opportunities for businesses of all sizes.</p>

      <h2>The Digital Revolution in Cross-Border Trade</h2>
      <p>Digital transformation is reshaping how businesses conduct international trade. E-commerce platforms, digital payment systems, and blockchain technology are making it easier than ever for companies to connect across borders. BRICSZ is at the forefront of this revolution, providing a seamless digital marketplace that connects exporters and importers across all BRICS+ nations.</p>

      <h2>Emerging Market Trends</h2>
      <p>Several key trends are shaping the future of BRICS+ trade:</p>
      <ul>
        <li><strong>Green Technology:</strong> Increased demand for sustainable and eco-friendly products</li>
        <li><strong>Digital Services:</strong> Growing trade in software, IT services, and digital solutions</li>
        <li><strong>Agricultural Innovation:</strong> Advanced farming technologies and organic products</li>
        <li><strong>Manufacturing Excellence:</strong> High-quality manufactured goods at competitive prices</li>
      </ul>

      <h2>Breaking Down Trade Barriers</h2>
      <p>Traditional challenges in international trade, such as language barriers, complex regulations, and trust issues, are being addressed through innovative digital solutions. Our platform provides:</p>
      <ul>
        <li>Verified trader profiles to ensure credibility</li>
        <li>Multi-language support for seamless communication</li>
        <li>Comprehensive documentation assistance</li>
        <li>Secure payment processing</li>
      </ul>

      <h2>Opportunities in Specific Sectors</h2>
      <p>Certain sectors are experiencing particularly strong growth within BRICS+ trade. Technology products, agricultural commodities, textiles, automotive parts, and construction materials are seeing increased demand across member nations. Businesses operating in these sectors have significant opportunities for expansion.</p>

      <h2>Building Strong Trade Relationships</h2>
      <p>Success in international trade goes beyond just finding buyers or suppliers. It requires building lasting relationships based on trust, reliability, and mutual benefit. BRICSZ facilitates these connections by providing a platform where businesses can not only transact but also communicate, share feedback, and build their reputations within the trading community.</p>

      <h2>Looking Ahead</h2>
      <p>As BRICS+ continues to grow and evolve, the opportunities for businesses will only increase. The expansion of the bloc to include new member nations opens up fresh markets and new possibilities. Companies that position themselves now to take advantage of these opportunities will be well-placed to thrive in the coming years.</p>

      <p>Whether you're an established exporter looking to expand into new markets or a growing business seeking reliable suppliers, BRICSZ provides the tools, connections, and support you need to succeed in the dynamic world of BRICS+ international trade.</p>
    `,
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200",
    category: "Trade Insights",
    date: "December 20, 2024",
    readTime: "8 min read",
    author: "BRICSZ Team",
    authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=BRICSZTeam",
  };

  const relatedPosts = [
    {
      id: 2,
      title: "How to Successfully Export Products to BRICS Countries",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400",
      category: "Export Guide",
      readTime: "6 min read",
    },
    {
      id: 3,
      title: "Understanding Trade Finance in Emerging Markets",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400",
      category: "Finance",
      readTime: "5 min read",
    },
    {
      id: 4,
      title: "Digital Transformation in B2B Marketplaces",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      category: "Technology",
      readTime: "7 min read",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Link>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 animate-fade-in">
              <span className="px-4 py-2 bg-gold/10 text-gold rounded-full font-semibold">
                {post.category}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>

            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-8 animate-fade-in leading-tight" style={{ animationDelay: '0.1s' }}>
              {post.title}
            </h1>

            <div className="flex items-center justify-between mb-8 pb-8 border-b border-border animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3">
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-foreground">{post.author}</div>
                  <div className="text-sm text-muted-foreground">Author</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="hover:border-gold hover:text-gold transition-all">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl aspect-video animate-scale-in">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <article
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-ul:text-muted-foreground prose-ul:leading-relaxed
                prose-li:mb-2
                prose-strong:text-foreground prose-strong:font-semibold
                animate-fade-in"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-serif text-3xl font-bold text-foreground mb-4">
              Ready to Start Trading?
            </h3>
            <p className="text-muted-foreground mb-8">
              Join thousands of traders already buying and selling on BRICSZ.
            </p>
            <Link to="/">
              <Button
                variant="gold"
                size="lg"
                className="hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-glow-gold"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="font-serif text-3xl font-bold text-foreground mb-8">
              Related Articles
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, i) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="bg-card rounded-2xl border border-border hover:border-gold/50 transition-all duration-300 hover-lift overflow-hidden">
                    <div className="relative overflow-hidden aspect-video">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="px-3 py-1 bg-gold/10 text-gold rounded-full font-semibold">
                          {relatedPost.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {relatedPost.readTime}
                        </div>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-foreground group-hover:text-gold transition-colors duration-300 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogDetail;


