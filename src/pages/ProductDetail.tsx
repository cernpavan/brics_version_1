import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Package, 
  MapPin, 
  Mail, 
  Phone, 
  Building2, 
  ArrowLeft,
  Calendar 
} from "lucide-react";

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
  created_at: string;
  exporter_id: string;
}

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Profile {
  full_name: string | null;
  company_name: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [exporter, setExporter] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (productError) throw productError;
      if (!productData) {
        setProduct(null);
        return;
      }

      setProduct(productData);

      // Fetch product images
      const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order", { ascending: true });

      if (!imagesError && imagesData) {
        setProductImages(imagesData);
      }

      // Fetch exporter profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, company_name, country, phone, email")
        .eq("user_id", productData.exporter_id)
        .maybeSingle();

      if (!profileError && profileData) {
        setExporter(profileData);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            Product Not Found
          </h1>
          <Link to="/products">
            <Button variant="outline">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
              {productImages.length > 0 ? (
                <img
                  src={productImages[0].image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <div 
                    key={image.id}
                    className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity border-2 border-transparent hover:border-gold"
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {product.category && (
                  <Badge className="mb-3 bg-primary text-primary-foreground">
                    {product.category}
                  </Badge>
                )}
                <h1 className="font-serif text-4xl font-bold text-foreground">
                  {product.name}
                </h1>
              </div>
            </div>

            {product.country_origin && (
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="w-4 h-4" />
                <span>{product.country_origin}</span>
              </div>
            )}

            <div className="mb-8">
              <span className="text-4xl font-bold text-foreground">
                {product.currency || "USD"} {Number(product.price).toLocaleString()}
              </span>
              <span className="text-muted-foreground ml-2">
                per {product.unit || "unit"}
              </span>
            </div>

            <div className="flex items-center gap-6 mb-8 p-4 bg-muted rounded-xl">
              <div>
                <div className="text-sm text-muted-foreground">Available Quantity</div>
                <div className="text-xl font-semibold text-foreground">
                  {product.quantity.toLocaleString()} {product.unit || "units"}
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="text-sm text-muted-foreground">Listed On</div>
                <div className="flex items-center gap-1 text-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(product.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {product.description && (
              <div className="mb-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
                  Description
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Exporter Contact */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                Contact Exporter
              </h2>
              
              <div className="space-y-3">
                {exporter?.full_name && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="text-foreground font-medium">
                        {exporter.full_name}
                      </div>
                    </div>
                  </div>
                )}

                {exporter?.company_name && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Company</div>
                      <div className="text-foreground font-medium">
                        {exporter.company_name}
                      </div>
                    </div>
                  </div>
                )}

                {exporter?.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <a 
                        href={`mailto:${exporter.email}`}
                        className="text-foreground font-medium hover:text-gold transition-colors"
                      >
                        {exporter.email}
                      </a>
                    </div>
                  </div>
                )}

                {exporter?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <a 
                        href={`tel:${exporter.phone}`}
                        className="text-foreground font-medium hover:text-gold transition-colors"
                      >
                        {exporter.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {exporter?.email && (
                <a href={`mailto:${exporter.email}?subject=Inquiry about ${product.name}`}>
                  <Button variant="gold" size="lg" className="w-full mt-6">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
};

export default ProductDetail;
