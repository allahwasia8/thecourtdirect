import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { generateBreadcrumbSchema } from "@/utils/schemaGenerator";
import { teamMembers } from "@/data/team";
import { Shield, Target, History, Building2, Mail, Award, BookOpen } from "lucide-react";

const AboutUs = () => {
  return (
    <Layout>
      <SEO 
        title="About Us | Legal Experts & Court Resources"
        description="Learn about The Court Direct's mission to democratize access to justice. Meet our experienced legal team, discover our story, and explore how we help navigate the judicial system."
        url="/about"
        schema={generateBreadcrumbSchema([
          { name: 'Home', item: '/' },
          { name: 'About Us', item: '/about' }
        ])}
      />
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="bg-navy-gradient py-20">
        <div className="container mx-auto px-4 text-center text-cream">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-gradient-gold">Us</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-cream/80 leading-relaxed">
            Your trusted partner in navigating the legal system. We democratize access to justice through accurate, comprehensive, and understandable legal information.
          </p>
        </div>
      </section>

      {/* Intro Stats/Trust */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Years of Service", value: "10+", icon: History },
              { label: "Courts Listed", value: "10k+", icon: Building2 },
              { label: "Expert Authors", value: "Verified", icon: Award },
              { label: "Resources", value: "Free", icon: BookOpen },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4">
                <stat.icon className="w-8 h-8 text-gold mb-3" />
                <span className="text-2xl font-serif font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story & Mission */}
      <section className="py-20 bg-cream/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-5 h-5 text-gold" />
                <span className="text-gold font-medium text-sm uppercase tracking-wider">Our Story</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy">
                From Confusion to Clarity
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Court Direct was founded with a simple yet powerful realization: access to legal information shouldn't be a privilege. Navigating court systems, finding addresses, and understanding procedures was often a convoluted maze for the average citizen.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We gathered a team of legal experts, archivists, and technologists to build the most comprehensive, user-friendly court directory and legal resource on the web. Today, we assist millions of users in finding their way to justice.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-gold" />
                <span className="text-gold font-medium text-sm uppercase tracking-wider">What We Do</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy">
                Bridging the Gap
              </h2>
              <ul className="space-y-4">
                {[
                  "Maintain an up-to-date directory of over 10,000 courts nationwide.",
                  "Simplify complex legal terminology into plain English.",
                  "Provide step-by-step guides for common legal procedures.",
                  "Offer free access to essential forms and resources."
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    </div>
                    <span className="text-foreground text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Source Statement */}
      <section className="py-16 bg-navy text-cream text-center">
        <div className="container mx-auto px-4">
          <Shield className="w-12 h-12 text-gold mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold mb-6">A Trusted Source</h2>
          <p className="max-w-2xl mx-auto text-lg text-cream/80 leading-relaxed italic">
            "Our content is rigorously fact-checked by legal professionals. We adhere to the highest standards of accuracy, objectivity, and transparency. While we provide robust information, we always recommend consulting with a qualified attorney for specific legal advice."
          </p>
        </div>
      </section>

      {/* Meet Our Experts */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-navy mb-4">
              Meet Our Legal Experts
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Behind every article and directory listing is a team of dedicated professionals committed to accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gold/20 group-hover:border-gold transition-colors duration-300 shadow-xl">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  {/* Badges */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 w-max">
                    {member.badges.map((badge, bIdx) => (
                      <span key={bIdx} className="bg-navy text-gold text-[10px] font-bold px-3 py-1 rounded-full border border-gold/30 shadow-sm uppercase tracking-wider">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h3 className="font-serif text-2xl font-bold text-navy mb-1 mt-4">
                  {member.name}
                </h3>
                <p className="text-gold font-medium mb-4 uppercase text-sm tracking-widest border-b border-gold/20 pb-2">
                  {member.role}
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {member.bio}
                </p>

                <div className="text-sm font-medium text-navy/70 space-y-1">
                   <p>🎓 {member.education}</p>
                   <p>💼 {member.experience} Experience</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream/50 border-t border-border">
         <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-2xl font-bold text-navy mb-8">Contact & Editorial Standards</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
               <div className="bg-background p-6 rounded-xl shadow-sm border border-border">
                  <BookOpen className="w-6 h-6 text-gold mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Editorial Policy</h3>
                   <p className="text-muted-foreground text-sm leading-relaxed">
                    We prioritize accurate, useful court and legal-procedure information. Guides cite
                    official sources where possible, carry clear disclaimers, and are updated when we
                    find material errors. We do not publish thin or duplicated articles solely for search traffic.
                  </p>
               </div>

               <div className="bg-background p-6 rounded-xl shadow-sm border border-border">
                  <Mail className="w-6 h-6 text-gold mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Get in Touch</h3>
                   <p className="text-muted-foreground text-sm">
                    Corrections, directory updates, and general questions:<br/>
                    <a href="mailto:Thecourtdirect@gmail.com" className="text-navy hover:text-gold transition-colors font-medium">Thecourtdirect@gmail.com</a>
                    <br/>
                    <a href="/contact" className="text-navy hover:text-gold transition-colors font-medium">Contact form</a>
                  </p>
               </div>
            </div>
         </div>
      </section>
    </Layout>
  );
};

export default AboutUs;
