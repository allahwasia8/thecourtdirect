import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark, Loader2 } from "lucide-react";
import { BlogPost as BlogPostType } from "@/types/blog";

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
        // Fetch individual post JSON
        const response = await fetch(`/data/posts/${slug}.json`);
        
        if (!response.ok) {
          throw new Error("Post not found");
        }
        
        const data = await response.json();
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
            {/* Featured Image (if exists) */}
            {post.image && (
              <div className="mb-10 rounded-2xl overflow-hidden shadow-elegant">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-auto object-cover max-h-[500px]"
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

            {/* CTA */}
            <div className="mt-16 p-8 bg-cream rounded-2xl text-center">
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
