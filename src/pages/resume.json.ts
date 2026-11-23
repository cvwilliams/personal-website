import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { headline, summary, experience, education, skills } from '../data/resume';
import { isoDate } from '../lib/resume-dates';

function profile(network: string, url: string) {
  return { network, username: url.replace(/\/$/, '').split('/').pop(), url };
}

export const GET: APIRoute = () => {
  const [city, region] = site.location.split(',').map((part) => part.trim());

  const resume = {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: site.name,
      label: headline,
      url: site.url,
      summary,
      location: { city, region, countryCode: 'US' },
      profiles: [
        site.links.github && profile('GitHub', site.links.github),
        site.links.linkedin && profile('LinkedIn', site.links.linkedin),
      ].filter(Boolean),
    },
    work: experience.map((role) => ({
      name: role.company,
      position: role.title,
      url: role.links?.[0]?.href,
      startDate: isoDate(role.start),
      endDate: isoDate(role.end),
      summary: role.summary,
      highlights: role.highlights ?? [],
    })),
    education: education.map((entry) => ({
      institution: entry.school,
      studyType: entry.degree,
      startDate: isoDate(entry.start),
      endDate: isoDate(entry.end),
    })),
    skills: skills.map((group) => ({ name: group.group, keywords: group.items })),
    meta: {
      canonical: `${site.url}/resume.json`,
      version: 'v1.0.0',
      lastModified: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(resume, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
