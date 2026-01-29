import Layout from "@/components/layout/Layout";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SEO from "@/components/seo/SEO";
import { generateBreadcrumbSchema } from "@/utils/schemaGenerator";

const ContactUs = () => {
  return (
    <Layout>
      <SEO 
        title="Contact Us | Get in Touch"
        description="Contact The Court Direct for questions, feedback, or support with court information and legal resources. Email us at Thecourtdirect@gmail.com or use our contact form."
        url="/contact"
        schema={generateBreadcrumbSchema([
          { name: 'Home', item: '/' },
          { name: 'Contact Us', item: '/contact' }
        ])}
      />
      <section className="bg-navy-gradient py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Mail className="w-8 h-8 text-gold" />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-6">
            Contact Us
          </h1>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-navy mb-6">Get in Touch</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Whether you have a suggestion for our legal guides, found an error in our court directory, or just want to say hello, we're here to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border shadow-sm">
                  <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-navy mb-1">Email Us</h3>
                    <p className="text-muted-foreground mb-2">For general inquiries and support:</p>
                    <a href="mailto:Thecourtdirect@gmail.com" className="text-gold font-medium hover:underline text-lg">
                      Thecourtdirect@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border shadow-sm">
                  <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-navy mb-1">Feedback</h3>
                    <p className="text-muted-foreground">
                      We value your feedback to improve our directory and resources. Please let us know how we can do better.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
              <h2 className="font-serif text-2xl font-bold text-navy mb-6">Send a Message</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <Input id="email" type="email" placeholder="yourname@email.com" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                  <Textarea id="message" placeholder="Type your message here..." className="min-h-[150px]" />
                </div>

                <Button type="submit" className="w-full bg-navy hover:bg-navy/90 text-white h-12 text-lg">
                  Send Message
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  By sending this message, you agree to our <a href="/privacy-policy" className="underline hover:text-navy">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactUs;
