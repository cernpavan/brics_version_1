import { Link } from "react-router-dom";
import { MapPin, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  unit: string;
  category?: string;
  country_origin?: string;
  image_url?: string;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  currency,
  quantity,
  unit,
  category,
  country_origin,
  image_url,
}: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`}>
      <article className="group bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gold/30 hover:-translate-y-1">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          {category && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              {category}
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1 group-hover:text-gold transition-colors">
            {name}
          </h3>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="text-2xl font-bold text-foreground">
                {currency} {price.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                / {unit}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {quantity.toLocaleString()} available
            </span>
          </div>
          
          {country_origin && (
            <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{country_origin}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};
