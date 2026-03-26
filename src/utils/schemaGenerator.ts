interface Post {
  title: string;
  metaDescription?: string;
  excerpt?: string;
  image?: string;
  date: string;
  history?: { date: string; action: string; details: string }[];
  author: string;
  authorRole?: string;
  reviewedBy?: { name: string; title: string; image?: string };
  keywords?: string[];
  faqs?: { question: string; answer: string }[];
}

interface Court {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: string;
}

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "The Court Direct",
  "url": "https://thecourtdirect.com",
  "logo": "https://thecourtdirect.com/Court-Direct-Logo-White-lines.png.webp",
  "sameAs": [
    "https://www.facebook.com/thecourtdirect",
    "https://twitter.com/thecourtdirect"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-202-555-0123",
    "contactType": "Customer Service"
  }
});

export const generateWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The Court Direct",
  "url": "https://thecourtdirect.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://thecourtdirect.com/find-court?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const generateArticleSchema = (post: Post) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "description": post.metaDescription || post.excerpt,
  "image": post.image ? (post.image.startsWith('http') ? [post.image] : [`https://thecourtdirect.com${post.image}`]) : [],
  "datePublished": post.date,
  "dateModified": post.history && post.history.length > 0 ? post.history[0].date : post.date,
  "author": [{
    "@type": "Person",
    "name": post.author,
    "jobTitle": post.authorRole || "Contributor",
    "url": "https://thecourtdirect.com/about"
  }],
  "publisher": {
    "@type": "Organization",
    "name": "The Court Direct",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thecourtdirect.com/Court-Direct-Logo-White-lines.png.webp"
    }
  },
  "reviewedBy": post.reviewedBy ? {
    "@type": "Person",
    "name": post.reviewedBy.name,
    "jobTitle": post.reviewedBy.title,
    "image": post.reviewedBy.image ? `https://thecourtdirect.com${post.reviewedBy.image}` : undefined
  } : undefined,
  "keywords": post.keywords ? post.keywords.join(", ") : undefined
});

export const generateFAQSchema = (faqs: { question: string, answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const generateCourthouseSchema = (court: Court) => ({
  "@context": "https://schema.org",
  "@type": "Courthouse",
  "name": court.name,
  "description": court.description || `Information for ${court.name} in ${court.city}, ${court.state}.`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": court.address,
    "addressLocality": court.city,
    "addressRegion": court.state,
    "postalCode": court.zip,
    "addressCountry": "US"
  },
  "telephone": court.phone,
  "url": `https://thecourtdirect.com/court/${court.id}`,
  "openingHours": court.hours
});

export const generateBreadcrumbSchema = (items: { name: string, item: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.item.startsWith('http') ? item.item : `https://thecourtdirect.com${item.item}`
  }))
});
