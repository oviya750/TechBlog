import React, { useEffect } from 'react';

/**
 * Technical SEO Head Manager
 * Updates document title, meta tags, Open Graph, Twitter cards, canonical links,
 * and Schema.org JSON-LD structured data without external SSR dependencies.
 */
const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  article,
  breadcrumbs,
  noindex = false
}) => {
  useEffect(() => {
    const siteTitle = 'TechBlog';
    const fullTitle = title ? `${title} — ${siteTitle}` : 'TechBlog — Technology & Architecture Publication';
    document.title = fullTitle;

    const metaDescription =
      description ||
      'An independent technical journal investigating autonomous intelligence, distributed systems, cloud platforms, and software craftsmanship.';
    const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://techblog.internal');
    const defaultImage =
      ogImage ||
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';

    // Helper: update or insert meta tag
    const setMetaTag = (selectorAttr, selectorVal, content) => {
      let el = document.querySelector(`meta[${selectorAttr}="${selectorVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(selectorAttr, selectorVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard Meta
    setMetaTag('name', 'description', metaDescription);
    if (keywords) {
      setMetaTag('name', 'keywords', Array.isArray(keywords) ? keywords.join(', ') : keywords);
    }
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMetaTag('property', 'og:site_name', siteTitle);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDescription);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', defaultImage);

    // Twitter / X Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDescription);
    setMetaTag('name', 'twitter:image', defaultImage);

    // Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', currentUrl);

    // JSON-LD Structured Data
    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        name: 'TechBlog',
        url: window.location.origin,
        logo: `${window.location.origin}/favicon.svg`,
        description:
          'Independent engineering publication investigating scalable software architecture and technology frontiers.',
        sameAs: ['https://github.com', 'https://twitter.com', 'https://linkedin.com']
      }
    ];

    if (article) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: article.title,
        description: article.excerpt,
        image: [article.featuredImage?.url || defaultImage],
        datePublished: article.publishedAt || article.createdAt,
        dateModified: article.updatedAt || article.publishedAt || article.createdAt,
        author: {
          '@type': 'Person',
          name: article.author?.name || 'TechBlog Editorial Staff',
          jobTitle: article.author?.role || 'Staff Systems Writer'
        },
        publisher: {
          '@type': 'Organization',
          name: 'TechBlog',
          logo: {
            '@type': 'ImageObject',
            url: `${window.location.origin}/favicon.svg`
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': currentUrl
        }
      });
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: crumb.item.startsWith('http') ? crumb.item : `${window.location.origin}${crumb.item}`
        }))
      });
    }

    let scriptTag = document.getElementById('techblog-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'techblog-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemas);

    return () => {
      document.title = 'TechBlog — Technology & Architecture Publication';
    };
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, article, breadcrumbs, noindex]);

  return null;
};

export default SEOHead;
