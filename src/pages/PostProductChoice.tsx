import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, ArrowRight } from "lucide-react";

const PostProduct = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
            What would you like to do?
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose whether you want to sell a product or post a buying requirement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sell Product Option */}
          <div
            className={`group relative bg-card rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
              hoveredCard === "sell"
                ? "border-gold shadow-xl shadow-gold/20 -translate-y-2"
                : "border-border hover:border-gold/50"
            }`}
            onMouseEnter={() => setHoveredCard("sell")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate("/post-product/sell")}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-8">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <Package className="w-10 h-10 text-gold" />
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-3">
                Sell a Product
              </h2>

              {/* Description */}
              <p className="text-muted-foreground text-center mb-6">
                List products you want to sell or export to the marketplace
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  Upload product images
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  Set your price and quantity
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  Reach buyers across BRICS nations
                </li>
              </ul>

              {/* Button */}
              <Button 
                variant="gold" 
                size="lg" 
                className="w-full group-hover:shadow-lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Request Product Option */}
          <div
            className={`group relative bg-card rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
              hoveredCard === "request"
                ? "border-gold shadow-xl shadow-gold/20 -translate-y-2"
                : "border-border hover:border-gold/50"
            }`}
            onMouseEnter={() => setHoveredCard("request")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate("/post-product/request")}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-8">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <ShoppingCart className="w-10 h-10 text-blue-500" />
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-3">
                Request a Product
              </h2>

              {/* Description */}
              <p className="text-muted-foreground text-center mb-6">
                Post your buying requirements and let sellers come to you
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-8 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Describe what you need
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Set your budget range
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Get offers from multiple sellers
                </li>
              </ul>

              {/* Button */}
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full group-hover:border-blue-500 group-hover:text-blue-500 group-hover:shadow-lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-muted rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">New to the platform?</strong> You can both sell products and post buying requirements. 
            Choose the option that fits your current need.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PostProduct;




