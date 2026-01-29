import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { generateBreadcrumbSchema } from "@/utils/schemaGenerator";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <SEO 
        title="Privacy Policy"
        description="Read our privacy policy to learn how The Court Direct collects, uses, and protects your personal information when you use our court directory and legal resources."
        url="/privacy-policy"
        schema={generateBreadcrumbSchema([
          { name: 'Home', item: '/' },
          { name: 'Privacy Policy', item: '/privacy-policy' }
        ])}
      />
      <section className="bg-navy-gradient py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Shield className="w-8 h-8 text-gold" />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-6">
            Privacy Policy
          </h1>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <h2>1. Introduction</h2>
            <p>
              Welcome to The Court Direct. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our website 
              (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>

            <h2>2. Contact Details</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:Thecourtdirect@gmail.com" className="text-gold hover:underline">Thecourtdirect@gmail.com</a>
            </p>

            <h2>3. Advertising and Google AdSense</h2>
            <p>
              This website uses Google AdSense to display ads. Google AdSense determines what ads to show you based on 
              your interactions with this site and others.
            </p>
            <ul>
              <li>
                Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your 
                website or other websites.
              </li>
              <li>
                Google's use of advertising cookies enables it and its partners to serve ads to your users based on 
                their visit to your sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Google Ads Settings</a>.
              </li>
            </ul>

            <h2>4. Cookies</h2>
            <p>
              We use cookies to enhance your experience. By using our website, you consent to our use of cookies 
              in accordance with this policy.
            </p>

            <h2>5. Data Collection</h2>
            <p>
              We do not collect personal data unless you voluntarily provide it (e.g., through a contact form). 
              We may collect non-personal data such as browser type, operating system, and IP address for analytics purposes.
            </p>

            <h2>6. Third-Party Links</h2>
            <p>
              This website may include links to third-party websites, plug-ins, and applications. Clicking on those links 
              or enabling those connections may allow third parties to collect or share data about you. We do not control 
              these third-party websites and are not responsible for their privacy statements.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
