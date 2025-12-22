import { Link } from "react-router-dom";
import { Globe, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-gold" />
              <span className="font-serif text-lg font-semibold">
                BRICS<span className="text-gold">Z</span>
              </span>
            </div>
            <a
              href="mailto:bricsz.com@gmail.com"
              className="text-primary-foreground/80 hover:text-gold transition-colors text-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              bricsz.com@gmail.com
            </a>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="mailto:bricsz.com@gmail.com"
                className="text-primary-foreground/80 hover:opacity-70 transition-opacity"
                aria-label="Gmail"
              >
                <img src="/gmail-icon.svg" alt="Gmail" className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com/bricsz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:opacity-70 transition-opacity"
                aria-label="Instagram"
              >
                <img src="/instagram-icon.svg" alt="Instagram" className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com/company/bricsz"
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
            © 2025 BRICSZ. Connecting global markets.
          </p>
        </div>
      </div>
    </footer>
  );
};




