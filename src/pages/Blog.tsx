import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Calendar, Clock, ArrowRight, User, Loader2 } from "lucide-react";
import { BlogPost } from "@/types/blog";
import { Button } from "@/components/ui/button";
import SEO from "@/components/seo/SEO";
import { generateBreadcrumbSchema } from "@/utils/schemaGenerator";
import { getLocalImagePath } from "@/utils/imageUtils";

const POSTS_PER_PAGE = 9;

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(
    new Set(
      posts.flatMap(post => post.categories || [post.category])
    )
  ).sort();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/data/blog-posts.json');
        if (!response.ok) throw new Error('Failed to load posts');
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError('Failed to load blog posts. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts
  // Use sticky post as featured if available, otherwise first post
  // Filter posts
  // Use sticky post as featured if available, otherwise first post
  const featuredPost = posts.find((post) => post.featured) || posts[0];
  
  const filteredPosts = posts.filter(post => {
    if (!selectedCategory) return true;
    const postCats = post.categories || [post.category];
    return postCats.includes(selectedCategory);
  });

  const regularPosts = filteredPosts.filter((post) => post.id !== featuredPost?.id);

  // Pagination logic
  const totalPages = Math.ceil(regularPosts.length / POSTS_PER_PAGE);
  const displayedPosts = regularPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-red-500 mb-4">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="Legal Blog & Articles"
        description="Explore expert legal articles, court guides, and judicial system insights. Stay informed with our comprehensive blog covering legal topics, court procedures, and legal advice."
        url="/blog"
        schema={generateBreadcrumbSchema([
          { name: 'Home', item: '/' },
          { name: 'Blog', item: '/blog' }
        ])}
      />
      {/* Hero Section */}
      <section className="bg-navy-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-6">
              Legal <span className="text-gradient-gold">Blog</span>
            </h1>
            <p className="text-cream/80 text-lg">
              Expert insights, guides, and resources to help you navigate the legal system with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && page === 1 && (
        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-px w-12 bg-gold" />
              <span className="text-gold font-medium text-sm uppercase tracking-wider">
                Featured Article
              </span>
            </div>
            <Link
              to={`/${featuredPost.id}`}
              className="group block bg-card rounded-2xl shadow-elegant overflow-hidden hover:shadow-gold-glow transition-all duration-300"
            >
              <div className="grid md:grid-cols-2">
                <div className="aspect-video md:aspect-auto bg-navy-gradient flex items-center justify-center p-12 relative overflow-hidden">
                  {featuredPost.image ? (
                     <img 
                       src={getLocalImagePath(featuredPost.image) || featuredPost.image || ''} 
                       alt={featuredPost.title}
                       className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                     />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-gold/30 flex items-center justify-center relative z-10">
                      <span className="font-serif text-gold text-4xl">§</span>
                    </div>
                  )}
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="inline-block bg-gold/10 text-gold text-xs font-medium px-3 py-1 rounded-full mb-4 w-fit">
                    {featuredPost.category}
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-gold transition-colors">
                    {featuredPost.title}
                  </h2>
                  <div 
                    className="text-muted-foreground mb-6 leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: featuredPost.excerpt }}
                  />
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {featuredPost.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Latest Articles
            </h2>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "navy" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(1);
                }}
                className="rounded-full"
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "navy" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className="rounded-full"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/${post.id}`}
                className="group bg-card rounded-xl shadow-elegant overflow-hidden hover:shadow-gold-glow transition-all duration-300 flex flex-col"
              >
                <div className="aspect-video bg-navy-gradient flex items-center justify-center relative overflow-hidden">
                  {post.image ? (
                    <img 
                      src={getLocalImagePath(post.image) || post.image || ''} 
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <span className="font-serif text-gold/30 text-6xl relative z-10">§</span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="inline-block bg-gold/10 text-gold text-xs font-medium px-3 py-1 rounded-full mb-3 w-fit">
                    {post.category}
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-gold transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <div 
                    className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1"
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
                    <span className="flex items-center gap-1 group-hover/author:text-gold transition-colors">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-gold text-sm font-medium group-hover:gap-2 transition-all">
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm font-medium">
                  Page {page} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
