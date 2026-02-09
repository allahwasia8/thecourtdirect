import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { generateBreadcrumbSchema } from "@/utils/schemaGenerator";
import { Court } from "@/types/court";
import { Building2, MapPin, Phone, ArrowRight, Loader2, Scale } from "lucide-react";

const StateDirectory = () => {
  const { state } = useParams<{ state: string }>();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  const stateNames: { [key: string]: string } = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
    "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
    "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
    "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
  };

  const stateName = state ? stateNames[state.toUpperCase()] || state : state;

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await fetch('/data/courts.json');
        if (!response.ok) throw new Error('Failed to load courts');
        const data: Court[] = await response.json();
        const stateCourts = data.filter(c => c.state?.toUpperCase() === state?.toUpperCase());
        setCourts(stateCourts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, [state]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={`Courts in ${stateName} | ${stateName} Court Directory`}
        description={`Find addresses, phone numbers, and contact information for all courts in ${stateName}. Our comprehensive directory lists federal, state, and local courtrooms in ${stateName}.`}
        url={`/courts/${state}`}
        schema={generateBreadcrumbSchema([
          { name: 'Home', item: '/' },
          { name: 'Directory', item: '/directory' },
          { name: stateName, item: `/courts/${state}` }
        ])}
      />

      <section className="bg-navy-gradient py-16">
        <div className="container mx-auto px-4">
          <Link to="/directory" className="text-gold hover:text-cream transition-colors text-sm mb-4 inline-block">
            ← Back to Directory
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-cream">
            Courts in <span className="text-gradient-gold">{stateName}</span>
          </h1>
          <p className="text-cream/70 mt-4 max-w-2xl">
            Showing {courts.length} court locations in {stateName}. Select a court to view detailed information, 
            maps, and official resources.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {courts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courts.map((court) => (
                <Link
                  key={court.id}
                  to={`/court/${court.id}`}
                  className="group bg-card rounded-xl shadow-elegant p-6 hover:shadow-gold-glow transition-all duration-300 border border-transparent hover:border-gold/20 flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center group-hover:bg-gold transition-colors">
                      <Building2 className="w-5 h-5 text-gold group-hover:text-navy transition-colors" />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-gold transition-colors line-clamp-2">
                    {court.name}
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-gold" />
                      <span>{court.address}, {court.city}, {court.zip}</span>
                    </div>
                    {court.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gold" />
                        <span>{court.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between group">
                    <span className="text-sm text-gold font-medium">View Details</span>
                    <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
              <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-foreground">No Courts Found</h3>
              <p className="text-muted-foreground mt-2">We couldn't find any court records for {stateName}.</p>
              <Link to="/directory" className="mt-6 inline-block text-gold hover:underline">
                Back to Directory
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default StateDirectory;
