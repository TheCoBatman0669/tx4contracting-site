import { companyData } from '@/lib/company-data';

export function getOrganizationSchema() {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyData.name,
    url: companyData.website,
    logo: `${companyData.website}/tx4-logo.PNG`,
    description: companyData.description,
  };

  if (companyData.legalName) schema.legalName = companyData.legalName;
  if (companyData.foundingYear) schema.foundingDate = companyData.foundingYear;

  if (companyData.contact.phone || companyData.contact.email) {
    const contactPoint: Record<string, string> = {
      '@type': 'ContactPoint',
      contactType: 'sales',
    };
    if (companyData.contact.phone)
      contactPoint.telephone = companyData.contact.phone;
    if (companyData.contact.email)
      contactPoint.email = companyData.contact.email;
    schema.contactPoint = contactPoint;
  }

  if (companyData.contact.address.city) {
    const addr: Record<string, string> = {
      '@type': 'PostalAddress',
      addressLocality: companyData.contact.address.city,
      addressRegion: companyData.contact.address.state,
      addressCountry: companyData.contact.address.country,
    };
    if (companyData.contact.address.street)
      addr.streetAddress = companyData.contact.address.street;
    if (companyData.contact.address.zip)
      addr.postalCode = companyData.contact.address.zip;
    schema.address = addr;
  }

  if (companyData.serviceArea) {
    schema.areaServed = {
      '@type': 'State',
      name: companyData.serviceArea,
    };
  }

  const sameAs: string[] = [];
  if (companyData.social.linkedin) sameAs.push(companyData.social.linkedin);
  if (companyData.social.facebook) sameAs.push(companyData.social.facebook);
  if (sameAs.length > 0) schema.sameAs = sameAs;

  return schema;
}

export function getServiceSchema(
  name: string,
  description: string,
  url: string
) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    provider: {
      '@type': 'Organization',
      name: companyData.name,
      url: companyData.website,
    },
  };

  if (companyData.serviceArea) {
    schema.areaServed = {
      '@type': 'State',
      name: companyData.serviceArea,
    };
  }

  return schema;
}

export function getBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * FAQPage schema. Only emit this when the same questions and answers are
 * visible on the page, otherwise it violates Google's structured data policy.
 */
export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getArticleSchema(article: {
  headline: string;
  description: string;
  url: string;
  author?: string;
  publishDate?: string;
  reviewDate?: string;
  section?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    url: article.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    publisher: {
      '@type': 'Organization',
      name: companyData.name,
      url: companyData.website,
      logo: {
        '@type': 'ImageObject',
        url: `${companyData.website}/tx4-logo.PNG`,
      },
    },
  };

  // Only emit an author when one has actually been confirmed.
  if (article.author) {
    schema.author = { '@type': 'Person', name: article.author };
  } else {
    schema.author = { '@type': 'Organization', name: companyData.name };
  }

  if (article.publishDate) schema.datePublished = article.publishDate;
  if (article.reviewDate) schema.dateModified = article.reviewDate;
  if (article.section) schema.articleSection = article.section;

  return schema;
}

export function getCollectionPageSchema(collection: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: collection.url,
    isPartOf: {
      '@type': 'WebSite',
      name: companyData.name,
      url: companyData.website,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collection.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}
