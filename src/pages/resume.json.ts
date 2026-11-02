import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { summary, experience, education, skills, currentRole } from '../data/resume';
import { getProjects } from '../lib/content';

const months: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  spring: '03', summer: '06', fall: '09', autumn: '09', winter: '12',
};

function isoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const year = value.match(/^(\d{4})$/);
  if (year) return year[1];
  const monthYear = value.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!monthYear) return undefined;
  const key = monthYear[1].toLowerCase();
  const month = months[key] ?? months[key.slice(0, 3)];
  return month ? `${monthYear[2]}-${month}` : undefined;
}

function profile(network: string, url: string) {
  return { network, username: url.replace(/\/$/, '').split('/').pop(), url };
}

export const GET: APIRoute = async () => {
  const [city, region] = site.location.split(',').map((part) => part.trim());
  const projects = await getProjects();

  const resume = {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: site.name,
      label: currentRole?.title,
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
    projects: projects.map((project) => ({
      name: project.data.title,
      description: project.data.summary,
      url: project.data.links.live ?? project.data.links.repo ?? `${site.url}/projects/${project.id}`,
      startDate: String(project.data.year),
      keywords: project.data.tech,
    })),
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
