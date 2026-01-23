import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark, Loader2, Info, History as HistoryIcon, FileText } from "lucide-react";
import { BlogPost as BlogPostType } from "@/types/blog";
import { Helmet } from "react-helmet-async";
import { getLocalImagePath } from "@/utils/imageUtils";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        console.log("Fetching post for slug:", slug);
        const response = await fetch(`/data/posts/${slug}.json`);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          throw new Error("Post not found");
        }
        
        const data = await response.json();
        console.log("Fetched post data:", data);
        setPost(data);
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you are looking for does not exist or has been removed.</p>
          <Button variant="navy" asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{post.title} | The Court Direct</title>
        <meta name="description" content={post.excerpt.slice(0, 160)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "image": post.image ? (post.image.startsWith('http') ? [post.image] : [`https://thecourtdirect.com${post.image}`]) : [],
            "datePublished": post.date,
            "author": [{
                "@type": "Person",
                "name": post.author,
                "url": "https://thecourtdirect.com/about"
            }],
            "publisher": {
              "@type": "Organization",
              "name": "The Court Direct",
              "logo": {
                "@type": "ImageObject",
                "url": "https://thecourtdirect.com/Court-Direct-Logo-White-lines.png.webp"
              }
            }
          })}
        </script>
      </Helmet>
      {/* Header */}
      <section className="bg-navy-gradient py-20 relative overflow-hidden">
        {/* Subtle decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <nav className="mb-12">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-cream/60 hover:text-gold transition-all duration-300 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium tracking-wide">Back to Blog</span>
              </Link>
            </nav>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gold/50" />
                <span className="bg-gold/10 text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-gold/20">
                  {post.category}
                </span>
              </div>
              
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-cream leading-[1.1] mb-8 tracking-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 border-t border-cream/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream/5 border border-cream/10 flex items-center justify-center">
                    <User className="text-gold w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-cream/50 uppercase tracking-wider font-semibold">Author</p>
                    <p className="text-cream font-medium">{post.author}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream/5 border border-cream/10 flex items-center justify-center">
                    <Calendar className="text-gold w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-cream/50 uppercase tracking-wider font-semibold">Published</p>
                    <p className="text-cream font-medium">{post.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cream/5 border border-cream/10 flex items-center justify-center">
                    <Clock className="text-gold w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-cream/50 uppercase tracking-wider font-semibold">Read Time</p>
                    <p className="text-cream font-medium">{post.readTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Featured Image */}
            {post.image && (
              <div className="mb-10 rounded-2xl overflow-hidden shadow-elegant">
                <img 
                  src={getLocalImagePath(post.image) || post.image || ''} 
                  alt={post.title} 
                  className="w-full h-auto object-cover max-h-[500px]"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-12 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center shrink-0">
                  <span className="font-serif text-gold text-lg">
                    {post.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{post.author}</div>
                  <div className="text-sm text-muted-foreground">{post.authorRole || 'Contributor'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => {
                   if (navigator.share) {
                     navigator.share({ title: post.title, url: window.location.href });
                   }
                }}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Article Body */}
            <article
              className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-navy hover:prose-a:text-gold prose-a:transition-colors prose-li:text-muted-foreground prose-blockquote:border-gold prose-blockquote:text-xl prose-blockquote:font-serif prose-blockquote:italic prose-img:rounded-2xl prose-img:shadow-md prose-hr:border-border"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          </div>
        </div>
      </section>

      {/* Review & History Section - Moved to end */}
      <section className="bg-background border-y border-border py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card rounded-xl shadow-elegant p-6 md:p-8">
            <h3 className="font-serif text-xl font-bold text-foreground mb-4">How we reviewed this article:</h3>
            
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="sources" className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Request Sources
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="sources">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Our team verifies information from reputable legal databases, court records, and official government statutes.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <p className="text-muted-foreground mb-6 text-sm">
                  Our experts continually monitor the legal space, and we update our articles when new information becomes available.
                </p>
                
                <div className="relative border-l-2 border-gold/20 ml-3 space-y-8 py-2">
                  {post.history?.map((event, index) => (
                    <div key={index} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${index === 0 ? 'bg-gold border-gold' : 'bg-background border-gold/40'}`} />
                      
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-bold ${index === 0 ? 'text-navy' : 'text-muted-foreground'}`}>
                          {event.action}
                        </span>
                        {event.date !== "Unknown" && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {event.date}
                          </span>
                        )}
                        
                        {(event.action === "Reviewed" || event.details.includes("Reviewed by")) && post.reviewedBy && (
                          <div className="mt-4 bg-muted/30 p-4 rounded-lg flex items-center gap-4">
                            <img 
                              src={post.reviewedBy.image} 
                              alt={post.reviewedBy.name}
                              className="w-12 h-12 rounded-full object-cover border border-border"
                            />
                            <div>
                              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Legally Reviewed By</p>
                              <p className="font-serif font-medium text-foreground">{post.reviewedBy.name}</p>
                              <p className="text-xs text-muted-foreground">{post.reviewedBy.title}</p>
                            </div>
                          </div>
                        )}
                        
                        {!event.details.includes("Reviewed by") && event.details !== event.action && (
                           <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-cream rounded-2xl text-center">
              <h3 className="font-serif text-2xl font-bold text-navy mb-4">
                Need to Find a Courtroom?
              </h3>
              <p className="text-muted-foreground mb-6">
                Use our comprehensive court finder to locate the right court for your needs.
              </p>
              <Button variant="navy" size="lg" asChild>
                <Link to="/find-court">Find a Court</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
