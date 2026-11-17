import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy text-cream">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col gap-4">
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
              Making legal affairs accessible and courtroom navigation easier. Browse our{" "}
              <Link to="/directory" className="text-gold hover:underline">
                National Court Directory
              </Link>{" "}
              to find information by state.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-gold">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Home
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
              <li>
                <Link to="/write-for-us-law" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Write for Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-gold">Resources</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/blog" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Legal Articles
                </Link>
              </li>
              <li>
                <Link to="/directory" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Browse by State
                </Link>
              </li>
              <li>
                <Link to="/legal-terms" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Legal Terminology
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-gold">Contact Us</h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3 text-cream/70 text-sm">
                <Mail className="w-4 h-4 text-gold" />
                <a href="mailto:Thecourtdirect@gmail.com" className="hover:text-gold transition-colors">
                  Thecourtdirect@gmail.com
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-cream/70 hover:text-gold transition-colors text-sm">
                  Contact form
                </Link>
              </li>
            </ul>
            <p className="text-cream/50 text-xs mt-4 leading-relaxed">
              Information on this site is for general educational purposes only and is not legal advice.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} The Court Direct. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
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
