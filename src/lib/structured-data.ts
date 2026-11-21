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
