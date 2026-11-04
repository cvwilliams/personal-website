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

export const headline = 'Software Engineer · Mobile, Kotlin Multiplatform, Bitcoin';

export const summary =
  'Product engineer with 11 years of experience building mobile products, from a 0-to-1 bitcoin hardware wallet to ad formats generating millions in revenue. I mentor engineers at every level and lead cross-team technical work.';

export const experience: Role[] = [
  {
    title: 'Senior Software Engineer on Bitkey',
    company: 'Block',
    start: 'Jan 2023',
    links: [{ label: 'bitkey.world', href: 'https://bitkey.world' }],
    summary:
      'Early engineer on the 0-to-1 Bitkey team, building the mobile app from alpha to general availability with Kotlin Multiplatform.',
    highlights: [
      'Project lead for bitcoin partner integrations with Robinhood, Coinbase, Blockchain.com and Strike in Rust and Kotlin: doubled available partners and added selling bitcoin directly from the wallet, working across Legal, Privacy, Security, Design and Product.',
      'Project lead for Security Hub, a Compose Multiplatform dashboard giving users a real-time view of their wallet’s security: increased completion of key security features by 100–200% and surfaced previously hidden bugs affecting legacy customers.',
      'Partnered with Firmware and Security to design the key exchange protocol across server, mobile and hardware in Rust and Kotlin for onboarding and upgrading to the new Bitkey, and iterated on wallet recovery flows built on NFC, Bitcoin protocols and cryptography standards.',
      'Coordinated incident response when our key management service unexpectedly went down: worked with Customer Support on outreach to affected customers, restored service with a same-day fix, ran the retro and led the resilience follow-up project to completion in two weeks.',
      'Onboarded and mentored engineers, including more senior engineers, on our Kotlin Multiplatform codebase and wallet recovery scheme.',
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
      'Led an 8-engineer team across iOS, Android, React web and Scala APIs to ship Collection Ads to millions of concurrent users: a 40% increase in click-through rate over single-media formats.',
      'Engineered the Multi-Destination Carousels format, which has generated hundreds of millions of dollars in revenue and a 20% increase in click-through rate.',
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
