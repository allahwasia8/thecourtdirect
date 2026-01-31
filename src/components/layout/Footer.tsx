import { Link } from "react-router-dom";
import { Scale, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy text-cream">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/Court-Direct-Logo-White-lines.png.webp" 
                alt="CourtDirect Logo" 
                className="h-10 w-auto object-contain" 
                loading="lazy"
              />
              <span className="font-serif text-xl font-bold">
                The Court<span className="text-gold">Direct</span>
              </span>
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed">
              Making legal affairs accessible and courtroom navigation easy for everyone. 
              Your trusted guide to the judicial system.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/write-for-us-law" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Write for Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/find-court" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Find a Courtroom
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Legal Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-gold">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Legal Articles
                </Link>
              </li>
              <li>
                <Link to="/find-court" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Court Directory
                </Link>
              </li>
              <li>
                <Link to="/legal-terms" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Legal Terminology
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-gold">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-cream/70 text-sm">
                <Mail className="w-4 h-4 text-gold" />
                <Link to="/contact" className="hover:text-gold transition-colors">
                  Thecourtdirect@gmail.com
                </Link>
              </li>
              <li className="flex items-center gap-3 text-cream/70 text-sm">
                <Phone className="w-4 h-4 text-gold" />
                <span>+1 (202) 555-0123</span>
              </li>
              <li className="flex items-start gap-3 text-cream/70 text-sm">
                <MapPin className="w-4 h-4 text-gold mt-0.5" />
                <span>123 Justice Way<br />Washington, DC 20001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cream/10">
            <div className="text-center md:text-left">
              <p className="text-cream/50 text-sm">
                © {new Date().getFullYear()} The Court Direct.
              </p>

            </div>
            <div className="flex gap-6">
              <Link to="/about" className="text-cream/50 hover:text-gold transition-colors text-sm">
                About Us
              </Link>
              <Link to="/contact" className="text-cream/50 hover:text-gold transition-colors text-sm">
                Contact
              </Link>
              <Link to="/privacy-policy" className="text-cream/50 hover:text-gold transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-cream/50 hover:text-gold transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-cream/50 hover:text-gold transition-colors text-sm">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
    </footer>
  );
};

export default Footer;
