export interface Role {
  title: string;
  company: string;
  start: string;
  end?: string;
  location?: string;
  summary?: string;
  highlights?: string[];
  links?: { label: string; href: string }[];
}

export interface Education {
  school: string;
  degree: string;
  start?: string;
  end?: string;
}

export interface SkillGroup {
  group: string;
  items: string[];
}

export const summary =
  'Product engineer with 11 years of experience building mobile products, from a 0-to-1 bitcoin hardware wallet to ad formats generating millions in revenue. I lead cross-functional projects end to end and help the engineers around me grow.';

export const experience: Role[] = [
  {
    title: 'Senior Software Engineer, Bitkey',
    company: 'Block',
    start: 'Jan 2023',
    links: [{ label: 'bitkey.world', href: 'https://bitkey.world' }],
    summary:
      'Early engineer on the 0-to-1 Bitkey team, building the mobile app from alpha to general availability with Kotlin Multiplatform.',
    highlights: [
      'Project lead for the Robinhood partnership, selling bitcoin directly through a partner, and Security Hub, working across Legal, Privacy, Security, Design and Product to take each to launch.',
      'Led Security Hub, a Compose Multiplatform dashboard that gives users a real-time view of their wallet’s security, improving adoption of security features and users’ security awareness.',
      'Designed the key exchange for onboarding and upgrading to the new Bitkey with a screen, and iterated on wallet recovery: security-critical flows built on NFC, Bitcoin protocols and cryptography standards.',
      'Mentor engineers, interview candidates, onboard new hires, write design docs and lead incident response.',
    ],
  },
  {
    title: 'Senior Software Engineer, Android Tech Lead',
    company: 'Twitter',
    start: 'Jul 2020',
    end: 'Nov 2022',
    summary:
      'Android tech lead for Ad Formats, a team of about 20 engineers, leading and mentoring 6 Android engineers through end-to-end development of new formats.',
    highlights: [
      'Led an 8-engineer team across iOS, Android, React web and Scala APIs to ship Collection Ads: a 40% increase in click-through rate over single-media formats.',
      'Engineered the Multi-Destination Carousels format, which has generated multi-million dollars in revenue and a 20% increase in click-through rate.',
      'Drove Unified Cards on Android, a shared architecture that let Multi-Destination Carousels, Multi-Media Carousels and Collection Ads ship faster.',
    ],
  },
  {
    title: 'Software Engineer',
    company: 'Capital One',
    start: 'Jun 2019',
    end: 'Jul 2020',
    links: [{ label: 'Capital One Mobile', href: 'https://www.capitalone.com/digital/tools/mobile/' }],
    summary:
      'Built high-security debit account servicing features for the flagship Android consumer app, including migrating the Account Ownership Change journey from a legacy web experience to a native flow.',
  },
  {
    title: 'Software Engineer',
    company: 'Johnson & Johnson',
    start: 'Jul 2015',
    end: 'Jun 2019',
    links: [
      { label: 'Zyrtec AllergyCast', href: 'https://www.zyrtec.com/allergy-forecast' },
      {
        label: 'BabyCenter Pregnancy Tracker',
        href: 'https://play.google.com/store/apps/details?id=com.babycenter.pregnancytracker',
      },
    ],
    summary:
      'Built apps for R&D trials and patient studies: led the Zyrtec AllergyCast relaunch pilot and shipped features for the BabyCenter Pregnancy Tracker, including a React Native integration.',
  },
];

export const education: Education[] = [
  { school: 'New Jersey Institute of Technology', degree: 'B.S. in Computer Science', end: '2015' },
  { school: 'Hong Kong Polytechnic University', degree: 'Study abroad', end: 'Fall 2014' },
];

export const skills: SkillGroup[] = [
  { group: 'Languages', items: ['Kotlin', 'Swift', 'Rust'] },
  { group: 'Platforms', items: ['Android', 'iOS', 'Kotlin Multiplatform', 'Compose Multiplatform'] },
  { group: 'Domains', items: ['Bitcoin and self-custody', 'Applied cryptography', 'Hardware and NFC integration'] },
  {
    group: 'Practices',
    items: [
      'Mobile architecture',
      'System design',
      'Testing strategy',
      'Incident response',
      'AI-assisted development (Claude Code)',
    ],
  },
];

export const currentRole = experience.find((role) => !role.end);
