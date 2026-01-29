import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { Scale, Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <SEO 
        title="404 Page Not Found"
        description="The page you are looking for could not be found. Return to our homepage or use our court directory to find the information you need."
      />
      <section className="min-h-[70vh] flex items-center justify-center bg-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Decorative Element */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-navy flex items-center justify-center">
                <Scale className="w-16 h-16 text-gold" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-[120px] font-bold text-navy/5">
                  404
                </span>
              </div>
            </div>

            {/* Content */}
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-4">
              Page Not Found
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              The page you're looking for seems to have been moved, deleted, or doesn't exist. 
              Let us help you find your way.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="navy" size="lg" asChild>
                <Link to="/">
                  <Home className="w-4 h-4" />
                  Go to Homepage
                </Link>
              </Button>
              <Button variant="navyOutline" size="lg" asChild>
                <Link to="/find-court">
                  <Search className="w-4 h-4" />
                  Find a Court
                </Link>
              </Button>
            </div>

            {/* Back Link */}
            <div className="mt-8">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Go back to previous page
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
