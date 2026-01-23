import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Search, Book } from "lucide-react";
import { legalTerms } from "@/data/legalTerms";
import { toast } from "sonner";

const LegalTerminology = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Get unique starting letters for filter
  const alphabet = useMemo(() => {
    const letters = new Set(legalTerms.map(term => term.term.charAt(0).toUpperCase()));
    return Array.from(letters).sort();
  }, []);

  const filteredTerms = useMemo(() => {
    return legalTerms.filter((item) => {
      const matchesSearch = 
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLetter = selectedLetter 
        ? item.term.charAt(0).toUpperCase() === selectedLetter 
        : true;

      return matchesSearch && matchesLetter;
    });
  }, [searchQuery, selectedLetter]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-navy-gradient py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Book className="w-8 h-8 text-gold" />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-6">
            Legal Terminology
          </h1>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto mb-10">
            A comprehensive guide to understanding common legal terms and definitions.
            Demystify the language of the law.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a term..."
                className="w-full pl-12 pr-4 h-14 bg-white/10 backdrop-blur-md border-white/20 text-cream placeholder:text-cream/50 focus:bg-white/20 transition-all rounded-xl text-lg"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedLetter(null); // Reset letter filter on search
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background min-h-[50vh]">
        <div className="container mx-auto px-4">
          
          {/* Alphabet Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedLetter === null
                  ? "bg-gold text-navy shadow-lg scale-105"
                  : "bg-muted text-muted-foreground hover:bg-gold/20 hover:text-gold"
              }`}
            >
              All
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter === selectedLetter ? null : letter)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  selectedLetter === letter
                    ? "bg-gold text-navy shadow-lg scale-105"
                    : "bg-muted text-muted-foreground hover:bg-gold/20 hover:text-gold"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-center mb-8 text-muted-foreground">
            Showing {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''}
          </div>

          {/* Terms Grid */}
          {filteredTerms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTerms.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => {
                    navigator.clipboard.writeText(item.definition);
                    toast.success("Definition copied to clipboard");
                  }}
                  className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-gold-glow hover:border-gold/30 transition-all duration-300 group flex flex-col h-full cursor-pointer active:scale-95"
                  title="Click to copy definition"
                >
                  <div className="mb-4 pb-3 border-b border-border group-hover:border-gold/20 transition-colors">
                    <h3 className="font-serif text-xl font-bold text-navy group-hover:text-gold transition-colors">
                      {item.term}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed flex-grow">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No terms found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLetter(null);
                }}
                className="mt-4 text-gold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default LegalTerminology;
