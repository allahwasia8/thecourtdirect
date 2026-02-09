import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Building2,
  ExternalLink,
  Navigation,
  Clock,
  Scale,
  FileText,
  Users,
  Loader2,
} from "lucide-react";
import { Court } from "@/types/court";
import SEO from "@/components/seo/SEO";
import { generateCourthouseSchema, generateBreadcrumbSchema } from "@/utils/schemaGenerator";

const CourtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        const response = await fetch('/data/courts.json');
        if (!response.ok) throw new Error('Failed to load courts');
        const data: Court[] = await response.json();
        const foundCourt = data.find(c => c.id === id);
        if (foundCourt) {
          setCourt(foundCourt);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCourt();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  if (error || !court) {
    return (
      <Layout>
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
              Court Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The court you're looking for doesn't exist in our database.
            </p>
            <Button variant="navy" asChild>
              <Link to="/find-court">
                <ArrowLeft className="w-4 h-4" />
                Back to Search
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const fullAddress = `${court.address}${court.city ? `, ${court.city}` : ''}${court.state ? `, ${court.state}` : ''} ${court.zip}`;
  const mapsUrl = court.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <Layout>
      {court && (

        <SEO 
          title={court.metaTitle || `${court.name} - Court Information`}
          description={court.metaDescription || `Find information for ${court.name} located at ${court.address}, ${court.city}, ${court.state} ${court.zip}. Phone: ${court.phone}.${court.hours ? ` Hours: ${court.hours}.` : ''} ${court.types.join(', ')}.`}
          image={court.imageToShare || undefined}
          preloadImage={court.imageToShare || undefined}
          url={`/court/${id}`}
          schema={[
            generateCourthouseSchema(court),
            generateBreadcrumbSchema([
              { name: 'Home', item: '/' },
              { name: 'Find Court', item: '/find-court' },
              { name: court.name, item: `/court/${id}` }
            ])
          ]}
        />
      )}
      {/* Header */}
      <section className="bg-navy-gradient py-16">
        <div className="container mx-auto px-4">
          <Link
            to="/find-court"
            className="inline-flex items-center gap-2 text-cream/70 hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {court.types.map((type, idx) => (
                      <span key={idx} className="text-xs font-medium px-3 py-1 bg-gold/20 text-gold rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                {court.headquarters && (
                  <span className="text-xs font-medium px-3 py-1 bg-cream/10 text-cream rounded-full">
                    Headquarters
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-cream leading-tight mb-4">
                {court.name}
              </h1>
              <p className="text-cream/80 text-lg">
                {court.building}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="lg" asChild>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </Button>
              {court.website && (
                <Button variant="heroOutline" size="lg" asChild>
                  <a href={court.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="bg-card rounded-xl shadow-elegant p-8">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  About This Court
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {court.description}
                </p>
              </div>

              {/* Useful Links */}
              <div className="bg-card rounded-xl shadow-elegant p-8">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Useful Links for This Location
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {court.website && (
                    <a
                      href={court.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-gold hover:bg-gold/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center group-hover:bg-gold transition-colors">
                        <ExternalLink className="w-5 h-5 text-gold group-hover:text-navy transition-colors" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-gold transition-colors">
                          Visit Court Website
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Official court information
                        </div>
                      </div>
                    </a>
                  )}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-gold hover:bg-gold/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center group-hover:bg-gold transition-colors">
                      <Navigation className="w-5 h-5 text-gold group-hover:text-navy transition-colors" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground group-hover:text-gold transition-colors">
                        Get Directions
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Open in Google Maps
                      </div>
                    </div>
                  </a>
                  {court.litigantsInfoUrl ? (
                    <a
                      href={court.litigantsInfoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-gold hover:bg-gold/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center group-hover:bg-gold transition-colors">
                        <Users className="w-5 h-5 text-gold group-hover:text-navy transition-colors" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-gold transition-colors">
                          Information for Litigants
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Attorneys and self-represented
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-border opacity-50 cursor-not-allowed">
                      <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center">
                        <Users className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Information for Litigants
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Not available
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Court Preparation Guide - Word Count Boost */}
              <div className="bg-card rounded-xl shadow-elegant p-8">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Preparing for Your Visit to {court.name}
                </h2>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">What should I bring?</h4>
                    <p className="text-sm text-muted-foreground">
                      When visiting {court.name}, ensure you have a valid government-issued photo ID. 
                      Bring all relevant legal documents, case numbers, and copies of any filings. 
                      If you are representing yourself, bring a notebook and pen to record important instructions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">What is the dress code?</h4>
                    <p className="text-sm text-muted-foreground">
                      Professional or business casual attire is typically expected in {court.city} courtrooms. 
                      Avoid wearing hats, shorts, or flip-flops. Maintaining a respectful appearance is 
                      important during judicial proceedings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Are electronics allowed?</h4>
                    <p className="text-sm text-muted-foreground">
                      Policies on cell phones and electronics vary by jurisdiction in {court.state}. 
                      Generally, devices must be silenced or turned off inside the courtroom. 
                      Photography and recording are strictly prohibited without prior court authorization.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Arrival and Security</h4>
                    <p className="text-sm text-muted-foreground">
                      Plan to arrive at least 30 minutes before your scheduled hearing at {court.building}. 
                      All visitors must pass through security screening, similar to airport procedures. 
                      Items such as pocket knives, pepper spray, or other potential weapons are strictly forbidden.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-card rounded-xl shadow-elegant p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">{court.building}</div>
                      <div className="text-sm text-muted-foreground">
                        {court.address}
                        <br />
                        {court.city}{court.state ? `, ${court.state}` : ''} {court.zip}
                      </div>
                    </div>
                  </div>
                  {court.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gold" />
                      <a
                        href={`tel:${court.phone}`}
                        className="text-foreground hover:text-gold transition-colors"
                      >
                        {court.phone}
                      </a>
                    </div>
                  )}
                  {court.hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gold mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        {court.hours}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Court Type Card */}
              <div className="bg-cream rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Scale className="w-5 h-5 text-gold" />
                  <h3 className="font-serif text-lg font-semibold text-navy">
                    Court Type
                  </h3>
                </div>
                <p className="text-navy/80 text-sm">
                  {court.types.map((type, idx) => (
                    <span key={idx} className="font-semibold block">{type}</span>
                  ))}
                  {court.headquarters && <span className="block text-xs mt-1 opacity-70">Headquarters</span>}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-navy rounded-xl p-6">
                <h3 className="font-serif text-lg font-semibold text-cream mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button variant="hero" className="w-full" asChild>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  </Button>
                  {court.phone && (
                    <Button variant="heroOutline" className="w-full" asChild>
                      <a href={`tel:${court.phone}`}>
                        <Phone className="w-4 h-4" />
                        Call Court
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CourtDetail;
