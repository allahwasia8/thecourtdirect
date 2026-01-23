import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { Scale, Search, BookOpen, Building2, Users, Shield, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-courthouse.webp";
import { Helmet } from "react-helmet-async";
import { teamMembers } from "@/data/team";

const Index = () => {
  const features = [
    {
      icon: Search,
      title: "Find Your Court",
      description: "Search and locate courtrooms across the country with detailed information and directions.",
    },
    {
      icon: BookOpen,
      title: "Legal Resources",
      description: "Access comprehensive guides and articles to understand legal procedures and terminology.",
    },
    {
      icon: Building2,
      title: "Court Information",
      description: "Get detailed information about court types, jurisdictions, and operating hours.",
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Navigate the legal system with confidence using our curated resources and tools.",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Courts Listed" },
    { value: "50", label: "States Covered" },
    { value: "1M+", label: "Users Helped" },
    { value: "24/7", label: "Access Available" },
  ];

  return (
    <Layout>
      <Helmet>
        <title>The Court Direct | Find Your Courtroom & Legal Resources</title>
        <meta name="description" content="Navigate the judicial system with confidence. Find courtrooms, access legal resources, and understand procedures—all in one place." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "The Court Direct",
            "url": "https://thecourtdirect.com",
            "logo": "https://thecourtdirect.com/Court-Direct-Logo-White-lines.webp.webp",
            "sameAs": [
              "https://www.facebook.com/thecourtdirect", 
              "https://twitter.com/thecourtdirect"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-202-555-0123",
              "contactType": "Customer Service"
            }
          })}
        </script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Courthouse"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/60" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-12 bg-gold" />
              <span className="text-gold font-medium text-sm uppercase tracking-wider">
                Your Legal Navigator
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-cream leading-tight mb-6">
              Courtroom & Legal Affairs{" "}
              <span className="text-gradient-gold">Made Easy</span> for Everyone
            </h1>
            <p className="text-cream/80 text-lg md:text-xl leading-relaxed mb-8">
              Navigate the judicial system with confidence. Find courtrooms, access legal resources, 
              and understand procedures—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/find-court">
                  <Search className="w-5 h-5" />
                  Find a Courtroom
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/blog">
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-navy py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-serif text-3xl md:text-4xl font-bold text-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-cream/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Scale className="w-6 h-6 text-gold" />
              <span className="text-gold font-medium text-sm uppercase tracking-wider">
                Our Mission
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-6">
              Democratizing Access to Justice
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              At The Court Direct, we believe that understanding the legal system should not require 
              a law degree. Our mission is to bridge the gap between citizens and the courts, 
              making legal information accessible, understandable, and actionable for everyone.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl shadow-elegant hover:shadow-gold-glow transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-navy flex items-center justify-center mb-4 group-hover:bg-gold transition-colors">
                  <feature.icon className="w-6 h-6 text-gold group-hover:text-navy transition-colors" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-gold" />
                <span className="text-gold font-medium text-sm uppercase tracking-wider">
                  Why The Court Direct
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                Trusted by Millions Navigating the Legal System
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Whether you're appearing in court for the first time, researching legal procedures, 
                or simply need to find a courthouse, The Court Direct provides the tools and information 
                you need to navigate with confidence.
              </p>
              <ul className="space-y-4">
                {[
                  "Comprehensive court database covering all 50 states",
                  "Easy-to-understand legal guides and articles",
                  "Real-time court information and directions",
                  "Free access to essential legal resources",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button variant="navy" size="lg" asChild>
                  <Link to="/find-court">
                    Start Your Search
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-navy-gradient p-8 flex items-center justify-center">
                <Scale className="w-48 h-48 text-gold/20" />
                <div className="absolute inset-8 rounded-xl border-2 border-gold/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Experts Section */}
      <section className="py-20 bg-cream/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
               <Users className="w-6 h-6 text-gold" />
               <span className="text-gold font-medium text-sm uppercase tracking-wider">
                 Our Experts
               </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">
              Authorized Legal Professionals
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Content verified by experienced attorneys and legal consultants.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-gold-glow transition-all duration-300 group">
                <div className="flex items-center p-6 gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold/20 shrink-0">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div>
                     <h3 className="font-serif text-xl font-bold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-gold text-sm font-medium uppercase tracking-wider mb-2">
                      {member.role}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.badges.slice(0, 1).map((badge, bIdx) => (
                        <span key={bIdx} className="bg-navy/5 text-navy text-[10px] font-bold px-2 py-0.5 rounded-full border border-navy/10">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
             <Button variant="outline" asChild>
                <Link to="/about">Meet the Full Team</Link>
             </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cream mb-6">
            Ready to Find Your Courtroom?
          </h2>
          <p className="text-cream/80 text-lg mb-8 max-w-2xl mx-auto">
            Start your search today and access comprehensive court information, 
            directions, and resources—all for free.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/find-court">
              <Search className="w-5 h-5" />
              Search Courts Now
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
