

export interface Role {
  title: string;
  company: string;
  start: string;
  end?: string;
  location?: string;
  summary?: string;
  highlights?: string[];
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

export const experience: Role[] = [
  {
    title: 'Senior Software Engineer, Bitkey',
    company: 'Block',
    start: 'Jan 2023',
    summary:
      'Early member of the 0-to-1 Bitkey team, building the mobile app from alpha to general availability with Kotlin Multiplatform.',
    highlights: [
      'Designed and implemented high-stakes security features built on NFC, Bitcoin protocols and cryptography standards.',
      'Led the Bitkey Security Hub: a Compose Multiplatform dashboard that gives users a real-time view of their wallet’s security, surfacing alerts for cloud backups, firmware updates and previously hidden vulnerabilities.',
      'Kept development on pace for aggressive, hardware-integrated launch windows, shipping GA on a compressed timeline.',
    ],
  },
  {
    title: 'Senior Software Engineer, Android Tech Lead',
    company: 'Twitter',
    start: 'Jul 2020',
    end: 'Nov 2022',
    summary:
      'Tech lead for Ad Formats, responsible for end-to-end development of new formats and mentoring a team of engineers.',
    highlights: [
      'Led Collection Ads across iOS, Android, React web and Scala APIs, from ideation to release: a 40% increase in click-through rate over single-media formats.',
      'Engineered the Multi-Destination Carousels format, which has generated multi-million dollars in revenue and a 20% increase in click-through rate.',
      'Shepherded Unified Cards on Android, keeping the architecture consistent across the platform.',
    ],
  },
  {
    title: 'Software Engineer',
    company: 'Capital One',
    start: 'Jun 2019',
    end: 'Jul 2020',
    summary:
      'Built high-security debit account servicing features for the flagship Android consumer app in a cross-platform team.',
    highlights: [
      'Modernized the Account Ownership Change journey, migrating a legacy web experience into a native mobile flow.',
      'Developed modular, reactive features with Kotlin coroutines and Flow, and contributed to internal shared libraries.',
    ],
  },
  {
    title: 'Software Engineer',
    company: 'Johnson & Johnson',
    start: 'Jul 2015',
    end: 'Jun 2019',
    summary: 'Developed and iterated on applications for R&D trials and commercial patient studies.',
    highlights: [
      'Led the Zyrtec AllergyCast relaunch pilot as an Android and iOS app.',
      'Built features for the BabyCenter Pregnancy Tracker, including in-app notifications and picture-in-picture video, while maintaining a 4.7 Play Store rating.',
      'Integrated React Native into Pregnancy Tracker, turning the web-view community experience into a cross-platform native one.',
    ],
  },
];

export const education: Education[] = [
  { school: 'New Jersey Institute of Technology', degree: 'B.S. in Computer Science', end: '2015' },
  { school: 'Hong Kong Polytechnic University', degree: 'Study abroad', end: 'Fall 2014' },
];

export const skills: SkillGroup[] = [
  {
    group: 'Mobile',
    items: ['Android', 'Kotlin', 'Kotlin Multiplatform', 'Compose Multiplatform', 'Coroutines & Flow', 'RxJava', 'React Native'],
  },
  { group: 'Security & Bitcoin', items: ['Rust', 'Bitcoin', 'Cryptography', 'NFC'] },
  { group: 'Tools', items: ['Docker', 'Git', 'Jenkins'] },
];

export const currentRole = experience.find((role) => !role.end);
