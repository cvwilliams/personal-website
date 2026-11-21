// Schema.org structured data (JSON-LD). The homepage describes the site and its author; other pages
// point back to the same Person by @id, so search engines treat them as one entity alongside the
// profiles in sameAs.
import { site } from '../data/site';
import { currentRole } from '../data/resume';

export const personId = `${site.url}/#person`;
export const websiteId = `${site.url}/#website`;

export const person = {
  '@type': 'Person',
  '@id': personId,
  name: site.name,
  url: site.url,
  jobTitle: 'Software Engineer',
  ...(currentRole && { worksFor: { '@type': 'Organization', name: currentRole.company } }),
  address: { '@type': 'PostalAddress', addressLocality: 'New York', addressRegion: 'NY', addressCountry: 'US' },
  knowsLanguage: ['en', 'es'],
  sameAs: [site.links.github, site.links.linkedin].filter(Boolean),
};

export const website = {
  '@type': 'WebSite',
  '@id': websiteId,
  url: site.url,
  name: site.name,
  description: site.description,
  inLanguage: 'en',
  publisher: { '@id': personId },
};

export const jsonLd = (...items: object[]) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': items });

interface Post {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
}

/** A thought, credited to the same Person and site as the homepage. */
export const blogPosting = ({ slug, title, description, pubDate, updatedDate, tags }: Post) => {
  const url = `${site.url}/thoughts/${slug}`;
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#post`,
    url,
    mainEntityOfPage: url,
    headline: title,
    description,
    image: `${site.url}/og/${slug}.png`,
    datePublished: pubDate.toISOString(),
    dateModified: (updatedDate ?? pubDate).toISOString(),
    inLanguage: 'en',
    ...(tags.length > 0 && { keywords: tags }),
    author: { '@id': personId },
    publisher: { '@id': personId },
    isPartOf: { '@id': websiteId },
  };
};
