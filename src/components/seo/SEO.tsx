import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object | object[];
  imageWidth?: string;
  imageHeight?: string;
  imageAlt?: string;
  preloadImage?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  schema,
  imageWidth,
  imageHeight,
  imageAlt,
  preloadImage
}) => {
  const siteName = 'The Court Direct';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Navigate the judicial system with confidence. Find courtrooms, access legal resources, and understand procedures—all in one place.';
  const siteUrl = 'https://thecourtdirect.com';
  const defaultImage = `${siteUrl}/hero-courthouse.webp`;

  const metaDescription = description || defaultDescription;
  const metaImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`) : defaultImage;
  const canonicalUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`) : siteUrl;
  const preloadFormattedImage = preloadImage ? (preloadImage.startsWith('http') ? preloadImage : `${siteUrl}${preloadImage.startsWith('/') ? '' : '/'}${preloadImage}`) : null;

  // Flatten nested schema arrays if any
  const flattenSchema = (s: object | object[]): object[] => {
    if (Array.isArray(s)) {
      return s.reduce((acc: object[], val: object | object[]) => acc.concat(flattenSchema(val)), []);
    }
    return [s];
  };

  const schemas = schema ? flattenSchema(schema) : [];

  return (
    <Helmet>
      {/* Performance optimizations */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      {preloadFormattedImage && (
        <link rel="preload" as="image" href={preloadFormattedImage} fetchPriority="high" />
      )}

      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      <meta property="og:image:width" content={imageWidth || "1200"} />
      <meta property="og:image:height" content={imageHeight || "630"} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}

      {/* Structured Data (Schema.org) */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
