/**
 * Fast static prerender for production + Google bots.
 * Injects unique title/description/canonical/OG/JSON-LD and crawler-visible
 * HTML into Vite's built index.html — no Puppeteer, completes in seconds.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE = "https://thecourtdirect.com";
const SITE_NAME = "The Court Direct";
const DEFAULT_IMAGE = `${SITE}/hero-courthouse.webp`;

const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function absoluteUrl(url) {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http")) return url;
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function stripTags(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildHead({ title, description, url, type = "website", image, schemas = [] }) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonical = absoluteUrl(url);
  const ogImage = absoluteUrl(image);
  const schemaTags = schemas
    .filter(Boolean)
    .map(
      (schema) =>
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    )
    .join("\n    ");

  return `
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    ${schemaTags}
  `.trim();
}

function injectHtml(template, headExtras, bodyContent) {
  let html = template;

  // Prefer replacing existing title/description; otherwise inject before </head>
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  }
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    ""
  );

  html = html.replace(
    /<\/head>/i,
    `    ${headExtras}\n  </head>`
  );

  // Put crawler-visible content inside #root so Google sees real copy before JS
  html = html.replace(
    /<div id="root"><\/div>/i,
    `<div id="root">${bodyContent}</div>`
  );

  return html;
}

function writePage(distPath, routePath, html) {
  const outDir =
    routePath === "/"
      ? distPath
      : path.join(distPath, ...routePath.replace(/^\//, "").split("/"));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
}

function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE,
    logo: `${SITE}/Court-Direct-Logo-White-lines.png.webp`,
    contactPoint: {
      "@type": "ContactPoint",
      email: "Thecourtdirect@gmail.com",
      contactType: "customer support",
    },
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE,
  };
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.item),
    })),
  };
}

function courtSchema(court) {
  return {
    "@context": "https://schema.org",
    "@type": "Courthouse",
    name: court.name,
    description:
      court.description ||
      `Information for ${court.name} in ${court.city}, ${court.state}.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: court.address,
      addressLocality: court.city,
      addressRegion: court.state,
      postalCode: court.zip,
      addressCountry: "US",
    },
    telephone: court.phone || undefined,
    url: `${SITE}/court/${court.id}`,
    openingHours: court.hours || undefined,
  };
}

function articleSchema(post, slug) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.image ? [absoluteUrl(post.image)] : [DEFAULT_IMAGE],
    datePublished: post.date,
    dateModified:
      post.history && post.history.length > 0 ? post.history[0].date : post.date,
    author: [
      {
        "@type": "Person",
        name: post.author || SITE_NAME,
        url: `${SITE}/about`,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/Court-Direct-Logo-White-lines.png.webp`,
      },
    },
    mainEntityOfPage: absoluteUrl(`/${slug}`),
  };
}

function faqSchema(faqs) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

async function main() {
  const started = Date.now();
  const root = path.resolve(__dirname, "..");
  const distPath = path.join(root, "dist");
  const templatePath = path.join(distPath, "index.html");

  if (!fs.existsSync(templatePath)) {
    console.error("dist/index.html missing. Run vite build first.");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const courts = JSON.parse(
    fs.readFileSync(path.join(root, "public/data/courts.json"), "utf8")
  );
  const postsIndex = JSON.parse(
    fs.readFileSync(path.join(root, "public/data/blog-posts.json"), "utf8")
  );
  const postsDir = path.join(root, "public/data/posts");

  const pages = [];

  const staticPages = [
    {
      path: "/",
      title: "Find Your Courtroom & Legal Resources",
      description:
        "The Court Direct is your trusted guide to the US judicial system. Find court locations, access free legal resources, and understand court procedures.",
      body: `<main><h1>Courtroom &amp; Legal Affairs Made Easy</h1><p>Navigate the judicial system with confidence. Find courtrooms, access legal resources, and understand procedures—all in one place.</p><p><a href="/find-court">Find a Courtroom</a> · <a href="/blog">Legal Blog</a> · <a href="/directory">Browse by State</a></p></main>`,
      schemas: [orgSchema(), websiteSchema()],
    },
    {
      path: "/about",
      title: "About Us | Legal Experts & Court Resources",
      description:
        "Learn about The Court Direct's mission to democratize access to justice with accurate court directories and understandable legal guides.",
      body: `<main><h1>About The Court Direct</h1><p>We help people find courts and understand legal procedures with clear, carefully reviewed information.</p></main>`,
      schemas: [breadcrumbSchema([{ name: "Home", item: "/" }, { name: "About Us", item: "/about" }])],
    },
    {
      path: "/blog",
      title: "Legal Blog & Articles",
      description:
        "Explore carefully reviewed legal guides and court explainers from The Court Direct.",
      body: `<main><h1>Legal Blog</h1><ul>${postsIndex
        .map(
          (p) =>
            `<li><a href="/${escapeHtml(p.id)}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.excerpt || "")}</li>`
        )
        .join("")}</ul></main>`,
      schemas: [breadcrumbSchema([{ name: "Home", item: "/" }, { name: "Blog", item: "/blog" }])],
    },
    {
      path: "/find-court",
      title: "Find a Courtroom",
      description:
        "Search U.S. courts by name, city, or state. Get addresses, phone numbers, and court type information.",
      body: `<main><h1>Find a Courtroom</h1><p>Search our national court directory for addresses, phone numbers, and hours.</p><p><a href="/directory">Browse by state</a></p></main>`,
    },
    {
      path: "/directory",
      title: "National Court Directory by State",
      description:
        "Browse The Court Direct national court directory by state to find courthouse contact details.",
      body: `<main><h1>Court Directory by State</h1><ul>${STATES.map(
        (s) =>
          `<li><a href="/courts/${s}">${STATE_NAMES[s]} (${s})</a></li>`
      ).join("")}</ul></main>`,
    },
    {
      path: "/contact",
      title: "Contact Us",
      description:
        "Contact The Court Direct for questions, feedback, or corrections about court information and legal guides.",
      body: `<main><h1>Contact Us</h1><p>Email <a href="mailto:Thecourtdirect@gmail.com">Thecourtdirect@gmail.com</a></p></main>`,
    },
    {
      path: "/privacy-policy",
      title: "Privacy Policy",
      description:
        "How The Court Direct collects, uses, and protects personal information, including Google AdSense cookies.",
      body: `<main><h1>Privacy Policy</h1><p>Read our privacy practices, cookie use, and Google AdSense disclosures.</p></main>`,
    },
    {
      path: "/terms-of-service",
      title: "Terms of Service",
      description:
        "Terms of service for using The Court Direct website and legal information resources.",
      body: `<main><h1>Terms of Service</h1><p>Information on this site is for general educational purposes and is not legal advice.</p></main>`,
    },
    {
      path: "/legal-terms",
      title: "Legal Terminology Dictionary",
      description:
        "Browse clear definitions of common court and legal terms.",
      body: `<main><h1>Legal Terminology</h1><p>A dictionary of common court and legal terms in plain language.</p></main>`,
    },
    {
      path: "/sitemap",
      title: "Sitemap",
      description: "HTML sitemap for The Court Direct.",
      body: `<main><h1>Sitemap</h1><p><a href="/">Home</a> · <a href="/blog">Blog</a> · <a href="/directory">Directory</a> · <a href="/privacy-policy">Privacy</a></p></main>`,
    },
    {
      path: "/write-for-us-law",
      title: "Write for Us",
      description:
        "Contribute carefully researched legal and court guides to The Court Direct.",
      body: `<main><h1>Write for Us</h1><p>We welcome original, accurate legal education articles. Contact Thecourtdirect@gmail.com.</p></main>`,
    },
  ];

  for (const page of staticPages) {
    pages.push(page);
  }

  for (const state of STATES) {
    const stateCourts = courts.filter((c) => c.state === state);
    pages.push({
      path: `/courts/${state}`,
      title: `${STATE_NAMES[state]} Court Directory`,
      description: `Find courts in ${STATE_NAMES[state]} (${state}). Browse addresses, phone numbers, and court types.`,
      body: `<main><h1>${escapeHtml(STATE_NAMES[state])} Courts</h1><p>${stateCourts.length} courts listed.</p><ul>${stateCourts
        .slice(0, 200)
        .map(
          (c) =>
            `<li><a href="/court/${escapeHtml(c.id)}">${escapeHtml(c.name)}</a> — ${escapeHtml(
              [c.city, c.state].filter(Boolean).join(", ")
            )}</li>`
        )
        .join("")}</ul></main>`,
      schemas: [
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Directory", item: "/directory" },
          { name: STATE_NAMES[state], item: `/courts/${state}` },
        ]),
      ],
    });
  }

  for (const court of courts) {
    const location = [court.city, court.state].filter(Boolean).join(", ");
    const types = Array.isArray(court.types) ? court.types.join(", ") : "";
    const description =
      court.metaDescription ||
      court.description ||
      `Find information for ${court.name}${location ? ` in ${location}` : ""}.`;
    pages.push({
      path: `/court/${court.id}`,
      title: court.metaTitle || `${court.name} - Court Information`,
      description,
      body: `<main>
        <article>
          <h1>${escapeHtml(court.name)}</h1>
          <p>${escapeHtml(court.description || description)}</p>
          <ul>
            <li><strong>Address:</strong> ${escapeHtml(
              [court.address, court.city, court.state, court.zip].filter(Boolean).join(", ")
            )}</li>
            ${court.phone ? `<li><strong>Phone:</strong> ${escapeHtml(court.phone)}</li>` : ""}
            ${court.hours ? `<li><strong>Hours:</strong> ${escapeHtml(court.hours)}</li>` : ""}
            ${types ? `<li><strong>Type:</strong> ${escapeHtml(types)}</li>` : ""}
            ${
              court.website
                ? `<li><strong>Website:</strong> <a href="${escapeHtml(court.website)}" rel="noopener noreferrer">${escapeHtml(court.website)}</a></li>`
                : ""
            }
          </ul>
          <p><a href="/find-court">Search more courts</a> · <a href="/courts/${escapeHtml(
            court.state || ""
          )}">More in ${escapeHtml(STATE_NAMES[court.state] || court.state || "this state")}</a></p>
        </article>
      </main>`,
      schemas: [
        courtSchema(court),
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Find a Court", item: "/find-court" },
          { name: court.name, item: `/court/${court.id}` },
        ]),
      ],
    });
  }

  for (const postMeta of postsIndex) {
    const slug = postMeta.id;
    const fullPath = path.join(postsDir, `${slug}.json`);
    const post = fs.existsSync(fullPath)
      ? JSON.parse(fs.readFileSync(fullPath, "utf8"))
      : postMeta;
    const contentHtml = post.content || `<p>${escapeHtml(post.excerpt || "")}</p>`;
    const textPreview = stripTags(contentHtml).slice(0, 1200);
    pages.push({
      path: `/${slug}`,
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || post.title,
      type: "article",
      image: post.imageToShare || post.image,
      body: `<main>
        <article>
          <h1>${escapeHtml(post.title)}</h1>
          <p><em>By ${escapeHtml(post.author || SITE_NAME)} · ${escapeHtml(
        post.date || ""
      )}</em></p>
          <p>${escapeHtml(textPreview)}${textPreview.length >= 1200 ? "…" : ""}</p>
          <div>${contentHtml}</div>
          <p><strong>Legal disclaimer:</strong> This article is for general informational purposes only and is not legal advice.</p>
          <p><a href="/blog">Back to blog</a></p>
        </article>
      </main>`,
      schemas: [
        articleSchema(post, slug),
        faqSchema(post.faqs),
        breadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Blog", item: "/blog" },
          { name: post.title, item: `/${slug}` },
        ]),
      ],
    });
  }

  let written = 0;
  for (const page of pages) {
    const head = buildHead({
      title: page.title,
      description: page.description,
      url: page.path,
      type: page.type || "website",
      image: page.image,
      schemas: page.schemas || [],
    });
    const html = injectHtml(template, head, page.body);
    writePage(distPath, page.path, html);
    written += 1;
  }

  // Keep root index as the homepage variant (already written for "/")
  const elapsed = ((Date.now() - started) / 1000).toFixed(2);
  console.log(
    `Static prerender complete: ${written} pages in ${elapsed}s (${(
      written / Math.max(Number(elapsed), 0.001)
    ).toFixed(0)} pages/sec).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
