import Layout from "@/components/layout/Layout";
import { Scale } from "lucide-react";

const TermsOfService = () => {
  return (
    <Layout>
      <section className="bg-navy-gradient py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Scale className="w-8 h-8 text-gold" />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-6">
            Terms of Service
          </h1>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using The Court Direct, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Legal Disclaimer</h2>
            <div className="bg-muted p-6 rounded-lg border-l-4 border-gold my-6">
              <p className="mb-0 font-medium">
                The information provided on The Court Direct is for general informational purposes only. It is not intended to 
                constitute legal advice or to substitute for obtaining legal advice from an attorney licensed in your state. 
                Using this website does not create an attorney-client relationship.
              </p>
            </div>

            <h2>3. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on 
              The Court Direct's website for personal, non-commercial transitory viewing only.
            </p>

            <h2>4. Limitations</h2>
            <p>
              In no event shall The Court Direct or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to 
              use the materials on The Court Direct's website.
            </p>

            <h2>5. Accuracy of Materials</h2>
            <p>
              The materials appearing on The Court Direct's website could include technical, typographical, or photographic errors. 
              The Court Direct does not warrant that any of the materials on its website are accurate, complete, or current. 
              We may make changes to the materials contained on its website at any time without notice.
            </p>

            <h2>6. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the United States and 
              you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: <a href="mailto:Thecourtdirect@gmail.com" className="text-gold hover:underline">Thecourtdirect@gmail.com</a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsOfService;
