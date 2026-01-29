import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Mail, Shield, CheckCircle } from "lucide-react";
import SEO from "@/components/seo/SEO";
import { generateBreadcrumbSchema } from "@/utils/schemaGenerator";

const WriteForUs = () => {
  return (
    <Layout>
      <SEO 
        title="Write for Us | Legal Writing Opportunities"
        description="Join The Court Direct as a legal contributor. Submit legal articles and share your expertise with our audience. Learn about our guest post guidelines and submission process."
        url="/write-for-us-law"
        schema={generateBreadcrumbSchema([
          { name: 'Home', item: '/' },
          { name: 'Write for Us', item: '/write-for-us-law' }
        ])}
      />
      <section className="bg-navy-gradient py-20">
        <div className="container mx-auto px-4 text-center text-cream">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Write for Us
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-cream/80">
            Share your legal expertise with our audience. Join our network of contributors.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-navy prose-a:text-gold hover:prose-a:text-navy prose-a:transition-colors">
            <p className="lead">
              You can write for us if you are a lawyer. In order to submit an article to us, it must be unique and not have been published elsewhere, including on your personal blog or company website.
            </p>

            <div className="bg-card p-8 rounded-xl border-l-4 border-gold shadow-sm my-8">
              <h3 className="mt-0 flex items-center gap-2">
                <CheckCircle className="text-gold w-6 h-6" />
                Submission Guidelines
              </h3>
              <ul className="grid md:grid-cols-2 gap-4 mt-4 mb-0">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-navy">Length:</span>
                  <span>Minimum 800 words. Preferred: 2,000–2,500 words.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-navy">Quality:</span>
                  <span>Deeply researched, well-written, and informative.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-navy">Structure:</span>
                  <span>Use clear headings and subheadings. Professional yet conversational tone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-navy">Images:</span>
                  <span>Must be hosted on free-to-use third-party sites (provide direct URL). No personal/company hosting.</span>
                </li>
              </ul>
            </div>

            <h2>How to Submit</h2>
            <p>
              If you meet the qualifications and are able to adhere to the guidelines outlined above, we welcome you to submit your article to us. Interested writers may send their content via email to our editor.
            </p>
            
            <div className="flex flex-col items-center justify-center p-8 bg-navy/5 rounded-xl text-center not-prose">
              <Mail className="w-12 h-12 text-navy mb-4" />
              <h3 className="font-serif text-2xl font-bold text-navy mb-2">Submit Your Guest Post</h3>
              <a href="mailto:thecourtdirect@gmail.com" className="text-xl font-medium text-gold hover:text-navy transition-colors">
                thecourtdirect@gmail.com
              </a>
            </div>

            <div className="mt-12 p-6 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border">
              <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Topics We Accept
              </h4>
              <p>
                We are open to writing on a wide range of legal topics, including but not limited to Contract Law, Corporate Law, Family Law, Bankruptcy Law, Immigration Law, Intellectual Property Law, Personal Injury Law, Criminal Law, Estate Planning Law, Tax Law, Real Estate Law, Medical Malpractice, Social Security Disability Insurance, Employment Law, Entertainment Law, Environmental Law, Admiralty or Maritime Law, Country Law, Counsel, Divorce Law, DUI Law, and more.
              </p>
            </div>
            
             <div className="mt-8 text-xs text-muted-foreground">
              <p className="font-bold mb-1">Guest Post Search Strings:</p>
              <p>“law” + “write for us”, “guest posting” + “law”, “write for us” “law”, “law” “write for us”, “write for us” + “legal”</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default WriteForUs;
