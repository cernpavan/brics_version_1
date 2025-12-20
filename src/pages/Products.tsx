import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilters } from "@/components/SearchFilters";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string | null;
  quantity: number;
  unit: string | null;
  category: string | null;
  country_origin: string | null;
  image_url: string | null;
  primary_image?: string | null; // Primary image from product_images table
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch products with their primary images
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images!inner(
            image_url,
            is_primary
          )
        `)
        .eq('product_images.is_primary', true)
        .order("created_at", { ascending: false });

      if (error) {
        // If error (no images), fetch products without images
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (productsError) throw productsError;
        
        // Fetch images separately for each product
        const productsWithImages = await Promise.all(
          (productsData || []).map(async (product) => {
            const { data: images } = await supabase
              .from("product_images")
              .select("image_url")
              .eq("product_id", product.id)
              .eq("is_primary", true)
              .single();
            
            return {
              ...product,
              primary_image: images?.image_url || product.image_url || null,
            };
          })
        );
        
        setProducts(productsWithImages);
        return;
      }

      // Map the data to include primary image
      const productsWithImages = data.map((product: any) => ({
        ...product,
        primary_image: product.product_images?.[0]?.image_url || product.image_url || null,
      }));

      setProducts(productsWithImages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory;
    
    const matchesCountry =
      selectedCountry === "All Countries" ||
      product.country_origin === selectedCountry;

    return matchesSearch && matchesCategory && matchesCountry;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Product Marketplace
          </h1>
          <p className="text-muted-foreground">
            Discover products from verified BRICS exporters
          </p>
        </div>

        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description || undefined}
                price={Number(product.price)}
                currency={product.currency || "USD"}
                quantity={product.quantity}
                unit={product.unit || "units"}
                category={product.category || undefined}
                country_origin={product.country_origin || undefined}
                image_url={product.primary_image || product.image_url || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery || selectedCategory !== "All Categories" || selectedCountry !== "All Countries"
                ? "Try adjusting your search filters"
                : "Be the first to list a product on the marketplace"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
