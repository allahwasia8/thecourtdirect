import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { BlogPost } from "@/types/blog";

const Sitemap = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch('/data/blog-posts.json')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error("Failed to load blog posts", err));
  }, []);

  const mainLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Find a Court", path: "/find-court" },
    { name: "Legal Blog", path: "/blog" },
    { name: "Contact Us", path: "/contact" },
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Terms of Service", path: "/terms-of-service" },
  ];

  return (
    <Layout>
      <Helmet>
        <title>Sitemap | The Court Direct - Site Directory</title>
        <meta name="description" content="Browse our sitemap to easily navigate all pages on The Court Direct website, including court directories, legal resources, and information guides." />
      </Helmet>
      <section className="bg-navy-gradient py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl font-bold text-cream">
            HTML <span className="text-gradient-gold">Sitemap</span>
          </h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Main Pages */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6 border-b border-border pb-2">
                Main Pages
              </h2>
              <ul className="space-y-3">
                {mainLinks.map(link => (
                  <li key={link.path}>
                    <Link 
                      to={link.path} 
                      className="text-muted-foreground hover:text-gold transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blog Posts */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6 border-b border-border pb-2">
                Latest Articles
              </h2>
              <ul className="space-y-3">
                {posts.map(post => (
                  <li key={post.id}>
                    <Link 
                      to={`/blog/${post.id}`} 
                      className="text-muted-foreground hover:text-gold transition-colors block leading-snug"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Sitemap;
