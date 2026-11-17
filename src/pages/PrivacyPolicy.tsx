import Layout from "@/components/layout/Layout";
import SEO from "@/components/seo/SEO";
import { generateBreadcrumbSchema } from "@/utils/schemaGenerator";
import { Shield } from "lucide-react";

const LAST_UPDATED = "November 18, 2026";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <SEO
        title="Privacy Policy"
        description="Read how The Court Direct collects, uses, and protects personal information, including Google AdSense advertising cookies and your privacy choices."
        url="/privacy-policy"
        schema={generateBreadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Privacy Policy", item: "/privacy-policy" },
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
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <h2>1. Introduction</h2>
            <p>
              Welcome to The Court Direct (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We respect your privacy
              and are committed to protecting personal data. This Privacy Policy explains how we collect,
              use, disclose, and safeguard information when you visit{" "}
              <a href="https://thecourtdirect.com">https://thecourtdirect.com</a>, and describes your
              privacy rights.
            </p>

            <h2>2. Contact Details</h2>
            <p>
              Questions about this policy or our privacy practices:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:Thecourtdirect@gmail.com" className="text-gold hover:underline">
                Thecourtdirect@gmail.com
              </a>
            </p>

            <h2>3. Information We Collect</h2>
            <ul>
              <li>
                <strong>Information you provide</strong> — such as name, email address, and message
                content when you contact us or submit a form.
              </li>
              <li>
                <strong>Automatic technical data</strong> — such as IP address, browser type, device
                type, referring URL, pages viewed, and approximate location derived from IP, collected
                through logs, analytics, and advertising partners.
              </li>
              <li>
                <strong>Cookies and similar technologies</strong> — small files stored on your device
                used for site functionality, analytics, and advertising (including Google AdSense).
              </li>
            </ul>

            <h2>4. How We Use Information</h2>
            <ul>
              <li>Operate, maintain, and improve the website and court directory</li>
              <li>Respond to inquiries and provide support</li>
              <li>Measure traffic and content performance</li>
              <li>Display advertising (including personalized ads where permitted)</li>
              <li>Detect abuse, secure the site, and comply with legal obligations</li>
            </ul>

            <h2>5. Advertising and Google AdSense</h2>
            <p>
              This site uses Google AdSense to display ads. Third-party vendors, including Google, use
              cookies to serve ads based on a user&apos;s prior visits to this site or other sites.
            </p>
            <ul>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads based
                on visits to this and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline"
                >
                  Google Ads Settings
                </a>
                .
              </li>
              <li>
                Learn more in{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline"
                >
                  Google&apos;s Advertising Policies
                </a>{" "}
                and how Google uses data when you use partner sites:{" "}
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline"
                >
                  How Google uses information from sites or apps that use our services
                </a>
                .
              </li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              We use essential cookies for basic site operation and optional cookies for analytics and
              advertising. You can control cookies through your browser settings and our on-site cookie
              notice. Blocking some cookies may affect site features or ad relevance.
            </p>

            <h2>7. Legal Information Disclaimer</h2>
            <p>
              Content on The Court Direct is for general informational purposes only and does not
              create an attorney-client relationship. We do not collect sensitive legal case details
              through browsing alone. Do not submit confidential attorney-client information through
              public contact forms.
            </p>

            <h2>8. Data Sharing</h2>
            <p>
              We may share information with service providers who help us host, analyze, or advertise
              on the site (such as Google), when required by law, or to protect rights and safety. We
              do not sell personal information in the traditional sense; advertising partners may
              process identifiers for personalized ads as described above.
            </p>

            <h2>9. Data Retention</h2>
            <p>
              We retain contact messages and logs only as long as needed for the purposes described in
              this policy, unless a longer period is required by law.
            </p>

            <h2>10. Children&apos;s Privacy</h2>
            <p>
              This website is not directed to children under 13. We do not knowingly collect personal
              information from children under 13. If you believe a child has provided us information,
              contact us and we will delete it.
            </p>

            <h2>11. Your Choices and Rights</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, delete, or restrict
              certain personal data, or to opt out of sale/sharing of personal information for targeted
              advertising. To make a request, email{" "}
              <a href="mailto:Thecourtdirect@gmail.com" className="text-gold hover:underline">
                Thecourtdirect@gmail.com
              </a>
              . You may also use browser controls and Google Ads Settings to limit personalized ads.
            </p>

            <h2>12. Third-Party Links</h2>
            <p>
              Our pages may link to official court sites, statutes, and other third-party resources. We
              do not control those sites and are not responsible for their privacy practices.
            </p>

            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at
              the top of this page reflects the latest revision. Continued use of the site after changes
              means you acknowledge the updated policy.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
