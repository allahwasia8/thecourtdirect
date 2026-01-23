import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Building2, Phone, ArrowRight, Loader2 } from "lucide-react";
import { Court } from "@/types/court";

const FindCourt = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedState, setSelectedState] = useState("All States");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await fetch('/data/courts.json');
        if (!response.ok) throw new Error('Failed to load courts');
        const data = await response.json();
        setCourts(data);
      } catch (err) {
        setError('Failed to load courts. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []);

  // Extract specific unique types from all arrays of types
  const courtTypes = ["All Types", ...new Set(courts.flatMap(c => c.types))].sort();
  const states = ["All States", ...new Set(courts.map(c => c.state).filter(Boolean))].sort();

  const filteredCourts = courts.filter((court) => {
    const matchesSearch =
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All Types" || court.types.includes(selectedType);
    const matchesState = selectedState === "All States" || court.state === selectedState;
    return matchesSearch && matchesType && matchesState;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourts.length / ITEMS_PER_PAGE);
  const paginatedCourts = filteredCourts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedState]);

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
      {/* Hero Section */}
      <section className="bg-navy-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-6">
              Find a <span className="text-gradient-gold">Courtroom</span>
            </h1>
            <p className="text-cream/80 text-lg mb-8">
              Search our comprehensive database to find courtrooms across the United States.
            </p>

            {/* Search Bar */}
            <div className="bg-card rounded-xl p-4 shadow-elegant">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by court name, city, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-[180px] h-12">
                    <SelectValue placeholder="Court Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {courtTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-full md:w-[140px] h-12">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {filteredCourts.length} Court{filteredCourts.length !== 1 ? "s" : ""} Found
            </h2>
          </div>

          {error ? (
            <div className="text-center py-16 text-red-500">{error}</div>
          ) : filteredCourts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCourts.map((court) => (
                  <Link
                    key={court.id}
                    to={`/court/${court.id}`}
                    className="group bg-card rounded-xl shadow-elegant p-6 hover:shadow-gold-glow transition-all duration-300 border border-transparent hover:border-gold/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-navy flex items-center justify-center group-hover:bg-gold transition-colors">
                        <Building2 className="w-6 h-6 text-gold group-hover:text-navy transition-colors" />
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[65%]">
                        {court.types.slice(0, 2).map((type, idx) => (
                          <span key={idx} className="text-[10px] font-medium px-2 py-0.5 bg-muted rounded-full text-muted-foreground truncate max-w-full">
                            {type}
                          </span>
                        ))}
                        {court.types.length > 2 && (
                           <span className="text-[10px] font-medium px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                             +{court.types.length - 2} more
                           </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-gold transition-colors line-clamp-2">
                      {court.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {court.building}
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-gold" />
                        <span>
                          {court.address}{court.city ? `, ${court.city}` : ''}{court.state ? `, ${court.state}` : ''} {court.zip}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gold" />
                        <span>{court.phone}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-sm text-gold font-medium">View Details</span>
                      <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-24"
                  >
                    Previous
                  </Button>
                  <div className="text-sm font-medium text-muted-foreground">
                    Page <span className="text-foreground">{currentPage}</span> of <span className="text-foreground">{totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-24"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                No Courts Found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("All Types");
                  setSelectedState("All States");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default FindCourt;
