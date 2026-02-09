import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { generateBreadcrumbSchema } from "@/utils/schemaGenerator";
import { Scale, MapPin, ChevronRight } from "lucide-react";

const Directory = () => {
  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
    "Wisconsin", "Wyoming"
  ];

  const stateAbbreviations: { [key: string]: string } = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
    "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
    "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
    "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
    "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
  };

  return (
    <Layout>
      <SEO 
        title="Browse Courts by State | United States Court Directory"
        description="Browse our comprehensive directory of courts across the United States. Select a state to find federal, state, and local court information, addresses, and contact details."
        url="/directory"
        schema={generateBreadcrumbSchema([
          { name: 'Home', item: '/' },
          { name: 'Directory', item: '/directory' }
        ])}
      />
      
      <section className="bg-navy-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="w-6 h-6 text-gold" />
            <span className="text-gold font-medium text-sm uppercase tracking-wider">
              Court Directory
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-6">
            Browse Courts by <span className="text-gradient-gold">State</span>
          </h1>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto">
            Find addresses, contact information, and judicial resources for every court in the United States.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {states.map((state) => (
              <Link
                key={state}
                to={`/courts/${stateAbbreviations[state]}`}
                className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-gold hover:shadow-gold-glow transition-all group"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span className="font-medium text-foreground group-hover:text-gold transition-colors">
                    {state}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Directory;
